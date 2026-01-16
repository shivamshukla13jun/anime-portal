import mongoose, { Document, Schema } from 'mongoose';

export type ContentType = 'anime' | 'manga' | 'movie' | 'show' | 'webseries' | 'shorts';
export type ContentSource = 'anilist' | 'jikan' | 'tmdb' | 'youtube' | 'manual';

export interface IContentItem extends Document {
  externalId: string;
  source: ContentSource;
  type: ContentType;
  title: string;
  synopsis: string;
  posterUrl: string;
  genres: string[];
  rating: number;
  popularity: number;
  releaseYear: number;
  trendScore: number;
  status: 'draft' | 'published' | 'archived';
  raw: any;
  createdAt: Date;
  updatedAt: Date;
}

const contentItemSchema = new Schema<IContentItem>({
  externalId: {
    type: String,
    required: true,
    trim: true,
  },
  source: {
    type: String,
    required: true,
    enum: ['anilist', 'jikan', 'tmdb', 'youtube', 'manual'],
  },
  type: {
    type: String,
    required: true,
    enum: ['anime', 'manga', 'movie', 'show', 'webseries', 'shorts'],
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  synopsis: {
    type: String,
    required: true,
    trim: true,
  },
  posterUrl: {
    type: String,
    required: true,
  },
  genres: [{
    type: String,
    trim: true,
  }],
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
  },
  popularity: {
    type: Number,
    required: true,
    min: 0,
  },
  releaseYear: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 10,
  },
  trendScore: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  raw: {
    type: Schema.Types.Mixed,
    required: true,
  },
}, {
  timestamps: true,
});

contentItemSchema.index({ externalId: 1, source: 1 }, { unique: true });
contentItemSchema.index({ type: 1 });
contentItemSchema.index({ source: 1 });
contentItemSchema.index({ trendScore: -1 });
contentItemSchema.index({ genres: 1 });
contentItemSchema.index({ releaseYear: -1 });

const ContentItem = mongoose.model<IContentItem>('ContentItem', contentItemSchema);
export default ContentItem;
