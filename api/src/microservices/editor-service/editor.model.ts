import mongoose, { Document, Schema } from 'mongoose';

export type ProjectStatus = 'DRAFT_READY' | 'IN_REVIEW' | 'FINAL_APPROVED' | 'PUBLISHED';

export interface IVideoProject extends Document {
  videoId: mongoose.Types.ObjectId;
  playlistId?: mongoose.Types.ObjectId;
  title: string;
  orientation: 'vertical' | 'horizontal';
  status: ProjectStatus;
  projectJson: any;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const videoProjectSchema = new Schema<IVideoProject>({
  videoId: {
    type: Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
    unique: true,
  },
  playlistId: {
    type: Schema.Types.ObjectId,
    ref: 'Playlist',
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  orientation: {
    type: String,
    required: true,
    enum: ['vertical', 'horizontal'],
  },
  status: {
    type: String,
    required: true,
    enum: ['DRAFT_READY', 'IN_REVIEW', 'FINAL_APPROVED', 'PUBLISHED'],
    default: 'DRAFT_READY',
  },
  projectJson: {
    type: Schema.Types.Mixed,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

videoProjectSchema.index({ videoId: 1 }, { unique: true });
videoProjectSchema.index({ status: 1 });
videoProjectSchema.index({ playlistId: 1 });

const VideoProject = mongoose.model<IVideoProject>('VideoProject', videoProjectSchema);
export default VideoProject;
