import mongoose, { Document, Schema } from 'mongoose';

export type PlaylistType = 'anime' | 'manga' | 'movie' | 'show' | 'webseries' | 'shorts';

export interface IPlaylist extends Document {
  title: string;
  description: string;
  categoryId: mongoose.Types.ObjectId;
  collectionId?: mongoose.Types.ObjectId;
  posterUrl: string;
  type: PlaylistType;
  createdAt: Date;
  updatedAt: Date;
}

const playlistSchema = new Schema<IPlaylist>({
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
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  collectionId: {
    type: Schema.Types.ObjectId,
    ref: 'Collection',
  },
  posterUrl: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['anime', 'manga', 'movie', 'show', 'webseries', 'shorts'],
  },
}, {
  timestamps: true,
});

playlistSchema.index({ categoryId: 1 });
playlistSchema.index({ collectionId: 1 });
playlistSchema.index({ type: 1 });

const Playlist = mongoose.model<IPlaylist>('Playlist', playlistSchema);
export default Playlist;
