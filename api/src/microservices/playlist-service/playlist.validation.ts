import { z } from 'zod';

export const createPlaylistSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  categoryId: z.string().min(1, 'Category ID is required'),
  collectionId: z.string().optional(),
  posterUrl: z.string().url('Invalid poster URL'),
  type: z.enum(['anime', 'manga', 'movie', 'show', 'webseries', 'shorts']),
});

export const updatePlaylistSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long').optional(),
  categoryId: z.string().min(1, 'Category ID is required').optional(),
  collectionId: z.string().optional(),
  posterUrl: z.string().url('Invalid poster URL').optional(),
  type: z.enum(['anime', 'manga', 'movie', 'show', 'webseries', 'shorts']).optional(),
});

export type CreatePlaylistInput = z.infer<typeof createPlaylistSchema>;
export type UpdatePlaylistInput = z.infer<typeof updatePlaylistSchema>;
