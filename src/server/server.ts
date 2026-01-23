import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { setupSwagger } from './swagger';
import authRoutes from './routes/auth';
import remindersRoutes from './routes/reminders';
import activityAlertsRoutes from './routes/activity-alerts';

export function createApp(): Express {
  const app = express();

  // CORS middleware
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    })
  );

  // JSON body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Swagger documentation
  setupSwagger(app);

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/reminders', remindersRoutes);
  app.use('/api/activity-alerts', activityAlertsRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Not found',
    });
  });

  // Error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });

  return app;
}
