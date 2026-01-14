import {  useAppSelector } from '@/redux/store';
import { useState, useEffect } from 'react';
import { isRole } from '.';
import { Role, Roles } from '@/types';
import { CurrentUser } from '@/redux/selectors';

/**
 * Gets roles that the current user can assign
 */
export const getAssignableRoles = () => {
    const user = useAppSelector(CurrentUser);
   const [showRoles, setShowRoles] = useState<string[]>([]);
    const ADMIN_ASSIGNABLE_ROLES =Roles.filter((role:Role)=>role!=="superadmin"&& role!=="admin")
    const SUPERADMIN_ASSIGNABLE_ROLES = Roles.filter((role:Role)=>role=="admin")
   useEffect(() => {
    if(isRole.isSuperAdmin(user?.role as Role)) {
        setShowRoles(SUPERADMIN_ASSIGNABLE_ROLES);
    } else if(isRole.isAdmin(user?.role as Role)) {
        setShowRoles(ADMIN_ASSIGNABLE_ROLES);
    }
   }, [user]);

   return showRoles;
};

export default getAssignableRoles;