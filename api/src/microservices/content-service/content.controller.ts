import { Request, Response, NextFunction } from 'express';
import { ContentService } from './content.service';
import { AppError } from '../../middlewares/error';

const contentService = new ContentService();

export const getAllContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      type,
      genre,
      source,
      sort = 'trendScore',
      page = '1',
      limit = '20',
      status
    } = req.query;

    const result = await contentService.getAllContent(
      type as any,
      genre as string,
      source as any,
      sort as string,
      parseInt(page as string),
      parseInt(limit as string),
      status as string
    );
    
    res.status(200).json({
      success: true,
      message: 'Content retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getContentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('Content ID is required', 400);
    }

    const content = await contentService.getContentById(id);
    
    if (!content) {
      throw new AppError('Content not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Content retrieved successfully',
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

export const getTrendingContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { limit = '10' } = req.query;
    const content = await contentService.getTrendingContent(parseInt(limit as string));
    
    res.status(200).json({
      success: true,
      message: 'Trending content retrieved successfully',
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

export const getContentByGenre = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { genre } = req.params;
    const { limit = '20' } = req.query;
    const content = await contentService.getContentByGenre(genre, parseInt(limit as string));
    
    res.status(200).json({
      success: true,
      message: `Content for genre '${genre}' retrieved successfully`,
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

export const createContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contentData = req.body;
    const content = await contentService.createContentItem(contentData);
    
    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

export const updateContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const contentData = req.body;
    const content = await contentService.updateContent(id, contentData);
    
    if (!content) {
      throw new AppError('Content not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Content updated successfully',
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await contentService.deleteContent(id);
    
    if (!deleted) {
      throw new AppError('Content not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const publishContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const content = await contentService.updateContent(id, { status: 'published' });
    
    if (!content) {
      throw new AppError('Content not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Content published successfully',
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

export const unpublishContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const content = await contentService.updateContent(id, { status: 'draft' });
    
    if (!content) {
      throw new AppError('Content not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Content unpublished successfully',
      data: content,
    });
  } catch (error) {
    next(error);
  }
};
