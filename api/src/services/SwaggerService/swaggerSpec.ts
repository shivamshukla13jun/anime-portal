// Swagger configuration

import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import {generateSwaggerPaths,getRoutesFromRouter} from "./expressListRoutes"

const generateSwaggerSpec = async () => {
  const routes = await getRoutesFromRouter();
  const swaggerPaths = await generateSwaggerPaths(routes);
  
  const swaggerOptions = {
    persistAuthorization: true,
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        version: '1.0.0',
        description: 'API documentation for application',
        contact: {
          name: 'Support',
        },
      },
      components: {
        securitySchemes: {
          "Company Id": {
            type: 'apiKey',
            in: 'header',
            name: 'companyid',
            minimum: 24,
            maximum: 24,
            
            description: 'Company ID for multi-tenant support. Can be provided as "companyid" or "Companyid"',
          },
          "API Key": {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
            description: 'API Key for authentication',
          }
        },
        schemas: {
          // Common response schemas
          Error: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                example: false
              },
              message: {
                type: 'string'
              },
              error: {
                type: 'object'
              }
            }
          },
          Success: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                example: true
              },
              data: {
                type: 'object'
              },
              message: {
                type: 'string'
              }
            }
          }
        }
      },
      security: [
        {
          "Company Id": [],
          "API Key": []
        }
      ],
      paths: swaggerPaths,
    },
    apis: [
      path.join(process.cwd(), 'src', 'microservices/**/*.route.ts'),
    ],
  };

  return swaggerJsdoc(swaggerOptions);
};

export default generateSwaggerSpec;