import { Request, Response, NextFunction } from 'express';
import { CollectionService } from './collection.service';
import { AppError } from '../../middlewares/error';
import { createCollectionSchema, updateCollectionSchema } from './collection.validation';

const collectionService = new CollectionService();

export const createCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = createCollectionSchema.parse(req.body);
    const collection = await collectionService.createCollection(validatedData);
    
    res.status(201).json({
      success: true,
      message: 'Collection created successfully',
      data: collection,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCollections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { categoryId } = req.query;
    const collections = await collectionService.getAllCollections(categoryId as string);
    
    res.status(200).json({
      success: true,
      message: 'Collections retrieved successfully',
      data: collections,
    });
  } catch (error) {
    next(error);
  }
};

export const getCollectionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const collection = await collectionService.getCollectionById(id);
    
    if (!collection) {
      throw new AppError('Collection not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Collection retrieved successfully',
      data: collection,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updateCollectionSchema.parse(req.body);
    const collection = await collectionService.updateCollection(id, validatedData);
    
    if (!collection) {
      throw new AppError('Collection not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Collection updated successfully',
      data: collection,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await collectionService.deleteCollection(id);
    
    if (!deleted) {
      throw new AppError('Collection not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Collection deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
