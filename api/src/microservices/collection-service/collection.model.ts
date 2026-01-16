import mongoose, { Document, Schema } from 'mongoose';

export interface ICollection extends Document {
  title: string;
  categoryId: mongoose.Types.ObjectId;
  sortOrder: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const collectionSchema = new Schema<ICollection>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

collectionSchema.index({ categoryId: 1, sortOrder: 1 });
collectionSchema.index({ isFeatured: 1 });

const Collection = mongoose.model<ICollection>('Collection', collectionSchema);
export default Collection;
