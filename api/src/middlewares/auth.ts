import { Request, Response, NextFunction } from 'express';
import { AppError } from './error';
import User from '../models/user.model';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated via session
    if (!req.session.user?._id) {
      throw new AppError('Unauthorized: No session found', 401);
    }

    // Optionally fetch user details to verify user still exists
    const user = await User.findById(req.session.user._id);
    if (!user) {
      throw new AppError('Unauthorized: User not found', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    if (user.isBlocked) {
      throw new AppError('Account is blocked', 401);
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
