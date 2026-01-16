import mongoose, { Document, Schema } from 'mongoose';

export interface IYouTubeUpload extends Document {
  videoId: mongoose.Types.ObjectId;
  youtubeVideoId?: string;
  title: string;
  description: string;
  tags: string[];
  visibility: 'public' | 'private' | 'unlisted';
  status: 'pending' | 'uploaded' | 'failed';
  error?: string;
  uploadedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const youtubeUploadSchema = new Schema<IYouTubeUpload>({
  videoId: {
    type: Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
    unique: true,
  },
  youtubeVideoId: {
    type: String,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  visibility: {
    type: String,
    required: true,
    enum: ['public', 'private', 'unlisted'],
    default: 'public',
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'uploaded', 'failed'],
    default: 'pending',
  },
  error: {
    type: String,
  },
  uploadedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

youtubeUploadSchema.index({ videoId: 1 }, { unique: true });
youtubeUploadSchema.index({ status: 1 });

const YouTubeUpload = mongoose.model<IYouTubeUpload>('YouTubeUpload', youtubeUploadSchema);
export default YouTubeUpload;
