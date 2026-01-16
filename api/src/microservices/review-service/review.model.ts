import mongoose, { Document, Schema } from 'mongoose';

export type ReviewAction = 'APPROVED' | 'REJECTED';

export interface IReviewLog extends Document {
  videoId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  action: ReviewAction;
  note?: string;
  createdAt: Date;
}

const reviewLogSchema = new Schema<IReviewLog>({
  videoId: {
    type: Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
  },
  reviewerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['APPROVED', 'REJECTED'],
  },
  note: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

reviewLogSchema.index({ videoId: 1 });
reviewLogSchema.index({ reviewerId: 1 });
reviewLogSchema.index({ action: 1 });

const ReviewLog = mongoose.model<IReviewLog>('ReviewLog', reviewLogSchema);
export default ReviewLog;
