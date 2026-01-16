import { Request, Response, NextFunction } from 'express';
import { ReviewService } from './review.service';
import { AppError } from '../../middlewares/error';
import { approveVideoSchema, rejectVideoSchema } from './review.validation';

const reviewService = new ReviewService();

export const getReviewQueue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status = 'DRAFT_READY', page = '1', limit = '20' } = req.query;
    const result = await reviewService.getReviewQueue(
      status as string,
      parseInt(page as string),
      parseInt(limit as string)
    );
    
    res.status(200).json({
      success: true,
      message: 'Review queue retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const startReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { videoId } = req.params;
    const reviewerId = req.user?._id;
    
    if (!reviewerId) {
      throw new AppError('User not authenticated', 401);
    }
    
    const video = await reviewService.startReview(videoId, reviewerId);
    
    res.status(200).json({
      success: true,
      message: 'Review started successfully',
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

export const approveVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { videoId } = req.params;
    const reviewerId = req.user?._id;
    
    if (!reviewerId) {
      throw new AppError('User not authenticated', 401);
    }
    
    const validatedData = approveVideoSchema.parse(req.body);
    const video = await reviewService.approveVideo(videoId, reviewerId, validatedData);
    
    res.status(200).json({
      success: true,
      message: 'Video approved successfully',
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { videoId } = req.params;
    const reviewerId = req.user?._id;
    
    if (!reviewerId) {
      throw new AppError('User not authenticated', 401);
    }
    
    const validatedData = rejectVideoSchema.parse(req.body);
    const video = await reviewService.rejectVideo(videoId, reviewerId, validatedData);
    
    res.status(200).json({
      success: true,
      message: 'Video rejected successfully',
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { videoId } = req.params;
    const history = await reviewService.getReviewHistory(videoId);
    
    res.status(200).json({
      success: true,
      message: 'Review history retrieved successfully',
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
