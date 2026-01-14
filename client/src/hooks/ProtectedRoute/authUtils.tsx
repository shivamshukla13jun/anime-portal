import { Role, ActionType, ResourceType, PermissionCheck, ParentResourceType } from '@/types';
import { UserState, logout,fetchCurrentUser } from '@/redux/slices/UserSlice';
import { lazy, Suspense } from 'react';
import { useDispatch} from 'react-redux';
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { paths } from '@/utils/paths';
import apiService from '@/service/apiService';
import { AppDispatch, useAppSelector } from '@/redux/store';
import { useQuery } from '@tanstack/react-query';
interface RouteProps {
  children: React.ReactNode;
  action: ActionType;
  resource: ResourceType;
      parentResource: ParentResourceType;
  
}

// =============================================================================
// 2. USER PERMISSION CHECKER CLASS (CUSTOM IMPLEMENTATION)
// =============================================================================

export class UserPermissionChecker {
  private user: UserState;

  constructor(user: UserState) {
    this.user = user;
  }

  /**
   * Checks if the user has a specific permission for a given resource.
   */
  hasPermission(action: ActionType, resource: ResourceType,ParentResourceType:ParentResourceType): boolean {
    //   // All authenticated users can see the main layout and dashboard.
    // if (resource === 'layout' || resource === 'dashboard') {
    //   return true;
    // }
    // else  if (this.user?.user?.role === "superadmin") {
    //    return true
    // }
    // else if (this.user?.user?.role ==="admin") { 
    //   return true;
    // }
    // const permissions = true
    // return permissions
    return true
  }

  
}

/**
 * A simple utility to check view access for a given route resource.
 */
export const hasAccess = (resource: ResourceType,action:ActionType,parentResource: ParentResourceType,user: UserState | null): boolean => {
  if (!user) {
    return false;
  }
  
  const checker = new UserPermissionChecker(user as UserState);
  return checker.hasPermission(action, resource,parentResource);
};
// for show show or hide buttons create,delete,edit use react function  and arguement take function  and show accosrding to permission
export const HasPermission = ({action, resource,component,parentResource}: {action: ActionType, resource: ResourceType, parentResource: ParentResourceType,component: React.ReactNode}): React.ReactNode => {
  const user = useAppSelector((state) => state.user)
  if (!user) {
    return null;
  }
  const checker = new UserPermissionChecker(user as UserState);
  return checker.hasPermission(action, resource,parentResource) ? component : null;
};

/**
 * Lazily loads a component only if the user has the required permissions.
 * If not, it lazily loads the NotAuthorized component.
 * @param factory - The import function for the component, e.g., () => import('@/pages/MyPage')
 * @param action - The action required to access the component.
 * @param resource - The resource the component belongs to.
 */
export const lazyWithAuth = (
  factory: () => Promise<{ default: React.ComponentType<any> }>,
  action: ActionType,
  resource: ResourceType,
  parentResource: ParentResourceType
) => {
  // Lazy load both target and NotAuthorized once
  const LazyComponent = lazy(factory);
  const NotAuthorized = lazy(() =>
    import("@/pages/NotAuthorized").then((module) => ({
      default: module.default as React.ComponentType<any>,
    }))
  );

  // Return wrapper that listens to userState dynamically
  const Wrapper: React.FC = (props) => {
    const userState = useAppSelector((state) => state.user);
    console.log("users page",userState)
    if (hasAccess(resource, action,parentResource, userState)) {
      return (
        <Suspense fallback={<div>Loading...</div>}>
          <LazyComponent {...props} />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <NotAuthorized />
      </Suspense>
    );
  };

  return Wrapper;
};
/**
 *  ProtectedRoute component
 * @param param  
 * @returns 
 */
export const ProtectedRoute: React.FC<RouteProps> = ({ children, action, resource,parentResource }) => {
  const   user  = useAppSelector((state) => state.user);
  if (!user) {
    return <Navigate to={`${paths.login}?next=${window.location.pathname}`} />;
  }
  const checker = new UserPermissionChecker(user);
  if (!checker.hasPermission(action, resource,parentResource) ) {
    return <Navigate to={paths.notauthorized} />;
  }

  return <>{children}</>;
};
/**
 *  useAuth hook
 * @returns  void
 */
export const useAuth= () => {
   const dispatch = useDispatch<AppDispatch>();
   const navigate=useNavigate()

 const query = useQuery({
  queryKey: ['fetchUser'],
  queryFn: () => dispatch(fetchCurrentUser()).unwrap(),
  retry: true,
  refetchOnWindowFocus: false,
});

useEffect(() => {
  if (query.isError) {
    console.error('Error fetching user:', query.error);
    dispatch(logout());
    navigate(`${paths.login}?next=${window.location.pathname}`);
  }
}, [query.isError]);

}


