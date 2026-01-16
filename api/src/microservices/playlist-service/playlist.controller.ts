import { Request, Response, NextFunction } from 'express';
import { PlaylistService } from './playlist.service';
import { AppError } from '../../middlewares/error';
import { createPlaylistSchema, updatePlaylistSchema } from './playlist.validation';

const playlistService = new PlaylistService();

export const createPlaylist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = createPlaylistSchema.parse(req.body);
    const playlist = await playlistService.createPlaylist(validatedData);
    
    res.status(201).json({
      success: true,
      message: 'Playlist created successfully',
      data: playlist,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPlaylists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { categoryId, collectionId } = req.query;
    const playlists = await playlistService.getAllPlaylists(
      categoryId as string,
      collectionId as string
    );
    
    res.status(200).json({
      success: true,
      message: 'Playlists retrieved successfully',
      data: playlists,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlaylistById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const playlist = await playlistService.getPlaylistById(id);
    
    if (!playlist) {
      throw new AppError('Playlist not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Playlist retrieved successfully',
      data: playlist,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlaylist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updatePlaylistSchema.parse(req.body);
    const playlist = await playlistService.updatePlaylist(id, validatedData);
    
    if (!playlist) {
      throw new AppError('Playlist not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Playlist updated successfully',
      data: playlist,
    });
  } catch (error) {
    next(error);
  }
};
