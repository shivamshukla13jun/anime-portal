import mongoose from 'mongoose';
import { RabbitMQService } from '../libs/rabbitmq';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/anime-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as any).then(() => {
  console.log('Connected to MongoDB in worker');
}).catch((error) => {
  console.error('Failed to connect to MongoDB in worker:', error);
  process.exit(1);
});

// Models
const Video = mongoose.model('Video');
const VideoProject = mongoose.model('VideoProject');

class VideoRenderWorker {
  public rabbitMQ: RabbitMQService;
  private isProcessing: boolean = false;

  constructor() {
    this.rabbitMQ = new RabbitMQService();
  }

  async start(): Promise<void> {
    try {
      await this.rabbitMQ.connect();
      console.log('Video render worker started');
      
      await this.rabbitMQ.consumeQueue('video-render', async (message) => {
        if (this.isProcessing) {
          console.log('Worker is busy, requeuing message...');
          // In a real implementation, you might want to requeue with delay
          return;
        }

        await this.processVideoRenderJob(message);
      });
    } catch (error) {
      console.error('Failed to start video render worker:', error);
      process.exit(1);
    }
  }

  private async processVideoRenderJob(payload: any): Promise<void> {
    this.isProcessing = true;
    
    try {
      const { videoId, orientation, projectJson, voiceAudioUrl } = payload;
      console.log(`Processing video render job for video ${videoId}`);

      // Update video status to AI_PROCESSING
      await Video.findByIdAndUpdate(videoId, { status: 'AI_PROCESSING' });

      // Ensure upload directories exist
      const uploadsDir = path.join(process.cwd(), 'uploads', 'videos');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate output file path
      const outputFileName = `${videoId}.mp4`;
      const outputPath = path.join(uploadsDir, outputFileName);

      // Create Remotion project files
      const projectDir = await this.createRemotionProject(videoId, projectJson, voiceAudioUrl);

      // Render video using Remotion
      await this.renderVideoWithRemotion(projectDir, outputPath, orientation);

      // Generate thumbnail
      const thumbnailPath = await this.generateThumbnail(outputPath, videoId);

      // Update video record with success
      await Video.findByIdAndUpdate(videoId, {
        status: 'DRAFT_READY',
        videoUrl: `/uploads/videos/${outputFileName}`,
        thumbnailUrl: thumbnailPath,
      });

      // Update project status
      await VideoProject.findOneAndUpdate(
        { videoId: new mongoose.Types.ObjectId(videoId) },
        { status: 'DRAFT_READY' }
      );

      console.log(`Successfully rendered video ${videoId}`);

      // Cleanup temporary project files
      await this.cleanupProject(projectDir);

    } catch (error) {
      console.error(`Failed to render video ${payload.videoId}:`, error);
      
      // Update video record with error
      await Video.findByIdAndUpdate(payload.videoId, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

    } finally {
      this.isProcessing = false;
    }
  }

  private async createRemotionProject(videoId: string, projectJson: any, voiceAudioUrl: string): Promise<string> {
    const projectDir = path.join(process.cwd(), 'temp', `remotion-project-${videoId}`);
    
    // Create project directory
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    // Create package.json for Remotion project
    const packageJson = {
      name: `remotion-project-${videoId}`,
      version: '1.0.0',
      scripts: {
        'render': 'remotion render src/index.js Video out.mp4',
      },
      dependencies: {
        'remotion': '^4.0.0',
      },
    };

    fs.writeFileSync(
      path.join(projectDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Create src directory
    const srcDir = path.join(projectDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });

    // Create index.ts
    const indexTs = `
import { Composition } from 'remotion';
import { Video } from './Video';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Video"
        component={Video}
        durationInFrames={${projectJson.scenes.length * 150}} // 5 seconds per scene at 30fps
        fps={30}
        width={${projectJson.orientation === 'vertical' ? 1080 : 1920}}
        height={${projectJson.orientation === 'vertical' ? 1920 : 1080}}
      />
    </>
  );
};
`;

    fs.writeFileSync(path.join(srcDir, 'index.ts'), indexTs);

    // Create Video component
    const videoComponent = `
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

const projectData = ${JSON.stringify(projectJson)};

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const currentTime = frame / fps;
  const currentScene = projectData.scenes.find(
    (scene: any) => currentTime >= scene.start && currentTime < scene.end
  );

  if (!currentScene) {
    return <div style={{ 
      width: '100%', 
      height: '100%', 
      backgroundColor: 'black',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px'
    }}>
      Loading...
    </div>;
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#000',
      backgroundImage: \`url(\${currentScene.image})\`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        left: \`\${currentScene.style.x}px\`,
        top: \`\${currentScene.style.y}px\`,
        color: 'white',
        fontSize: \`\${currentScene.style.fontSize}px\`,
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        maxWidth: '80%',
        textAlign: 'center',
      }}>
        {currentScene.text}
      </div>
      
      {currentScene.caption && (
        <div style={{
          position: 'absolute',
          bottom: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          fontSize: '18px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '10px 20px',
          borderRadius: '20px',
        }}>
          {currentScene.caption}
        </div>
      )}
    </div>
  );
};
`;

    fs.writeFileSync(path.join(srcDir, 'Video.ts'), videoComponent);

    return projectDir;
  }

  private async renderVideoWithRemotion(projectDir: string, outputPath: string, orientation: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`Starting Remotion render for ${projectDir}`);
      
      // Install dependencies
      const npmInstall = spawn('npm', ['install'], {
        cwd: projectDir,
        stdio: 'pipe',
      });

      npmInstall.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('Failed to install Remotion dependencies'));
          return;
        }

