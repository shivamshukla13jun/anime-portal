import Video, { IVideo, VideoStatus } from './video.model';
import { GenerateVideoInput } from './video.validation';
import mongoose from 'mongoose';
import { RabbitMQService } from '../../libs/rabbitmq';

export class VideoService {
  private rabbitMQ: RabbitMQService;

  constructor() {
    this.rabbitMQ = new RabbitMQService();
  }

  async generateVideo(data: GenerateVideoInput): Promise<IVideo> {
    // Check if video already exists for this episode
    const existingVideo = await Video.findOne({ 
      episodeId: new mongoose.Types.ObjectId(data.episodeId) 
    });
    
    if (existingVideo) {
      throw new Error('Video already exists for this episode');
    }

    // Get episode, script, and voice details
    const Episode = mongoose.model('Episode');
    const Script = mongoose.model('Script');
    const Voice = mongoose.model('Voice');

    const [episode, script, voice] = await Promise.all([
      Episode.findById(data.episodeId).populate('playlistId'),
      Script.findById(data.scriptId),
      Voice.findById(data.voiceId),
    ]);

    if (!episode || !script || !voice) {
      throw new Error('Episode, script, or voice not found');
    }

    // Create video record with AI_PROCESSING status
    const video = new Video({
      episodeId: new mongoose.Types.ObjectId(data.episodeId),
      scriptId: new mongoose.Types.ObjectId(data.scriptId),
      voiceId: new mongoose.Types.ObjectId(data.voiceId),
      type: episode.get('type'),
      orientation: data.orientation,
      status: 'AI_PROCESSING',
    });

    const savedVideo = await video.save();

    // Create default project JSON for the video
    const projectJson = await this.createDefaultProjectJson(
      episode,
      script,
      voice,
      data.orientation
    );

    // Send job to RabbitMQ queue for video rendering
    await this.sendVideoRenderJob({
      videoId: savedVideo._id.toString(),
      orientation: data.orientation,
      projectJson,
      voiceAudioUrl: voice.get('audioUrl'),
    });

    return savedVideo;
  }

  async getVideoById(id: string): Promise<IVideo | null> {
    return await Video.findById(id)
      .populate('episodeId', 'title episodeNumber type')
      .populate('scriptId', 'content style duration')
      .populate('voiceId', 'audioUrl durationSeconds provider');
  }

  async getAllVideos(
    status?: VideoStatus,
    playlistId?: string,
    type?: string
  ): Promise<IVideo[]> {
    const query: any = {};
    
    if (status) query.status = status;
    if (type) query.type = type;
    
    if (playlistId) {
      // Get episodes by playlistId and then find videos
      const Episode = mongoose.model('Episode');
      const episodes = await Episode.find({ 
        playlistId: new mongoose.Types.ObjectId(playlistId) 
      }).select('_id');
      
      query.episodeId = { $in: episodes.map(e => e._id) };
    }
    
    return await Video.find(query)
      .populate('episodeId', 'title episodeNumber type')
      .populate('scriptId', 'content style duration')
      .populate('voiceId', 'audioUrl durationSeconds provider')
      .sort({ createdAt: -1 });
  }

  async updateVideoStatus(id: string, status: VideoStatus, videoUrl?: string, thumbnailUrl?: string, error?: string): Promise<IVideo | null> {
    const updateData: any = { status };
    
    if (videoUrl) updateData.videoUrl = videoUrl;
    if (thumbnailUrl) updateData.thumbnailUrl = thumbnailUrl;
    if (error) updateData.error = error;
    
    return await Video.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('episodeId', 'title episodeNumber type')
      .populate('scriptId', 'content style duration')
      .populate('voiceId', 'audioUrl durationSeconds provider');
  }

  async deleteVideo(id: string): Promise<boolean> {
    const result = await Video.findByIdAndDelete(id);
    return !!result;
  }

  async getPublishedVideos(type?: 'short' | 'long'): Promise<IVideo[]> {
    const query: any = { status: 'PUBLISHED' };
    if (type) query.type = type;
    
    return await Video.find(query)
      .populate('episodeId', 'title episodeNumber type')
      .populate('scriptId', 'content style duration')
      .populate('voiceId', 'audioUrl durationSeconds provider')
      .sort({ createdAt: -1 });
  }

  private async createDefaultProjectJson(
    episode: any,
    script: any,
    voice: any,
    orientation: string
  ): Promise<any> {
    // Create a default video project structure
    const scriptContent = script.get('content');
    const scenes = this.parseScriptIntoScenes(scriptContent);
    
    return {
      title: episode.get('title'),
      orientation,
      scenes: scenes.map((scene, index) => ({
        sceneId: `scene-${index + 1}`,
        start: index * 5, // 5 seconds per scene
        end: (index + 1) * 5,
        image: `/uploads/images/default-${orientation}-${index + 1}.jpg`,
        text: scene.text,
        caption: scene.caption,
        style: {
          fontSize: orientation === 'vertical' ? 24 : 32,
          x: orientation === 'vertical' ? 50 : 100,
          y: orientation === 'vertical' ? 300 : 200,
        },
      })),
      audio: {
        voice: voice.get('audioUrl'),
        bgm: '/uploads/audio/default-bgm.mp3',
        bgmVolume: 0.3,
      },
    };
  }

  private parseScriptIntoScenes(scriptContent: string): Array<{ text: string; caption: string }> {
    // Simple script parsing - split by paragraphs or sections
    const paragraphs = scriptContent.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => ({
      text: paragraph.trim(),
      caption: `Scene ${index + 1}`,
    }));
  }

  private async sendVideoRenderJob(payload: any): Promise<void> {
    try {
      await this.rabbitMQ.sendToQueue('video-render', payload);
    } catch (error) {
      console.error('Failed to send video render job:', error);
      throw error;
    }
  }
}
