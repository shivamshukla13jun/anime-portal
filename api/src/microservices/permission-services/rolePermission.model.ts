// src/models/rolePermission.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { Role } from 'microservices/auth-service/types'; // your existing enum

export interface IActionPermission {
  title: string;
  method: "POST" | "GET" | "PUT" | "DELETE" | "IMPORT" | "EXPORT" 
  access: boolean;
}

export interface IResourcePermission {
  resource: string; // e.g. "users"
  source: IActionPermission[];
}

export interface IRolePermission extends Document {
  role: Role;
  resources: IResourcePermission[];
}

// ───────────────────────────────
// Sub-schemas
// ───────────────────────────────
const ActionPermissionSchema = new Schema<IActionPermission>(
  {
    title: { type: String, required: true },
    method: { type: String, required: true },
    access: { type: Boolean, default: false },
  },
  { _id: false }
);

const ResourcePermissionSchema = new Schema<IResourcePermission>(
  {
    resource: { type: String, required: true },
    source: {
      type: [ActionPermissionSchema],
      default: [],
      validate: {
        validator: function (actions: IActionPermission[]) {
          // Ensure no duplicate (path + method) inside same resource
          const seen = new Set();
          for (const a of actions) {
            const key = `${a.title}:${a.method.toUpperCase()}`;
            if (seen.has(key)) return false;
            seen.add(key);
          }
          return true;
        },
        message: 'Duplicate (path + method) found inside the same resource.',
      },
    },
  },
  { _id: false }
);

// ───────────────────────────────
// Main Schema
// ───────────────────────────────
const RolePermissionSchema = new Schema<IRolePermission>(
  {
    role: {
      type: String,
      enum: Object.values(Role),
      required: true,
      unique: true,
    },
    resources: {
      type: [ResourcePermissionSchema],
      default: [],
      validate: [
        {
          validator: function (resources: IResourcePermission[]) {
            // 1️⃣ Ensure resource names are unique
            const names = resources.map((r) => r.resource);
            return names.length === new Set(names).size;
          },
          message: 'Duplicate resource names found.',
        },
        {
          validator: function (resources: IResourcePermission[]) {
            // 2️⃣ Ensure no duplicate (path + method) across *all* resources
            const seen = new Set();
            for (const r of resources) {
              for (const a of r.source) {
                const key = `${a.title}:${a.method.toUpperCase()}`;
                if (seen.has(key)) return false;
                seen.add(key);
              }
            }
            return true;
          },
          message: 'Duplicate (path + method) combination found across multiple resources.',
        },
      ],
    },
  },
  {
    collection: 'rolepermissions',
    versionKey: false,
  }
);

// ───────────────────────────────
// Export
// ───────────────────────────────
export const RolePermissionModel: Model<IRolePermission> =
  mongoose.models.RolePermission ||
  mongoose.model<IRolePermission>('RolePermission', RolePermissionSchema);
