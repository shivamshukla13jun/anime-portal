import { Router } from 'express';
import {
  runJobNow,
  getJobStatus,
  startAllJobs,
  stopAllJobs,
  getAllSchedules,
  updateSchedule,
  toggleScheduleStatus,
  initializeDefaultSchedules,
} from './cron.controller';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/permission';

const router = Router();

// Admin only routes
router.post('/run-now', authenticate, requireRole('admin'), runJobNow);
router.get('/status', authenticate, requireRole('admin'), getJobStatus);
router.post('/start', authenticate, requireRole('admin'), startAllJobs);
router.post('/stop', authenticate, requireRole('admin'), stopAllJobs);

// Schedule management routes
router.get('/schedules', authenticate, requireRole('admin'), getAllSchedules);
router.post('/schedules/initialize', authenticate, requireRole('admin'), initializeDefaultSchedules);
router.patch('/schedules/:jobName', authenticate, requireRole('admin'), updateSchedule);
router.patch('/schedules/:jobName/toggle', authenticate, requireRole('admin'), toggleScheduleStatus);

export default router;
