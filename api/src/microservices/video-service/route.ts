import { Router } from 'express';
import {
  generateVideo,
  getVideoById,
  getAllVideos,
  getPublishedVideos,
} from './video.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

// Public routes
router.get('/published', getPublishedVideos);

// Protected routes
router.post('/generate', authenticate, generateVideo);
router.get('/', authenticate, getAllVideos);
router.get('/:id', authenticate, getVideoById);

export default router;
