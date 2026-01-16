import { Router } from 'express';
import {
  createPlaylist,
  getAllPlaylists,
  getPlaylistById,
  updatePlaylist,
} from './playlist.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

// Public routes
router.get('/', getAllPlaylists);
router.get('/:id', getPlaylistById);

// Protected routes
router.post('/', authenticate, createPlaylist);
router.patch('/:id', authenticate, updatePlaylist);

export default router;
