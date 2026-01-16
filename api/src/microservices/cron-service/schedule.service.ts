import CronSchedule, { ICronSchedule } from './schedule.model';

export class ScheduleService {
  // Convert interval and time to cron expression
  static intervalToCronExpression(interval: string, customInterval?: number, hour?: number, minute?: number, dayOfWeek?: number, dayOfMonth?: number): string {
    switch (interval) {
      case 'minutes':
        return customInterval ? `*/${Math.min(customInterval, 59)} * * * *` : '*/5 * * * *';
      case 'hourly':
        return customInterval ? `0 */${Math.min(customInterval, 23)} * * *` : '0 * * * *';
      case 'daily':
        return `${minute || 0} ${hour || 1} * * *`;
      case 'weekly':
        return `${minute || 0} ${hour || 3} * * ${dayOfWeek || 0}`;
      case 'monthly':
        return `${minute || 0} ${hour || 2} ${dayOfMonth || 1} * *`;
      case 'custom':
        return customInterval ? `*/${Math.min(customInterval, 59)} * * * *` : `${minute || 0} ${hour || 1} * * *`;
      default:
        return `${minute || 0} ${hour || 1} * * *`;
    }
  }

  // Get next run time for a cron expression
  static getNextRunTime(cronExpression: string): Date {
    // This is a simplified version - in production you'd use a proper cron parser
    const now = new Date();
    const nextRun = new Date(now);
    
    // Simple calculation for common intervals
    if (cronExpression.includes('*/5 * * * *')) {
      nextRun.setMinutes(Math.ceil(now.getMinutes() / 5) * 5);
    } else if (cronExpression.includes('0 * * * *')) {
      nextRun.setHours(now.getHours() + 1);
      nextRun.setMinutes(0);
    } else if (cronExpression.includes('0 1 * * *')) {
      nextRun.setDate(now.getDate() + 1);
      nextRun.setHours(1);
      nextRun.setMinutes(0);
    } else if (cronExpression.includes('0 3 * * 0')) {
      const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
      nextRun.setDate(now.getDate() + daysUntilSunday);
      nextRun.setHours(3);
      nextRun.setMinutes(0);
    } else if (cronExpression.includes('0 2 1 * *')) {
      nextRun.setMonth(now.getMonth() + 1);
      nextRun.setDate(1);
      nextRun.setHours(2);
      nextRun.setMinutes(0);
    } else {
      // Parse custom time expressions
      const parts = cronExpression.split(' ');
      if (parts.length >= 2) {
        const minute = parseInt(parts[0]);
        const hour = parseInt(parts[1]);
        
        if (!isNaN(minute) && !isNaN(hour)) {
          // For daily schedules
          if (parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
            if (now.getHours() < hour || (now.getHours() === hour && now.getMinutes() < minute)) {
              nextRun.setHours(hour);
              nextRun.setMinutes(minute);
            } else {
              nextRun.setDate(now.getDate() + 1);
              nextRun.setHours(hour);
              nextRun.setMinutes(minute);
            }
          }
          // For weekly schedules
          else if (parts[2] === '*' && parts[3] === '*' && parts[4] !== '*') {
            const targetDay = parseInt(parts[4]);
            const currentDay = now.getDay();
            let daysUntilTarget = targetDay - currentDay;
            if (daysUntilTarget <= 0) daysUntilTarget += 7;
            nextRun.setDate(now.getDate() + daysUntilTarget);
            nextRun.setHours(hour);
            nextRun.setMinutes(minute);
          }
          // For monthly schedules
          else if (parts[2] !== '*' && parts[3] === '*') {
            const targetDay = parseInt(parts[2]);
            if (now.getDate() <= targetDay) {
              nextRun.setDate(targetDay);
            } else {
              nextRun.setMonth(now.getMonth() + 1);
              nextRun.setDate(targetDay);
            }
            nextRun.setHours(hour);
            nextRun.setMinutes(minute);
          }
        }
      }
    }
    
    return nextRun;
  }

  // Create or update schedule
  static async upsertSchedule(scheduleData: Partial<ICronSchedule>): Promise<ICronSchedule> {
    const { jobName, interval, customInterval, isActive, description, hour, minute, dayOfWeek, dayOfMonth } = scheduleData;
    
    if (!jobName || !interval || !description) {
      throw new Error('jobName, interval, and description are required');
    }

    const cronExpression = ScheduleService.intervalToCronExpression(interval, customInterval, hour, minute, dayOfWeek, dayOfMonth);
    const nextRun = ScheduleService.getNextRunTime(cronExpression);

    const schedule = await CronSchedule.findOneAndUpdate(
      { jobName },
      {
        cronExpression,
        interval,
        customInterval,
        hour,
        minute,
        dayOfWeek,
        dayOfMonth,
        isActive: isActive !== undefined ? isActive : true,
        description,
        nextRun,
      },
      { upsert: true, new: true, runValidators: true }
    );

    return schedule;
  }

  // Update schedule status
  static async updateScheduleStatus(jobName: string, isActive: boolean): Promise<ICronSchedule | null> {
    return await CronSchedule.findOneAndUpdate(
      { jobName },
      { isActive },
      { new: true }
    );
  }

  // Delete schedule
  static async deleteSchedule(jobName: string): Promise<boolean> {
    const result = await CronSchedule.deleteOne({ jobName });
    return result.deletedCount > 0;
  }

  // Update last run time
  static async updateLastRun(jobName: string): Promise<void> {
    const schedule = await CronSchedule.findOne({ jobName });
    if (schedule) {
      const nextRun = ScheduleService.getNextRunTime(schedule.cronExpression);
      await CronSchedule.updateOne(
        { jobName },
        { 
          lastRun: new Date(),
          nextRun
        }
      );
    }
  }

  // Get all schedules
  static async getAllSchedules(): Promise<ICronSchedule[]> {
    return await CronSchedule.find().sort({ jobName: 1 });
  }

  // Get schedule by job name
  static async getScheduleByJobName(jobName: string): Promise<ICronSchedule | null> {
    return await CronSchedule.findOne({ jobName });
  }

  // Get default schedules for initialization
  static getDefaultSchedules(): Partial<ICronSchedule>[] {
    return [
      {
        jobName: 'trendingAnime',
        interval: 'daily',
        description: 'Fetch trending anime from external sources',
      },
      {
        jobName: 'trendingManga', 
        interval: 'daily',
        description: 'Fetch trending manga from external sources',
      },
      {
        jobName: 'refresh',
        interval: 'hourly',
        description: 'Update content trend scores and rankings',
      },
      {
        jobName: 'genres',
        interval: 'weekly',
        description: 'Fetch top content by genres',
      },
    ];
  }
}
