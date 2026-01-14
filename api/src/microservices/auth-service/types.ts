export enum Role {
  SELLER = 'seller',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
  CUSTOMER = 'customer',
}

export const ROLES = Object.values(Role);
export const UnAuthRoles = Object.values(Role).filter((role) => role !== Role.SUPERADMIN)



