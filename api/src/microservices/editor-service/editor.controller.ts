import { Request, Response, NextFunction } from 'express';
import { EditorService } from './editor.service';
import { AppError } from '../../middlewares/error';
import { updateProjectSchema } from './editor.validation';

const editorService = new EditorService();

export const getProjectByVideoId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { videoId } = req.params;
    const project = await editorService.getProjectByVideoId(videoId);
    
    if (!project) {
      // Auto-create project if it doesn't exist
      const userId = req.user?._id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }
      
      const newProject = await editorService.createOrUpdateProject(videoId, userId);
      
      res.status(200).json({
        success: true,
        message: 'Project created and retrieved successfully',
        data: newProject,
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Project retrieved successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { videoId } = req.params;
    const userId = req.user?._id;
    
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }
    
    const validatedData = updateProjectSchema.parse(req.body);
    const project = await editorService.updateProject(videoId, userId, validatedData);
    
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const rerenderProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { videoId } = req.params;
    const userId = req.user?._id;
    
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }
    
    const project = await editorService.rerenderProject(videoId, userId);
    
    res.status(200).json({
      success: true,
      message: 'Project rerender started successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};
