import { Router } from 'express';
import {
  createCollection,
  getAllCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
} from './collection.controller';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/permission';

const router = Router();

// Public routes
router.get('/', getAllCollections);
router.get('/:id', getCollectionById);

// Admin only routes
router.post('/', authenticate, requireRole('admin'), createCollection);
router.patch('/:id', authenticate, requireRole('admin'), updateCollection);
router.delete('/:id', authenticate, requireRole('admin'), deleteCollection);

export default router;
