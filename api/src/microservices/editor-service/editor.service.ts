import VideoProject, { IVideoProject } from './editor.model';
import { UpdateProjectInput } from './editor.validation';
import mongoose from 'mongoose';
import { RabbitMQService } from '../../libs/rabbitmq';

export class EditorService {
  private rabbitMQ: RabbitMQService;

  constructor() {
    this.rabbitMQ = new RabbitMQService();
  }

  async getProjectByVideoId(videoId: string): Promise<IVideoProject | null> {
    return await VideoProject.findOne({ videoId: new mongoose.Types.ObjectId(videoId) })
      .populate('videoId', 'episodeId type status')
      .populate('playlistId', 'title')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
  }

  async createOrUpdateProject(
    videoId: string,
    userId: string,
    data?: Partial<UpdateProjectInput>
  ): Promise<IVideoProject> {
    const videoIdObj = new mongoose.Types.ObjectId(videoId);
    const userIdObj = new mongoose.Types.ObjectId(userId);

    let project = await VideoProject.findOne({ videoId: videoIdObj });

    if (!project) {
      // Auto-create default project if it doesn't exist
      const defaultProjectJson = await this.createDefaultProjectJson(videoId);
      
      project = new VideoProject({
        videoId: videoIdObj,
        title: `Video Project ${videoId}`,
        orientation: 'vertical',
        status: 'DRAFT_READY',
        projectJson: defaultProjectJson,
        createdBy: userIdObj,
        updatedBy: userIdObj,
      });
    } else {
      // Update existing project
      if (data?.title) project.title = data.title;
      if (data?.projectJson) project.projectJson = data.projectJson;
      if (data?.status) project.status = data.status;
      project.updatedBy = userIdObj;
    }

    return await project.save();
  }

  async updateProject(
    videoId: string,
    userId: string,
    data: UpdateProjectInput
  ): Promise<IVideoProject | null> {
    const updateData: any = {
      ...data,
      updatedBy: new mongoose.Types.ObjectId(userId),
    };

    return await VideoProject.findOneAndUpdate(
      { videoId: new mongoose.Types.ObjectId(videoId) },
      updateData,
      { new: true, runValidators: true }
    ).populate('videoId', 'episodeId type status')
     .populate('playlistId', 'title')
     .populate('createdBy', 'name email')
     .populate('updatedBy', 'name email');
  }

  async rerenderProject(videoId: string, userId: string): Promise<IVideoProject | null> {
    const project = await VideoProject.findOne({ 
      videoId: new mongoose.Types.ObjectId(videoId) 
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Update video status to AI_PROCESSING
    const Video = mongoose.model('Video');
    await Video.findByIdAndUpdate(videoId, { status: 'AI_PROCESSING' });

    // Send rerender job to RabbitMQ
    await this.sendRerenderJob({
      videoId,
      orientation: project.orientation,
      projectJson: project.projectJson,
      voiceAudioUrl: await this.getVoiceAudioUrl(videoId),
    });

    // Update project status
    project.updatedBy = new mongoose.Types.ObjectId(userId);
    return await project.save();
  }

  async deleteProject(videoId: string): Promise<boolean> {
    const result = await VideoProject.findOneAndDelete({ 
      videoId: new mongoose.Types.ObjectId(videoId) 
    });
    return !!result;
  }

  async getAllProjects(status?: string): Promise<IVideoProject[]> {
    const query: any = {};
    if (status) query.status = status;
    
    return await VideoProject.find(query)
      .populate('videoId', 'episodeId type status')
      .populate('playlistId', 'title')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ updatedAt: -1 });
  }

  private async createDefaultProjectJson(videoId: string): Promise<any> {
    // Get video details to create default project
    const Video = mongoose.model('Video');
    const video = await Video.findById(videoId)
      .populate('episodeId')
      .populate('scriptId')
      .populate('voiceId');

    if (!video) {
      throw new Error('Video not found');
    }

    const episode = video.get('episodeId');
    const script = video.get('scriptId');
    const voice = video.get('voiceId');

    // Create default project structure
    const scriptContent = script?.get('content') || '';
    const scenes = this.parseScriptIntoScenes(scriptContent);
    
    return {
      title: episode?.get('title') || 'Untitled Video',
      orientation: video.get('orientation'),
      scenes: scenes.map((scene, index) => ({
        sceneId: `scene-${index + 1}`,
        start: index * 5,
        end: (index + 1) * 5,
        image: `/uploads/images/default-${video.get('orientation')}-${index + 1}.jpg`,
        text: scene.text,
        caption: scene.caption,
        style: {
          fontSize: video.get('orientation') === 'vertical' ? 24 : 32,
          x: video.get('orientation') === 'vertical' ? 50 : 100,
          y: video.get('orientation') === 'vertical' ? 300 : 200,
        },
      })),
      audio: {
        voice: voice?.get('audioUrl') || '',
        bgm: '/uploads/audio/default-bgm.mp3',
        bgmVolume: 0.3,
      },
    };
  }

  private parseScriptIntoScenes(scriptContent: string): Array<{ text: string; caption: string }> {
    const paragraphs = scriptContent.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => ({
      text: paragraph.trim(),
      caption: `Scene ${index + 1}`,
    }));
  }

  private async getVoiceAudioUrl(videoId: string): Promise<string> {
    const Video = mongoose.model('Video');
    const video = await Video.findById(videoId).populate('voiceId');
    
    if (!video) {
      throw new Error('Video not found');
    }
    
    return video.get('voiceId')?.get('audioUrl') || '';
  }

  private async sendRerenderJob(payload: any): Promise<void> {
    try {
      await this.rabbitMQ.sendToQueue('video-render', payload);
    } catch (error) {
      console.error('Failed to send rerender job:', error);
      throw error;
    }
  }
}
