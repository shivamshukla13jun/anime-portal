import { z } from 'zod';

export const createEpisodeSchema = z.object({
  playlistId: z.string().min(1, 'Playlist ID is required'),
  episodeNumber: z.number().int().min(1, 'Episode number must be at least 1'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  type: z.enum(['short', 'long']),
  status: z.enum(['draft', 'published']).default('draft'),
  videoId: z.string().optional(),
});

export const updateEpisodeSchema = z.object({
  playlistId: z.string().min(1, 'Playlist ID is required').optional(),
  episodeNumber: z.number().int().min(1, 'Episode number must be at least 1').optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  type: z.enum(['short', 'long']).optional(),
  status: z.enum(['draft', 'published']).optional(),
  videoId: z.string().optional(),
});

export type CreateEpisodeInput = z.infer<typeof createEpisodeSchema>;
export type UpdateEpisodeInput = z.infer<typeof updateEpisodeSchema>;
