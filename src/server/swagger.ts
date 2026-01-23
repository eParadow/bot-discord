import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { config } from './config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Discord Bot API',
      version: '1.0.0',
      description: 'API REST pour administrer les entités du bot Discord (reminders, activity-alerts)',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.apiPort}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
            },
            username: {
              type: 'string',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Reminder: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
            },
            guild_id: {
              type: 'string',
              nullable: true,
            },
            user_id: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
            cron_expression: {
              type: 'string',
            },
            created_by: {
              type: 'string',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        ActivityAlert: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
            },
            guild_id: {
              type: 'string',
              nullable: true,
            },
            target_user_id: {
              type: 'string',
            },
            alert_user_id: {
              type: 'string',
            },
            alert_type: {
              type: 'string',
              enum: ['gaming', 'voice', 'both'],
            },
            duration_minutes: {
              type: 'integer',
            },
            message: {
              type: 'string',
              nullable: true,
            },
            enabled: {
              type: 'boolean',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./dist/server/routes/*.js', './src/server/routes/*.ts'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}
