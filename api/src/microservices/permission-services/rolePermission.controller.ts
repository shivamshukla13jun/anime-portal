// src/controllers/rolePermission.controller.ts
import { NextFunction, Request, Response } from 'express';
import { RolePermissionModel } from './rolePermission.model';
export const updateAccess = async (req: Request, res: Response,next:NextFunction) => {
  try {
    const { role } = req.params;
    const { resource, method, title,access } = req.body;

    if (typeof access !== 'boolean') {
      return res.status(400).json({ success: false, message: '`access` must be boolean' });
    }

    const doc = await RolePermissionModel.findOne({ role });
    if (!doc) return res.status(404).json({ success: false, message: 'Role not found' });

    const resourceEntry = doc.resources.find(r => r.resource === resource);
    if (!resourceEntry) return res.status(404).json({ success: false, message: 'Resource not found' });

    const actionEntry = resourceEntry.source.find(s => s.method === method.toUpperCase() && s.title === title);
    if (!actionEntry) return res.status(404).json({ success: false, message: 'Action not found' });

    actionEntry.access = access;
    await doc.save();

    return res.json({ success: true, message: 'Access updated successfully', data: actionEntry });
  } catch (error: any) {

     }
};
export const getRolePermissions = async (req: Request, res: Response,next:NextFunction) => {
  try {
    const { role } = req.params;
    const doc = await RolePermissionModel.findOne({ role });
    if (!doc) return res.status(404).json({ success: false, message: 'Role not found' }); 
    return res.json({ success: true, data: doc });
  } catch (error: any) {
    next(error);
  }
}
