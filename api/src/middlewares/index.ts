import { Request, Response, NextFunction } from "express";
import multer from 'multer';
import path from 'path';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';
import { AppError } from 'middlewares/error';

import { encrypt } from "libs";
import config from "config";

export class Middleware {
    constructor() {
        
    }
    // File filter function
    private static fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        // Check file type
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed!'));
        }
    };
    static verifyToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // session based
            const userId = req.session.user?._id
            if (!userId) return next(new AppError('Unauthorized: No session found', 401));
            next();

        } catch (error) {
            next(error);
        }
    }
    static decryptDataMiddleware = async (req: Request, res: Response, next: NextFunction) => {
        try {
          const isbodyEmpty = Object.keys(req.body).length === 0;
          const isisRequestedENcrypted = req.headers.isencrypted == "true";
            if (!isbodyEmpty && isisRequestedENcrypted) {

                if (req.method === 'POST' || req.method === 'PUT' && req.body.payload) {
                    req.body = await encrypt.decryptData(req.body.payload);
                }
            }
        
            next();
        } catch (error) {
            next(error);
        }
    }
   
    static encryptResponseMiddleware(req: Request, res: Response, next: NextFunction) {
      try {
        res.locals.companyId = req.headers["companyid"] as string;
        if (req.headers.isencrypted == "true") {
            const originalJson = res.json;
            res.json = function (data) {
                const jsonStr = JSON.stringify(data);
                const encrypted = encrypt.encryptData(jsonStr);
                return originalJson.call(this, { payload: encrypted });
            };

        }
        next();
    } catch (error) {
      next(error);
    }
    }
    static loginLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 3, // e.g., 5 login attempts per window
        //   store: loginStore,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        handler: (req, res, next, options) => {
            next(
                new AppError(
                    `Too many login attempts from this IP. Please try again after ${Math.ceil(options.windowMs / 60000)} minutes.`,
                    429
                )
            );
        }
    });
    static apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 100, // e.g., 100 requests per window for normal APIs
        //   store: apiStore,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        handler: (req, res, next, options) => {
            next(
                new AppError(
                    `Too many requests from this IP. Please try again after ${Math.ceil(options.windowMs / 60000)} minutes.`,
                    429
                )
            );
        }
    });
    // Configure multer
    static upload = ({ destination = config.UPLOAD_BASE_DIR, fileSize = 5, maxFiles = 1 }: { destination: string, fileSize: number, maxFiles: number }) => {
        return multer({
            storage: multer.diskStorage({
                destination: (req, file, cb) => {
                    cb(null, destination);
                },
                filename: (req, file, cb) => {
                    // Generate unique filename with timestamp and UUID
                    const uniqueSuffix = Date.now() + '-' + uuidv4();
                    const extension = path.extname(file.originalname);
                    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
                }
            }),
            limits: {
                fileSize: fileSize * 1024 * 1024, // filesize * MB limit
                files: maxFiles // Maximum  files
            },
            fileFilter: this.fileFilter
        })
    }
    // Error handling middleware
    static handleUploadError = (error: any, req: any, res: any, next: any) => {
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Maximum size is 5MB.'
                });
            }
            if (error.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    success: false,
                    message: 'Too many files. Maximum 10 files allowed.'
                });
            }
            if (error.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({
                    success: false,
                    message: 'Unexpected field name for file upload.'
                });
            }
        }

        if (error.message.includes('Only image files')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    };
    static requestValidate = (schema: z.ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.info('Original Request Body:', req.body);
            req.body = await schema.parseAsync(req.body);
            console.info('New Request Body:', req.body);
            next();
        } catch (err: any) {
            next(err);
        }
    };
}