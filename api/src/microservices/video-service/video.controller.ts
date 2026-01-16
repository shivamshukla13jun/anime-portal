import { Request, Response, NextFunction } from 'express';
import { VideoService } from './video.service';
import { AppError } from '../../middlewares/error';
import { generateVideoSchema } from './video.validation';

const videoService = new VideoService();

export const generateVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = generateVideoSchema.parse(req.body);
    const video = await videoService.generateVideo(validatedData);
    
    res.status(201).json({
      success: true,
      message: 'Video generation started successfully',
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

export const getVideoById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const video = await videoService.getVideoById(id);
    
    if (!video) {
      throw new AppError('Video not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Video retrieved successfully',
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllVideos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, playlistId, type } = req.query;
    const videos = await videoService.getAllVideos(
      status as any,
      playlistId as string,
      type as string
    );
    
    res.status(200).json({
      success: true,
      message: 'Videos retrieved successfully',
      data: videos,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublishedVideos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type } = req.query;
    const videos = await videoService.getPublishedVideos(type as any);
    
    res.status(200).json({
      success: true,
      message: 'Published videos retrieved successfully',
      data: videos,
    });
  } catch (error) {
    next(error);
  }
};
