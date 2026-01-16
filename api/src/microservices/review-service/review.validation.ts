import { z } from 'zod';

export const approveVideoSchema = z.object({
  note: z.string().optional(),
  publishNow: z.boolean().default(false),
  autoUploadYoutube: z.boolean().default(false),
});

export const rejectVideoSchema = z.object({
  note: z.string().min(1, 'Rejection note is required'),
});

export type ApproveVideoInput = z.infer<typeof approveVideoSchema>;
export type RejectVideoInput = z.infer<typeof rejectVideoSchema>;