        // Run Remotion render
        const renderProcess = spawn('npx', [
          'remotion', 'render',
          'src/index.ts',
          'Video',
          outputPath,
          '--codec=h264',
          '--pixel-format=yuv420p',
        ], {
          cwd: projectDir,
          stdio: 'pipe',
        });

        renderProcess.stdout.on('data', (data) => {
          console.log(`Remotion stdout: ${data}`);
        });

        renderProcess.stderr.on('data', (data) => {
          console.error(`Remotion stderr: ${data}`);
        });

        renderProcess.on('close', (code) => {
          if (code === 0) {
            console.log(`Remotion render completed: ${outputPath}`);
            resolve();
          } else {
            reject(new Error(`Remotion render failed with code ${code}`));
          }
        });

        renderProcess.on('error', (error) => {
          reject(new Error(`Remotion process error: ${error.message}`));
        });
      });

      npmInstall.on('error', (error) => {
        reject(new Error(`NPM install error: ${error.message}`));
      });
    });
  }

  private async generateThumbnail(videoPath: string, videoId: string): Promise<string> {
    const thumbnailPath = path.join(process.cwd(), 'uploads', 'thumbnails', `${videoId}.jpg`);
    const thumbnailDir = path.dirname(thumbnailPath);
    
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', videoPath,
        '-ss', '00:00:01',
        '-vframes', '1',
        '-vf', 'scale=320:240',
        '-y',
        thumbnailPath,
      ]);

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(`/uploads/thumbnails/${videoId}.jpg`);
        } else {
          reject(new Error(`FFmpeg thumbnail generation failed with code ${code}`));
        }
      });

      ffmpeg.on('error', (error) => {
        reject(new Error(`FFmpeg error: ${error.message}`));
      });
    });
  }

  private async cleanupProject(projectDir: string): Promise<void> {
    try {
      fs.rmSync(projectDir, { recursive: true, force: true });
      console.log(`Cleaned up project directory: ${projectDir}`);
    } catch (error) {
      console.error(`Failed to cleanup project directory: ${error}`);
    }
  }
}

// Start the worker
const worker = new VideoRenderWorker();
worker.start().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down video render worker...');
  await worker.rabbitMQ.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down video render worker...');
  await worker.rabbitMQ.close();
  process.exit(0);
});
