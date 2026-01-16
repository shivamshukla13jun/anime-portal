import mongoose, { Document, Schema } from 'mongoose';

export type ScriptDuration = 'short' | 'long';
export type ScriptStyle = 'explained' | 'top' | 'review';
export type ScriptStatus = 'DRAFT' | 'APPROVED';

export interface IScript extends Document {
  episodeId: mongoose.Types.ObjectId;
  duration: ScriptDuration;
  style: ScriptStyle;
  content: string;
  status: ScriptStatus;
  createdAt: Date;
  updatedAt: Date;
}

const scriptSchema = new Schema<IScript>({
  episodeId: {
    type: Schema.Types.ObjectId,
    ref: 'Episode',
    required: true,
    unique: true,
  },
  duration: {
    type: String,
    required: true,
    enum: ['short', 'long'],
  },
  style: {
    type: String,
    required: true,
    enum: ['explained', 'top', 'review'],
  },
  content: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['DRAFT', 'APPROVED'],
    default: 'DRAFT',
  },
}, {
  timestamps: true,
});

scriptSchema.index({ episodeId: 1 }, { unique: true });
scriptSchema.index({ status: 1 });

const Script = mongoose.model<IScript>('Script', scriptSchema);
export default Script;
