import mongoose, { Document, Schema } from 'mongoose';

export type VoiceProvider = 'google' | 'elevenlabs' | 'polly';

export interface IVoice extends Document {
  scriptId: mongoose.Types.ObjectId;
  provider: VoiceProvider;
  audioUrl: string;
  durationSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

const voiceSchema = new Schema<IVoice>({
  scriptId: {
    type: Schema.Types.ObjectId,
    ref: 'Script',
    required: true,
    unique: true,
  },
  provider: {
    type: String,
    required: true,
    enum: ['google', 'elevenlabs', 'polly'],
  },
  audioUrl: {
    type: String,
    required: true,
  },
  durationSeconds: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  timestamps: true,
});

voiceSchema.index({ scriptId: 1 }, { unique: true });

const Voice = mongoose.model<IVoice>('Voice', voiceSchema);
export default Voice;
