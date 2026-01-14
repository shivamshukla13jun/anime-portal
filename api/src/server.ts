import dotenv from 'dotenv';
dotenv.config();

import express, { ErrorRequestHandler, Express } from "express";
import cors from "cors";
import helmet from 'helmet';
import { sessionMiddleware } from 'middlewares/session';
import compression from 'compression';

import rootRouter from 'routes';
import { notFound, errorHandler, AppError } from 'middlewares/error';
import connectDB from 'config/database';
import createDefaultUsers from 'seeders';
import { corsOptions } from 'utils/CorsOptions';
import swaggerSpec from "services/SwaggerService/swaggerSpec";
import swaggerUi from 'swagger-ui-express';
import { ensureDirectoryExists } from 'libs';
import config from 'config';

const app: Express = express();

// Track database connection state
let isDatabaseConnected = false;

// Middleware to check database connection
const checkDatabaseConnection = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!isDatabaseConnected && !req.path.startsWith('/health')) {
    throw new AppError('Database connection is not available. Please try again later.', 503);
  }
  next();
};

// Create directories if not exists
config.ALL_DIRECTORY_LIST.forEach((dir) => {
  ensureDirectoryExists(dir);
});
// Set default engine
app.set('view engine', 'ejs');
app.set('trust proxy', 1);

// Compression middleware
app.use(compression());

// CORS middleware
app.use(cors(corsOptions as any));

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use('/uploads', express.static(config.UPLOAD_BASE_DIR));
const attemptDatabaseConnection = async () => {
  try {
    await connectDB();
    isDatabaseConnected = true;
    console.log('✅ MongoDB connected successfully');
    
    // Seed default data
    await createDefaultUsers();
    
    // Setup Swagger documentation
    const swaggerDocument = await swaggerSpec();
    
    // Apply middleware
    app.use(checkDatabaseConnection);
    app.use(sessionMiddleware);
    
    // Mount Swagger UI
    app.use('/api-docs', swaggerUi.serve);
    app.get('/api-docs', swaggerUi.setup(swaggerDocument));
    
    // Mount routes
    app.use(rootRouter);
    
    // Error handling
    app.use(notFound);
    app.use(errorHandler as ErrorRequestHandler);
    
    // Start server
    app.listen(config.PORT, () => {
      console.log(`🚀 Server is running on port ${config.PORT}`);
      console.log(`📚 Swagger UI is available at http://localhost:${config.PORT}/api-docs`);
    });
  } catch (err) {
    isDatabaseConnected = false;
    console.error('❌ Unable to connect to the database:', err);
    console.log('🔄 Attempting reconnection in 5 seconds...');
    setTimeout(attemptDatabaseConnection, 5000);
  }
};
// Initialize application
attemptDatabaseConnection();

