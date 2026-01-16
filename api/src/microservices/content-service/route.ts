import { Router } from 'express';
import {
  getAllContent,
  getContentById,
  getTrendingContent,
  getContentByGenre,
  createContent,
  updateContent,
  deleteContent,
  publishContent,
  unpublishContent,
} from './content.controller';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/permission';

const router = Router();

// Public routes
router.get('/', authenticate, getAllContent);
router.get('/trending', authenticate, getTrendingContent);
router.get('/genre/:genre', authenticate, getContentByGenre);
router.get('/:id', authenticate, getContentById);

// Admin only routes
router.post('/', authenticate, requireRole('admin'), createContent);
router.patch('/:id', authenticate, requireRole('admin'), updateContent);
router.delete('/:id', authenticate, requireRole('admin'), deleteContent);
router.patch('/:id/publish', authenticate, requireRole('admin'), publishContent);
router.patch('/:id/unpublish', authenticate, requireRole('admin'), unpublishContent);

export default router;
