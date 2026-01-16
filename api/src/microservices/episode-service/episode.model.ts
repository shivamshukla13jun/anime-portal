import mongoose, { Document, Schema } from 'mongoose';

export type EpisodeType = 'short' | 'long';
export type EpisodeStatus = 'draft' | 'published';

export interface IEpisode extends Document {
  playlistId: mongoose.Types.ObjectId;
  episodeNumber: number;
  title: string;
  type: EpisodeType;
  status: EpisodeStatus;
  videoId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const episodeSchema = new Schema<IEpisode>({
  playlistId: {
    type: Schema.Types.ObjectId,
    ref: 'Playlist',
    required: true,
  },
  episodeNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['short', 'long'],
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  videoId: {
    type: Schema.Types.ObjectId,
    ref: 'Video',
  },
}, {
  timestamps: true,
});

episodeSchema.index({ playlistId: 1, episodeNumber: 1 }, { unique: true });
episodeSchema.index({ status: 1 });
episodeSchema.index({ type: 1 });

const Episode = mongoose.model<IEpisode>('Episode', episodeSchema);
export default Episode;
