import { Router } from 'express';
import {
  getAuthUrl,
  handleCallback,
  uploadToYouTube,
  getUploadById,
  getUploadByVideoId,
  getAllUploads,
} from './youtube.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

// Protected routes
router.get('/auth-url', authenticate, getAuthUrl);
router.get('/callback', handleCallback);
router.post('/upload', authenticate, uploadToYouTube);
router.get('/', authenticate, getAllUploads);
router.get('/:id', authenticate, getUploadById);
router.get('/video/:videoId', authenticate, getUploadByVideoId);

export default router;
