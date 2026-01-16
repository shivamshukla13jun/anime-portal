import { Router } from 'express';
import {
  getReviewQueue,
  startReview,
  approveVideo,
  rejectVideo,
  getReviewHistory,
} from './review.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

// Protected routes
router.get('/queue', authenticate, getReviewQueue);
router.patch('/:videoId/start', authenticate, startReview);
router.patch('/:videoId/approve', authenticate, approveVideo);
router.patch('/:videoId/reject', authenticate, rejectVideo);
router.get('/:videoId/history', authenticate, getReviewHistory);

export default router;
