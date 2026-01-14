
// middlewares/session.ts
import session from 'express-session';
import { Request } from 'express';
import config  from 'config';
import crypto from 'crypto';
import Session,{ISession} from 'models/session.model';
import User, { IUserDocument } from 'models/user.model';
import { AppError } from './error';
import sessionStore from 'services/Sessionstore';
import mongoose from 'mongoose';
// === Session Typing ===
declare module 'express-session' {
  interface SessionData {
    key: string;
    iv: string;
    createdAt?: number;
    user:IUserDocument
    
  }
}
// === Session Middleware ===

export const sessionMiddleware = session({
  genid: () => new mongoose.Types.ObjectId().toString(), // Generate custom session ID
  secret: config.JWT_SECRET,
  resave: false,
  rolling:true,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: !config.isProduction,
    // sameSite: 'strict',
    secure: config.isProduction,
    maxAge:config.sessionExpireTime, // 365 days in ms
  },
});

// === Login Handler ===
export const loginSession = async (req: Request, userId: string): Promise<void> => {
  const user= await User.findById(userId)
  if (!user) throw new AppError('User not found', 400);
  return new Promise((resolve, reject) => {
    req.session.regenerate(async (err) => {
      if (err) return reject(err);
      try {
        req.session.user = user
        req.session.createdAt = Date.now();
        // Generate encryption keys for this session
        req.session.key = crypto.randomBytes(32).toString('hex');
        req.session.iv = crypto.randomBytes(16).toString('hex');
        
        req.session.save((err) => {
          if (err) return reject(err);
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  });
};

// === Session Age Middleware ===
export const sessionAgeMiddleware = (req: Request, res: any, next: any) => {
  if (req.session && req.session.createdAt) {
    const now = Date.now();
    const sessionAge = now - req.session.createdAt;
    const maxAge = config.sessionExpireTime; // 15 days in ms

    if (sessionAge <= maxAge) {
      // Update session timestamp
      req.session.createdAt = now;
      req.session.save((err) => {
        if (err) return next(err);
        next();
      });
    } else {
      // Session expired, destroy it
      req.session.destroy((err) => {
        if (err) return next(err);
        next();
      });
    }
  } else {
    next();
  }
};

// === Logout Handler ===
export const logoutSession = async (req: Request): Promise<void> => {
  return new Promise((resolve, reject) => {
    const sessionId = req.session.id;
    req.session.destroy((err) => {
      if (err) return reject(err);
      // delete session from MongoDB
      Session.deleteOne({ _id: sessionId }, (deleteErr: any) => {
        if (deleteErr) return reject(deleteErr);
        resolve();
      });
    });
  });
};

// === Session Utilities ===
export const getActiveSessionsCount = async (): Promise<number> => {
  try {
    return await Session.countDocuments({ expires: { $gte: new Date() } });
  } catch (error) {
    return 0;
  }
};

export const getUserSessions = async (userId: string): Promise<ISession[]> => {
  try {
    return await Session.find({
      'session.userId': userId,
      expires: { $gte: new Date() }
    });
  } catch (error) {
    return [];
  }
};

export const destroyUserSessions = async (userId: string): Promise<void> => {
  try {
    await Session.deleteMany({ 'session.userId': userId });
  } catch (error) {
    throw error;
  }
};

export const cleanExpiredSessions = async (): Promise<number> => {
  try {
    const result = await Session.deleteMany({ expires: { $lt: new Date() } });
    return result.deletedCount || 0;
  } catch (error) {
    return 0;
  }
};