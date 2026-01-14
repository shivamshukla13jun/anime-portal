import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { SchemaList } from './SchemaList';
import { ParamValidationRules } from './paramParameters';
export const FormDataPaths:string[]=[
    ];
/** Clean regex artifacts from Express route paths */
function cleanExpressPath(path: string): string {
  // Handle the special case of root router paths that contain regex
  if (path.includes('?(?=/|$)')) {
    path = path.split('?(?=/|$)')[0];
  }
  
  return path
    // Remove regex escaping from slashes
    .replace(/\\\//g, '/')
    // Remove any regex patterns
    .replace(/\(\?=[^)]+\)/g, '')
    // Remove start/end markers
    .replace(/^\^|\$$/g, '')
    // Clean up any double slashes
    .replace(/\/+/g, '/')
    // Remove trailing slash
    .replace(/\/$/, '')
    // Handle empty paths
    .replace(/^$/, '/');
}

/** Dynamically import rootRouter and extract routes */
async function getRoutesFromRouter(): Promise<{ path: string; methods: string[] }[]> {
  console.log('🔍 Starting route extraction...');
  try {
    const { default: rootRouter } = await import('routes'); // adjust path as needed
    console.log('✅ Root router imported successfully');

    const routes: { path: string; methods: string[] }[] = [];

    if (!rootRouter || !('stack' in rootRouter)) {
      console.error('❌ rootRouter is not valid or does not contain stack');
      return [];
    }
    
    console.log(`📚 Found ${rootRouter.stack.length} routes in root router stack`);

  rootRouter.stack.forEach((layer: any) => {
    if (layer.route) {
      const path = cleanExpressPath(layer.route.path);
      const methods = Object.keys(layer.route.methods)
        .filter((method) => layer.route.methods[method])
        .map((method) => method.toUpperCase());

      routes.push({ path, methods });
    } else if (layer.name === 'router' && layer.handle.stack) {
      // Extract the base path from the regexp source
      let basePath = '';
      if (layer.regexp && layer.regexp.source) {
        basePath = layer.regexp.source
          .replace(/\^/, '')
          .replace(/\\/, '')
          .replace(/\?(?:\(\?=\\\/\|\$\))?/, '')
          .replace(/\$/, '');
      }
      
      layer.handle.stack.forEach((nestedLayer: any) => {
        if (nestedLayer.route) {
          const routePath = nestedLayer.route.path || '';
          // Combine paths and clean
          const fullPath = cleanExpressPath(basePath + routePath);
          
          const methods = Object.keys(nestedLayer.route.methods)
            .filter((method) => nestedLayer.route.methods[method])
            .map((method) => method.toUpperCase())
          routes.push({ path: fullPath, methods });
        }
      });
    }
  });

  return routes;
}catch (error) {
    console.error('❌ Error extracting routes from rootRouter:', error);
    return [];
  }
}
 
/** Generate parameter documentation for path parameters */
/** Generate parameter documentation with validation rules */
function generatePathParameters(path: string): any[] {
  try {
    const params = [];
    const seenParams = new Set<string>();
    const paramRegex = /:([^/]+)/g;
    let match;
    
    // Get validation rules for this specific path
    const pathRules = ParamValidationRules[path] || {};

    while ((match = paramRegex.exec(path)) !== null) {
      const paramName = match[1].trim();
      
      // Validate parameter name format
      if (!/^[a-z_][a-z0-9_]*$/i.test(paramName)) {
        console.error(`Invalid parameter name '${paramName}' in path '${path}'. `
          + "Must start with letter/underscore and contain only alphanumeric characters/underscores.");
        continue;
      }

      // Check for duplicates
      if (seenParams.has(paramName)) {
        console.error(`Duplicate parameter '${paramName}' in path '${path}'. Parameters must be unique.`);
        continue;
      }
      seenParams.add(paramName);

      // Create base parameter definition
      const paramDefinition: any = {
        name: paramName,
        in: "path",
        required: true,
        schema: { type: "string" },
        description: `Path parameter: ${paramName}`
      };

      // Apply validation rules if they exist
      if (pathRules[paramName]) {
        const rules = pathRules[paramName];
        
        // Update schema with validation rules
        paramDefinition.schema = { ...paramDefinition.schema, ...rules };
        
        // Keep explicitly defined description or fallback
        if (rules.description) {
          paramDefinition.description = rules.description;
        }
        
        // Set example if provided
        if (rules.example) {
          paramDefinition.schema.example = rules.example;
        }
      } else {
        // Smart type inference for common patterns
        if (/(id|num|count)$/i.test(paramName)) {
          paramDefinition.schema.type = "integer";
          paramDefinition.schema.example = 12345;
        } else if (/(uuid|guid)$/i.test(paramName)) {
          paramDefinition.schema.format = "uuid";
          paramDefinition.schema.example = "550e8400-e29b-41d4-a716-446655440000";
        } else {
          paramDefinition.schema.example = "example-value";
        }
      }

      params.push(paramDefinition);
    }

    return params;
  } catch (error) {
    console.error('Error generating path parameters:', error);
    return [];
  }
}

