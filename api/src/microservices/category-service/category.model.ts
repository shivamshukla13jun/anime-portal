import mongoose, { Document, Schema } from 'mongoose';

export type CategoryType = 'anime' | 'manga' | 'movie' | 'show' | 'webseries' | 'shorts';

export interface ICategory extends Document {
  name: string;
  slug: string;
  type: CategoryType;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['anime', 'manga', 'movie', 'show', 'webseries', 'shorts'],
  },
}, {
  timestamps: true,
});

categorySchema.index({ slug: 1 });
categorySchema.index({ type: 1 });

const Category = mongoose.model<ICategory>('Category', categorySchema);
export default Category;
