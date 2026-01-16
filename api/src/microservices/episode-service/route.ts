import { Router } from 'express';
import {
  createEpisode,
  getAllEpisodes,
  getEpisodeById,
  updateEpisode,
  deleteEpisode,
} from './episode.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

// Public routes
router.get('/', getAllEpisodes);
router.get('/:id', getEpisodeById);

// Protected routes
router.post('/', authenticate, createEpisode);
router.patch('/:id', authenticate, updateEpisode);
router.delete('/:id', authenticate, deleteEpisode);

export default router;