/** Generate common request body schemas based on route and method */
async function generateRequestBody(path: string, method: string): Promise<any> {
  if (method === 'post' || method === 'put') {
    const resource = path.split('/')[2];
    let contentType="application/json";
   if(FormDataPaths.includes(path)) contentType="multipart/form-data";

    // Try to get validation schema
  
    
    return {
      required: true,
      content: {
        [contentType]: {
          schema: {
            type: 'object',
            properties: (SchemaList as any)[resource]  || {}
          }
        }
      }
    };
  }
  return null;
}


function generatePropertiesFromZod(
  schema: any,
  disabledFields: string[] = []
): Record<string, any> {
  try {
    // Convert Zod schema to JSON Schema
    const jsonSchema = zodToJsonSchema(schema, {
      target: 'openApi3',
      $refStrategy: 'none'
    } as any);

    // Extract properties from the JSON schema
    if (jsonSchema && typeof jsonSchema === 'object' && 'properties' in jsonSchema) {
      const properties = jsonSchema.properties as Record<string, any>;
      
      // Filter out disabled fields
      const filteredProperties: Record<string, any> = {};
      for (const [key, value] of Object.entries(properties)) {
        if (!disabledFields.includes(key)) {
          filteredProperties[key] = value;
        }
      }
      
      return filteredProperties;
    }

    return {};
  } catch (error) {
    console.error('Error generating properties from Zod schema:', error);
    return {};
  }
}
/** Generate Swagger-compatible paths object from routes */
async function generateSwaggerPaths(
  routes: { path: string; methods: string[] }[]
): Promise<Record<string, any>> {
  const paths: Record<string, any> = {};

  // Process all routes in parallel
  await Promise.all(routes.map(async ({ path, methods }) => {
    // Convert Express path params (:id) to Swagger format ({id})
    const swaggerPath = path.replace(/:([^/]+)/g, '{$1}');
    
    if (!paths[swaggerPath]) {
      paths[swaggerPath] = {};
    }

    // Process all methods in parallel
    await Promise.all(methods.filter((m)=>m=="POST" || m=="PUT").map(async (method) => {
      const lowerMethod = method.toLowerCase();
      const pathParams = generatePathParameters(path);
      const requestBody = await generateRequestBody(path, lowerMethod);
      
      const operation: any = {
        summary: `${method} ${path}`,
        tags: [path.split('/')[2] || 'default'],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
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
            }
          },
          400: {
            description: 'Bad Request',
          },
          401: {
            description: 'Unauthorized',
          },
          500: {
            description: 'Internal Server Error',
          }
        }
      };

      // Add parameters if they exist
      if (pathParams.length > 0) {
        operation.parameters = pathParams;
      }

      // Add request body if it exists
      if (requestBody) {
        operation.requestBody = requestBody;
      }
      paths[swaggerPath][lowerMethod] = operation;
    }))
  }));

  return paths;
}



export {generateSwaggerPaths,getRoutesFromRouter,generatePropertiesFromZod,generateRequestBody,cleanExpressPath,generatePathParameters};

export default generatePropertiesFromZod