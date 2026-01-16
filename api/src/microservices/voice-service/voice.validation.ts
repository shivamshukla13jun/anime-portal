import { z } from 'zod';

export const generateVoiceSchema = z.object({
  scriptId: z.string().min(1, 'Script ID is required'),
  provider: z.enum(['google', 'elevenlabs', 'polly']),
});

export type GenerateVoiceInput = z.infer<typeof generateVoiceSchema>;
