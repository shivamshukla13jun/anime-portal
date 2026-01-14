// src/routes/rolePermission.routes.ts
import express from 'express';
import { Role } from 'microservices/auth-service/types';
import { requireRole } from 'services/roleBaseAccessControl';
import { getRolePermissions, updateAccess } from './rolePermission.controller';

const router = express.Router();

// PATCH /api/role-permissions/:role/:resource/:method/:title
router.put(
  '/:role',
  requireRole([Role.SUPERADMIN]), // Only superadmin can modify
  updateAccess
);
router.get(
  '/:role',
  requireRole([Role.SUPERADMIN]), // superadmin and admin can view
  getRolePermissions
);

export default router;
