import { z } from 'zod';

export const generateVideoSchema = z.object({
  episodeId: z.string().min(1, 'Episode ID is required'),
  scriptId: z.string().min(1, 'Script ID is required'),
  voiceId: z.string().min(1, 'Voice ID is required'),
  orientation: z.enum(['vertical', 'horizontal']),
});

export type GenerateVideoInput = z.infer<typeof generateVideoSchema>;
