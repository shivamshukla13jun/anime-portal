import mongoose, { Document, Schema } from 'mongoose';

export type VideoType = 'short' | 'long';
export type VideoOrientation = 'vertical' | 'horizontal';
export type VideoStatus = 'AI_PROCESSING' | 'DRAFT_READY' | 'IN_REVIEW' | 'FINAL_APPROVED' | 'PUBLISHED' | 'FAILED';

export interface IVideo extends Document {
  episodeId: mongoose.Types.ObjectId;
  scriptId: mongoose.Types.ObjectId;
  voiceId: mongoose.Types.ObjectId;
  type: VideoType;
  orientation: VideoOrientation;
  videoUrl?: string;
  thumbnailUrl?: string;
  status: VideoStatus;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<IVideo>({
  episodeId: {
    type: Schema.Types.ObjectId,
    ref: 'Episode',
    required: true,
  },
  scriptId: {
    type: Schema.Types.ObjectId,
    ref: 'Script',
    required: true,
  },
  voiceId: {
    type: Schema.Types.ObjectId,
    ref: 'Voice',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['short', 'long'],
  },
  orientation: {
    type: String,
    required: true,
    enum: ['vertical', 'horizontal'],
  },
  videoUrl: {
    type: String,
  },
  thumbnailUrl: {
    type: String,
  },
  status: {
    type: String,
    required: true,
    enum: ['AI_PROCESSING', 'DRAFT_READY', 'IN_REVIEW', 'FINAL_APPROVED', 'PUBLISHED', 'FAILED'],
    default: 'AI_PROCESSING',
  },
  error: {
    type: String,
  },
}, {
  timestamps: true,
});

videoSchema.index({ episodeId: 1 });
videoSchema.index({ status: 1 });
videoSchema.index({ type: 1 });
videoSchema.index({ playlistId: 1 });

const Video = mongoose.model<IVideo>('Video', videoSchema);
export default Video;
