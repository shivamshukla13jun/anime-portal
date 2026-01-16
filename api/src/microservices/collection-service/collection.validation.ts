import { z } from 'zod';

export const createCollectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  categoryId: z.string().min(1, 'Category ID is required'),
  sortOrder: z.number().int().min(0, 'Sort order must be non-negative').default(0),
  isFeatured: z.boolean().default(false),
});

export const updateCollectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  categoryId: z.string().min(1, 'Category ID is required').optional(),
  sortOrder: z.number().int().min(0, 'Sort order must be non-negative').optional(),
  isFeatured: z.boolean().optional(),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
