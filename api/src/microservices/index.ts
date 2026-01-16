import { Router } from 'express';

// Import all service routes
import categoryRoutes from './category-service/route';
import collectionRoutes from './collection-service/route';
import playlistRoutes from './playlist-service/route';
import episodeRoutes from './episode-service/route';
import contentRoutes from './content-service/route';
import cronRoutes from './cron-service/route';
import scriptRoutes from './script-service/route';
import voiceRoutes from './voice-service/route';
import videoRoutes from './video-service/route';
import editorRoutes from './editor-service/route';
import reviewRoutes from './review-service/route';
import youtubeRoutes from './youtube-service/route';

const router = Router();

// Mount all routes
router.use('/categories', categoryRoutes);
router.use('/collections', collectionRoutes);
router.use('/playlists', playlistRoutes);
router.use('/episodes', episodeRoutes);
router.use('/content', contentRoutes);
router.use('/cron', cronRoutes);
router.use('/scripts', scriptRoutes);
router.use('/voice', voiceRoutes);
router.use('/videos', videoRoutes);
router.use('/editor', editorRoutes);
router.use('/review', reviewRoutes);
router.use('/youtube', youtubeRoutes);

export default router;
