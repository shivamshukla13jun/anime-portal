import { Request, Response, NextFunction } from 'express';
import { VoiceService } from './voice.service';
import { AppError } from '../../middlewares/error';
import { generateVoiceSchema } from './voice.validation';

const voiceService = new VoiceService();

export const generateVoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = generateVoiceSchema.parse(req.body);
    const voice = await voiceService.generateVoice(validatedData);
    
    res.status(201).json({
      success: true,
      message: 'Voice generated successfully',
      data: voice,
    });
  } catch (error) {
    next(error);
  }
};

export const getVoiceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const voice = await voiceService.getVoiceById(id);
    
    if (!voice) {
      throw new AppError('Voice not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Voice retrieved successfully',
      data: voice,
    });
  } catch (error) {
    next(error);
  }
};

export const getVoiceByScriptId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { scriptId } = req.params;
    const voice = await voiceService.getVoiceByScriptId(scriptId);
    
    if (!voice) {
      throw new AppError('Voice not found for this script', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Voice retrieved successfully',
      data: voice,
    });
  } catch (error) {
    next(error);
  }
};
