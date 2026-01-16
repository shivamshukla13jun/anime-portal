import { Request, Response, NextFunction } from 'express';
import { AppError } from './error';

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized: User not authenticated', 401));
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      return next(new AppError('Forbidden: Insufficient permissions', 403));
    }

    next();
  };
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Unauthorized: User not authenticated', 401));
  }

  if (req.user.role !== 'admin') {
    return next(new AppError('Forbidden: Admin access required', 403));
  }

  next();
};
