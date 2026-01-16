import { Router } from 'express';
import {
  generateVoice,
  getVoiceById,
  getVoiceByScriptId,
} from './voice.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

// Protected routes
router.post('/generate', authenticate, generateVoice);
router.get('/:id', authenticate, getVoiceById);
router.get('/script/:scriptId', authenticate, getVoiceByScriptId);

export default router;
