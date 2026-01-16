import { z } from 'zod';

export const generateScriptSchema = z.object({
  episodeId: z.string().min(1, 'Episode ID is required'),
  duration: z.enum(['short', 'long']),
  style: z.enum(['explained', 'top', 'review']),
});

export const updateScriptSchema = z.object({
  content: z.string().min(1, 'Content is required').optional(),
  status: z.enum(['DRAFT', 'APPROVED']).optional(),
});

export const approveScriptSchema = z.object({
  note: z.string().optional(),
});

export type GenerateScriptInput = z.infer<typeof generateScriptSchema>;
export type UpdateScriptInput = z.infer<typeof updateScriptSchema>;
export type ApproveScriptInput = z.infer<typeof approveScriptSchema>;
