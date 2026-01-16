import { Router } from 'express';
import {
  getProjectByVideoId,
  updateProject,
  rerenderProject,
} from './editor.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

// Protected routes
router.get('/project/:videoId', authenticate, getProjectByVideoId);
router.patch('/project/:videoId', authenticate, updateProject);
router.post('/project/:videoId/rerender', authenticate, rerenderProject);

export default router;
