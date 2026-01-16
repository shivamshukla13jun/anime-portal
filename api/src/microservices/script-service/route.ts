import { Router } from 'express';
import {
  generateScript,
  getScriptById,
  updateScript,
  approveScript,
} from './script.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

// Protected routes
router.post('/generate', authenticate, generateScript);
router.get('/:id', authenticate, getScriptById);
router.patch('/:id', authenticate, updateScript);
router.patch('/:id/approve', authenticate, approveScript);

export default router;
