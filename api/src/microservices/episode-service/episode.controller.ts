import { Request, Response, NextFunction } from 'express';
import { EpisodeService } from './episode.service';
import { AppError } from '../../middlewares/error';
import { createEpisodeSchema, updateEpisodeSchema } from './episode.validation';

const episodeService = new EpisodeService();

export const createEpisode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = createEpisodeSchema.parse(req.body);
    const episode = await episodeService.createEpisode(validatedData);
    
    res.status(201).json({
      success: true,
      message: 'Episode created successfully',
      data: episode,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllEpisodes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { playlistId } = req.query;
    const episodes = await episodeService.getAllEpisodes(playlistId as string);
    
    res.status(200).json({
      success: true,
      message: 'Episodes retrieved successfully',
      data: episodes,
    });
  } catch (error) {
    next(error);
  }
};

export const getEpisodeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const episode = await episodeService.getEpisodeById(id);
    
    if (!episode) {
      throw new AppError('Episode not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Episode retrieved successfully',
      data: episode,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEpisode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updateEpisodeSchema.parse(req.body);
    const episode = await episodeService.updateEpisode(id, validatedData);
    
    if (!episode) {
      throw new AppError('Episode not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Episode updated successfully',
      data: episode,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEpisode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await episodeService.deleteEpisode(id);
    
    if (!deleted) {
      throw new AppError('Episode not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Episode deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
