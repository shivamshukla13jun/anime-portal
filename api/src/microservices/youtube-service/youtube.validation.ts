import { z } from 'zod';

export const uploadToYouTubeSchema = z.object({
  videoId: z.string().min(1, 'Video ID is required'),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description too long'),
  tags: z.array(z.string().max(50, 'Tag too long')).max(50, 'Too many tags'),
  visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
});

export type UploadToYouTubeInput = z.infer<typeof uploadToYouTubeSchema>;
