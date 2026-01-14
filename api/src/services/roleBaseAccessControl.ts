// =============================================================================
// ACCESSCONTROL IMPLEMENTATION - TYPESCRIPT
// =============================================================================
import { Request, Response, NextFunction, Application } from 'express';
import { capitalizeFirstLetter } from 'libs';
import { AppError } from 'middlewares/error';
import { Role } from 'microservices/auth-service/types';
import { IUserDocument } from 'models/user.model'; // Adjust path as needed
import { IRolePermission, RolePermissionModel } from 'microservices/permission-services/rolePermission.model';
import { ActionType, ResourceType,ParentResourceType } from 'seeders/rolePermission.seed';
const ADMIN_ASSIGNABLE_ROLES = [Role.CUSTOMER, Role.SELLER, Role];
const SUPERADMIN_ASSIGNABLE_ROLES = [Role.ADMIN];
// =============================================================================
// 2. PERMISSION CHECKER CLASS (CUSTOM IMPLEMENTATION)
// =============================================================================

// In-memory cache: role -> permissions
const rolePermissionCache: Map<string, IRolePermission> = new Map();

// Load role permissions from DB or cache
async function getRolePermissions(role: Role): Promise<IRolePermission | null> {
  if (rolePermissionCache.has(role)) {
    return rolePermissionCache.get(role)!;
  }

  const rolePerm = await RolePermissionModel.findOne({ role }).lean();
  if (rolePerm) {
    rolePermissionCache.set(role, rolePerm);
  }

  return rolePerm;
}

// Invalidate cache for a role (after updating permissions)
export function invalidateRoleCache(role: Role) {
  rolePermissionCache.delete(role);
}

export class UserPermissionChecker {
  private user: IUserDocument;
  constructor(user: IUserDocument) {
    this.user = user;
  }
   async canUserUpdate(targetRole: Role): Promise<boolean> {
    if (this.user.role === Role.ADMIN && !ADMIN_ASSIGNABLE_ROLES.includes(targetRole)) {
      throw new AppError(
        `Users with the ${capitalizeFirstLetter(this.user.role)} role are not authorized to update users with the ${capitalizeFirstLetter(targetRole)} role.`,
        400
      );
    }

    if (
      this.user.role === Role.SUPERADMIN &&
      !SUPERADMIN_ASSIGNABLE_ROLES.includes(targetRole)
    ) {
      throw new AppError(
        `Users with the ${capitalizeFirstLetter(this.user.role)} role cannot update users with the ${capitalizeFirstLetter(targetRole)} role.`,
        403
      );
    }

    return true;
  }
}


// =============================================================================
// 4. EXPRESS MIDDLEWARE INTEGRATION
// =============================================================================

// Middleware factory for permission checking
// src/middlewares/requirePermission.ts

export function requirePermission(method: ActionType, title: ResourceType,parentResource:ParentResourceType) {
  return async (req: Request, res: Response, next: NextFunction) => {
     try {
       const user = req.session?.user;
       if (!user) {
        throw new AppError('Unauthorized: No session found', 401);
       }
       // Superadmin always has access
       if (user.role === Role.SUPERADMIN) return next();
 
       const rolePerm = await getRolePermissions(user.role);
       if (!rolePerm) {
        throw new AppError('Role permissions not found', 403);
        }
 
       let hasAccess = false;
       for (const resource of rolePerm.resources) {
         for (const action of resource.source) {
           if (action.method === method && action.title === title && action.access) {
             hasAccess = true;
             break;
           }
         }
         if (hasAccess) break;
       }
 
       if (!hasAccess) {
          throw new AppError('Forbidden: You do not have permission to access this resource', 403);
       }
 
       next();
     } catch (err: any) {
       console.error('Permission check failed:', err);
       next(err)
     }
   };
}



// Role-based middleware
export function requireRole(allowedRoles:  Role[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.session.user) {
         throw new AppError('Unauthorized: No session found', 401);
      }
      console.log("res session role",req.session.user.role)
      if (!allowedRoles.includes(req.session.user.role)) {
         throw new AppError('Access denied: Insufficient role privileges', 403,{
           required: allowedRoles,
          userRole: req.session.user.role
         });
      }

      next();
    } catch (error: any) {
      next(error);
    }
  };
}
