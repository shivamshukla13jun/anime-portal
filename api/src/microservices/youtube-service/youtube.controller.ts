import { Request, Response, NextFunction } from 'express';
import { YouTubeService } from './youtube.service';
import { AppError } from '../../middlewares/error';
import { uploadToYouTubeSchema } from './youtube.validation';

const youtubeService = new YouTubeService();

export const getAuthUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await youtubeService.getAuthUrl();
    
    res.status(200).json({
      success: true,
      message: 'YouTube auth URL generated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const handleCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      throw new AppError('Missing required parameters: code and state', 400);
    }
    
    const result = await youtubeService.handleCallback(code as string, state as string);
    
    res.status(200).json({
      success: true,
      message: 'YouTube authorization completed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadToYouTube = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = uploadToYouTubeSchema.parse(req.body);
    const upload = await youtubeService.uploadToYouTube(validatedData);
    
    res.status(201).json({
      success: true,
      message: 'YouTube upload started successfully',
      data: upload,
    });
  } catch (error) {
    next(error);
  }
};

export const getUploadById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const upload = await youtubeService.getUploadById(id);
    
    if (!upload) {
      throw new AppError('YouTube upload not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'YouTube upload retrieved successfully',
      data: upload,
    });
  } catch (error) {
    next(error);
  }
};

export const getUploadByVideoId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { videoId } = req.params;
    const upload = await youtubeService.getUploadByVideoId(videoId);
    
    if (!upload) {
      throw new AppError('YouTube upload not found for this video', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'YouTube upload retrieved successfully',
      data: upload,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUploads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.query;
    const uploads = await youtubeService.getAllUploads(status as string);
    
    res.status(200).json({
      success: true,
      message: 'YouTube uploads retrieved successfully',
      data: uploads,
    });
  } catch (error) {
    next(error);
  }
};
