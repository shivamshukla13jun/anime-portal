import { Request, Response, NextFunction } from 'express';
import { CronService } from './cron.service';
import { ScheduleService } from './schedule.service';
import { AppError } from '../../middlewares/error';

const cronService = new CronService();

export const runJobNow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { job } = req.body;
    
    if (!job || typeof job !== 'string') {
      throw new AppError('Job parameter is required', 400);
    }

    const validJobs = ['trendingAnime', 'trendingManga', 'refresh', 'genres'];
    if (!validJobs.includes(job)) {
      throw new AppError(`Invalid job. Valid jobs: ${validJobs.join(', ')}`, 400);
    }

    await cronService.runJobManually(job);
    
    res.status(200).json({
      success: true,
      message: `Job '${job}' executed successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = await cronService.getJobStatus();
    
    res.status(200).json({
      success: true,
      message: 'Job status retrieved successfully',
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

export const startAllJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await cronService.startAllJobs();
    
    res.status(200).json({
      success: true,
      message: 'All cron jobs started successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const stopAllJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    cronService.stopAllJobs();
    
    res.status(200).json({
      success: true,
      message: 'All cron jobs stopped successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Schedule management endpoints
export const getAllSchedules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const schedules = await ScheduleService.getAllSchedules();
    
    res.status(200).json({
      success: true,
      message: 'Schedules retrieved successfully',
      data: schedules,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { jobName } = req.params;
    const scheduleData = req.body;
    
    if (!jobName) {
      throw new AppError('Job name is required', 400);
    }

    await cronService.updateJobSchedule(jobName, scheduleData);
    
    res.status(200).json({
      success: true,
      message: `Schedule for job '${jobName}' updated successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleScheduleStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { jobName } = req.params;
    const { isActive } = req.body;
    
    if (!jobName || typeof isActive !== 'boolean') {
      throw new AppError('Job name and isActive status are required', 400);
    }

    await ScheduleService.updateScheduleStatus(jobName, isActive);
    
    res.status(200).json({
      success: true,
      message: `Schedule status for job '${jobName}' updated to ${isActive ? 'active' : 'inactive'}`,
    });
  } catch (error) {
    next(error);
  }
};

export const initializeDefaultSchedules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const defaultSchedules = ScheduleService.getDefaultSchedules();
    
    for (const schedule of defaultSchedules) {
      await ScheduleService.upsertSchedule(schedule);
    }
    
    res.status(200).json({
      success: true,
      message: 'Default schedules initialized successfully',
      data: defaultSchedules,
    });
  } catch (error) {
    next(error);
  }
};
