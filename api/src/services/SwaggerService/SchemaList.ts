

import { generatePropertiesFromZod } from './expressListRoutes'; // Fixed import
import { AuthLoginSchema } from 'microservices/auth-service/login.validate';
import { userRegistrationSchema, userUpdateSchema } from 'microservices/user-service/user.validate';
const commonfieldsDisabled = ['createdAt', 'updatedAt','createdBy','updatedBy','userId','_id','files','deletedfiles'];
type FieldType = 'loadData' | 'ItemData' | 'TaxData' | 'PaymentTermData' | 'AuthLoginData' | 'CreateuserData' | 'UpdateuserData';

const DataTransform = (
    schema: any,
    isJson: boolean = false,
    field?: FieldType
  ): Record<string, any> => {
    const schemaProperties = generatePropertiesFromZod(schema, commonfieldsDisabled);
    const result: Record<string, any> = {};
  
    if (isJson && field === 'loadData') {
      // Place both JSON string and files as top-level fields
      result[field] = {
        type: 'string',
        description: 'Stringified JSON object (use JSON.stringify on the client)',
        example: JSON.stringify(schemaProperties, null, 2),
      };
      result['files'] = {
        type: 'string',
        format: 'binary',
        description: 'File to upload',
        example: 'file.pdf',
      };
      return result;
    }
  
    // For other cases
    if (field) {
      result[field] = field === 'loadData'
        ? {
            type: 'string',
            description: 'Stringified JSON object (use JSON.stringify on the client)',
            example: JSON.stringify(schemaProperties, null, 2),
          }
        : schemaProperties;
      return result;
    }
  
    // Default return (no field passed)
    return isJson
      ? {
          data: {
            type: 'string',
            description: 'Stringified JSON object (use JSON.stringify)',
            example: JSON.stringify(schemaProperties, null, 2),
          },
        }
      : schemaProperties;
  };
  
  
export const SchemaList = {
    "/api/auth/login": AuthLoginSchema 
        ? DataTransform(AuthLoginSchema) 
        : {},
    "/api/users": userRegistrationSchema 
        ? DataTransform(userRegistrationSchema) 
        : {},
    "/api/users/:id": userUpdateSchema 
        ? DataTransform(userUpdateSchema) 
        : {},
}

