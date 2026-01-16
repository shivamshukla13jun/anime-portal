import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug too long'),
  type: z.enum(['anime', 'manga', 'movie', 'show', 'webseries', 'shorts']),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug too long').optional(),
  type: z.enum(['anime', 'manga', 'movie', 'show', 'webseries', 'shorts']).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
