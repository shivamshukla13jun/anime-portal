import React from 'react';
import { lazy } from 'react';
import { paths } from '@/utils/paths';

import { ActionType, ResourceType, RoteExtended } from '@/types';
import { lazyWithAuth } from '@/hooks/ProtectedRoute/authUtils';

// users 
const Users = lazyWithAuth(() => import('@/pages/users'), "GET", "Read All","");

// Dashboard 
const MenuManagement = lazyWithAuth(() => import('@/pages/SuperAdmin/MenuManagement'),"GET","menu-management","menu-management");

// auth pages
const Login = lazy(() => import('@/pages/Auth/Login'));
const ForgetPassword = lazy(() => import('@/pages/Auth/ForgetPassword'));
const NotAuthorized = lazy(() => import('@/pages/NotAuthorized'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const ResetPassword = lazy(() => import('@/pages/Auth/resetPassword'));

// Define route interface
export interface Route {
  path: string;
  element?: React.LazyExoticComponent<React.FC> | React.FC;
  title: string;
  icon?: string;
  icontype?: string;
  hideInMenu?: boolean;
  children?: Route[];
  action?: ActionType;
  resource?: ResourceType;
}
// Function to generate routes recursively
const generateRoutes = (routes: Route[], parentPath = ''): Route[] => {
  return routes.map(route => {
    const fullPath = `${parentPath}${route.path}`.replace('//', '/');
    const newRoute: Route = {
      ...route,
      path: fullPath,
      element: route.element,
    };

    if (route.children) {
      newRoute.children = generateRoutes(route.children, fullPath);
    }

    return newRoute;
  });
};
// Function to flatten routes for React Router
const flattenRoutes = (routes: Route[]): Route[] => {
  return routes.reduce((acc: Route[], route: Route) => {
    acc.push(route);
    if (route.children) {
      acc.push(...flattenRoutes(route.children));
    }
    return acc;
  }, []);
};
// Base routes configuration
const baseProtectedRoutes: RoteExtended[] = [
  {
    path: "/menu-management",
    element: MenuManagement,
    title: 'Menus',
    icon: 'menu',
    icontype: "md",
    action: "GET",
    parentResource:"menu-management",
    resource: "menu-management",
  },
  {
    path: paths.users,
    element: Users,
    title: 'Users',
    icon: 'users',
    action: "GET",
    parentResource:"users",
    resource: "Read All",
  },


];
export const publicRoutes: RoteExtended[] = [
  {
    path: paths.login,
    element: Login,
    title: 'Login',
    action: "GET",
    resource: "layout",
    parentResource:"layout",
  },

  {
    path: paths.notfound,
    element: NotFound,
    title: '404',
    action: "GET",
    resource: "layout",
    parentResource:"layout",
  },
  // forget password
  {
    path: paths.forgetpassword,
    element: ForgetPassword,
    title: 'Forget Password',
    action: "GET",
    resource: "layout",
    parentResource:"layout",
  },
  // not authorized
  {
    path: paths.NotAuthorized,
    element: NotAuthorized,
    title: '403',
   action: "GET",
    resource: "layout",
    parentResource:"layout",
  },
  // wild card route
  {
    path: '*',
    element: NotFound,
    title: '404',
   action: "GET",
    resource: "layout",
    parentResource:"layout",
  },
  {
    path: `${paths.resetpassword}/:token`,
    element: ResetPassword,
    title: '404',
    action: "GET",
    resource: "layout",
    parentResource:"layout",
  },


];
export const routes = generateRoutes(publicRoutes);

export const protectedRoutes = generateRoutes(baseProtectedRoutes);