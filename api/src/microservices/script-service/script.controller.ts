import { Request, Response, NextFunction } from 'express';
import { ScriptService } from './script.service';
import { AppError } from '../../middlewares/error';
import { generateScriptSchema, updateScriptSchema, approveScriptSchema } from './script.validation';

const scriptService = new ScriptService();

export const generateScript = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = generateScriptSchema.parse(req.body);
    const script = await scriptService.generateScript(validatedData);
    
    res.status(201).json({
      success: true,
      message: 'Script generated successfully',
      data: script,
    });
  } catch (error) {
    next(error);
  }
};

export const getScriptById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const script = await scriptService.getScriptById(id);
    
    if (!script) {
      throw new AppError('Script not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Script retrieved successfully',
      data: script,
    });
  } catch (error) {
    next(error);
  }
};

export const updateScript = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updateScriptSchema.parse(req.body);
    const script = await scriptService.updateScript(id, validatedData);
    
    if (!script) {
      throw new AppError('Script not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Script updated successfully',
      data: script,
    });
  } catch (error) {
    next(error);
  }
};

export const approveScript = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = approveScriptSchema.parse(req.body);
    const script = await scriptService.approveScript(id);
    
    if (!script) {
      throw new AppError('Script not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Script approved successfully',
      data: script,
    });
  } catch (error) {
    next(error);
  }
};
