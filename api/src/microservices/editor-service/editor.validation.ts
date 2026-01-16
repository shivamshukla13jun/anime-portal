import { z } from 'zod';

export const updateProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  projectJson: z.any().optional(),
  status: z.enum(['DRAFT_READY', 'IN_REVIEW', 'FINAL_APPROVED', 'PUBLISHED']).optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
