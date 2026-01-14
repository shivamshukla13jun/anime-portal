import { Role } from 'microservices/auth-service/types';
import { IRolePermission, RolePermissionModel, IActionPermission } from 'microservices/permission-services/rolePermission.model';

// ──────────────
// Seed type for role permissions JSON
// ──────────────

// Define seed array
export const rolePermissionsJSON = [
  {
    role: Role.SUPERADMIN,
    resources: [
      {
        resource: 'Users' as const,
        source: [
          { title: 'Create' as const, method: 'POST' as const, access: true as boolean },
          { title: 'Read All' as const, method: 'GET' as const, access: true as boolean },
          { title: 'Read' as const, method: 'GET' as const, access: true as boolean },
          { title: 'Delete' as const, method: 'DELETE' as const, access: true as boolean },
          { title: 'Activate' as const, method: 'PUT' as const, access: true as boolean },
          { title: 'Block' as const, method: 'PUT' as const, access: true as boolean },
        ],
      },
      {
        resource: 'Products' as const,
        source: [
          { title: 'Create' as const, method: 'POST' as const, access: true as boolean },
          { title: 'Read' as const, method: 'GET' as const, access: true as boolean },
        ],
      },
    ],
  },
  {
    role: Role.ADMIN,
    resources: [
      {
        resource: 'Users' as const,
        source: [
          { title: 'Read All' as const, method: 'GET' as const, access: true as boolean },
          { title: 'Update' as const, method: 'PUT' as const, access: true as boolean },
        ],
      },
    ],
  },
  {
    role: Role.SELLER,
    resources: [
      {
        resource: 'Products' as const,
        source: [
          { title: 'Create' as const, method: 'POST' as const, access: true as boolean },
          { title: 'Read' as const, method: 'GET' as const, access: true as boolean },
        ],
      },
    ],
  },
  {
    role: Role.CUSTOMER,
    resources: [
      {
        resource: 'Products' as const,
        source: [
          { title: 'Create' as const, method: 'POST' as const, access: true as boolean },
          { title: 'Read' as const, method: 'GET' as const, access: true as boolean },
        ],
      },
    ],
  },
] as const;

// ──────────────
// Type Extraction
// ──────────────
type SeedRoleEntry = typeof rolePermissionsJSON[number];

// Union of all source titles
export type ResourceType = SeedRoleEntry['resources'][number]['source'][number]['title'];

// Union of all source methods
export type ActionType = SeedRoleEntry['resources'][number]['source'][number]['method'];

// Union of parent resources
export type ParentResourceType = SeedRoleEntry['resources'][number]['resource'];

// ──────────────
// Seeder Logic
// ──────────────
const rolePermissionSeeder = async () => {
  for (const roleEntry of rolePermissionsJSON) {
    const existing = await RolePermissionModel.findOne({ role: roleEntry.role });

    if (existing) {
      let updated = false;

      for (const newRes of roleEntry.resources) {
        const existingRes = existing.resources.find(
          (r) => r.resource === newRes.resource
        );

        if (existingRes) {
          // Merge new sources only
          for (const newSrc of newRes.source) {
            const found = existingRes.source.find(
              (s) => s.title === newSrc.title && s.method === newSrc.method
            );
            if (!found) {
                // normalize method to uppercase and ensure shape matches IActionPermission
                existingRes.source.push({
                  title: newSrc.title,
                  method: ((newSrc.method || '').toUpperCase() as IActionPermission['method']),
                  access: !!newSrc.access,
                });
              updated = true;
            }
          }
        } else {
          // Add new resource - normalize its source methods
          const normalized = {
            resource: newRes.resource,
            source: (newRes.source || []).map(s => ({ title: s.title, method: ((s.method || '').toUpperCase() as IActionPermission['method']), access: !!s.access }))
          };
          // Add normalized resource
          existing.resources.push(normalized as any);
          updated = true;
        }
      }

      if (updated) {
        await RolePermissionModel.updateOne(
          { role: roleEntry.role },
          { $set: { resources: existing.resources } },
          { upsert: true }
        );
        console.log(`🔁 Updated (added new entries) for role: ${roleEntry.role}`);
      } else {
        console.log(`✅ No new resources or sources for ${roleEntry.role}`);
      }
    } else {
      // Insert new role - normalize resource methods
      const normalizedEntry = {
        role: roleEntry.role,
        resources: (roleEntry.resources || []).map(r => ({
          resource: r.resource,
          source: (r.source || []).map(s => ({ title: s.title, method: ((s.method || '').toUpperCase() as IActionPermission['method']), access: !!s.access }))
        }))
      };
      // Insert new role
      await RolePermissionModel.updateOne(
        { role: roleEntry.role },
        { $setOnInsert: normalizedEntry },
        { upsert: true }
      );
      console.log(`✨ Created role permission for ${roleEntry.role}`);
    }
  }

  console.log('✅ Role permissions seeding completed successfully!');
};

export default rolePermissionSeeder;

// rolePermissionSeeder().catch(console.error);
