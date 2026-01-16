import * as cron from 'node-cron';
import { ContentService } from '../content-service/content.service';
import { AniListService } from '../content-service/anilist.service';
import { ScheduleService } from './schedule.service';
import logger from '../../utils/logger';

export class CronService {
  private contentService: ContentService;
  private anilistService: AniListService;
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    this.contentService = new ContentService();
    this.anilistService = new AniListService();
  }

  async startAllJobs(): Promise<void> {
    // Stop all existing jobs first
    this.stopAllJobs();
    
    // Get all active schedules from database
    const schedules = await ScheduleService.getAllSchedules();
    
    for (const schedule of schedules) {
      if (schedule.isActive) {
        this.startJob(schedule);
      }
    }
    
    logger.info(`Started ${this.jobs.size} cron jobs`);
  }

  stopAllJobs(): void {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Cron job '${name}' stopped`);
    });
    this.jobs.clear();
  }

  private startJob(schedule: any): void {
    const job = cron.schedule(schedule.cronExpression, async () => {
      logger.info(`Running job: ${schedule.jobName}`);
      try {
        await this.runJobManually(schedule.jobName);
        await ScheduleService.updateLastRun(schedule.jobName);
        logger.info(`Job '${schedule.jobName}' completed successfully`);
      } catch (error) {
        logger.error(`Job '${schedule.jobName}' failed:`, error);
      }
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    this.jobs.set(schedule.jobName, job);
    job.start();
    logger.info(`Started job '${schedule.jobName}' with schedule: ${schedule.cronExpression}`);
  }

  async runJobManually(jobName: string): Promise<void> {
    logger.info(`Manually running job: ${jobName}`);
    
    switch (jobName) {
      case 'trendingAnime':
        await this.fetchTrendingAnime();
        break;
      case 'trendingManga':
        await this.fetchTrendingManga();
        break;
      case 'refresh':
        await this.contentService.updateTrendScores();
        break;
      case 'genres':
        const genres = ['action', 'romance', 'comedy', 'thriller', 'fantasy'];
        for (const genre of genres) {
          await this.fetchTopByGenre(genre, 'anime');
          await this.fetchTopByGenre(genre, 'manga');
        }
        break;
      default:
        throw new Error(`Unknown job: ${jobName}`);
    }
    
    logger.info(`Job '${jobName}' completed successfully`);
  }

  async updateJobSchedule(jobName: string, scheduleData: any): Promise<void> {
    // Update schedule in database
    await ScheduleService.upsertSchedule({ jobName, ...scheduleData });
    
    // Restart the job if it's currently running
    if (this.jobs.has(jobName)) {
      this.jobs.get(jobName)?.stop();
      this.jobs.delete(jobName);
      
      const schedule = await ScheduleService.getScheduleByJobName(jobName);
      if (schedule && schedule.isActive) {
        this.startJob(schedule);
      }
    }
    
    logger.info(`Updated schedule for job '${jobName}'`);
  }

  async getJobStatus(): Promise<Array<any>> {
    const schedules = await ScheduleService.getAllSchedules();
    
    return schedules.map(schedule => ({
      name: schedule.jobName,
      status: this.jobs.has(schedule.jobName) ? 'running' : 'stopped',
      lastRun: schedule.lastRun,
      nextRun: schedule.nextRun,
      interval: schedule.interval,
      cronExpression: schedule.cronExpression,
      isActive: schedule.isActive,
      description: schedule.description,
    }));
  }

  private async fetchTrendingAnime(): Promise<void> {
    const trendingAnime = await this.anilistService.getTrendingAnime();
    console.log("trendingAnime",trendingAnime);
    
    for (const anime of trendingAnime) {
      const existing = await this.contentService.getContentByExternalId(
        anime.id.toString(),
        'anilist'
      );

      if (!existing) {
        await this.contentService.createContentItem({
          externalId: anime.id.toString(),
          source: 'anilist',
          type: 'anime',
          title: anime.title.romaji || anime.title.english,
          synopsis: anime.description,
          posterUrl: anime.coverImage.large,
          genres: anime.genres,
          rating: anime.averageScore ? anime.averageScore / 10 : 0,
          popularity: anime.popularity,
          releaseYear: new Date(anime.startDate?.year || 2024).getFullYear(),
          trendScore: 0, // Will be calculated by updateTrendScores
          raw: anime,
        });
      }
    }
  }

  private async fetchTrendingManga(): Promise<void> {
    const trendingManga = await this.anilistService.getTrendingManga();
    
    for (const manga of trendingManga) {
      const existing = await this.contentService.getContentByExternalId(
        manga.id.toString(),
        'anilist'
      );

      if (!existing) {
        await this.contentService.createContentItem({
          externalId: manga.id.toString(),
          source: 'anilist',
          type: 'manga',
          title: manga.title.romaji || manga.title.english,
          synopsis: manga.description,
          posterUrl: manga.coverImage.large,
          genres: manga.genres,
          rating: manga.averageScore ? manga.averageScore / 10 : 0,
          popularity: manga.popularity,
          releaseYear: new Date(manga.startDate?.year || 2024).getFullYear(),
          trendScore: 0, // Will be calculated by updateTrendScores
          raw: manga,
        });
      }
    }
  }

  private async fetchTopByGenre(genre: string, type: 'anime' | 'manga'): Promise<void> {
    const content = type === 'anime' 
      ? await this.anilistService.getAnimeByGenre(genre)
      : await this.anilistService.getMangaByGenre(genre);
    
    for (const item of content) {
      const existing = await this.contentService.getContentByExternalId(
        item.id.toString(),
        'anilist'
      );

      if (!existing) {
        await this.contentService.createContentItem({
          externalId: item.id.toString(),
          source: 'anilist',
          type,
          title: item.title.romaji || item.title.english,
          synopsis: item.description,
          posterUrl: item.coverImage.large,
          genres: item.genres,
          rating: item.averageScore ? item.averageScore / 10 : 0,
          popularity: item.popularity,
          releaseYear: new Date(item.startDate?.year || 2024).getFullYear(),
          trendScore: 0, // Will be calculated by updateTrendScores
          raw: item,
        });
      }
    }
  }
}
