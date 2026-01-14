import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, Toolbar, Breadcrumbs, Typography, Link } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import AppHeader from './Header';
import SideDrawer from './Sidebar/Index';
import { useAppSelector } from '@/redux/store';
import { protectedRoutes,Route } from '@/routes';

// Helper function to find route by path
// Returns an array of matched routes (from root -> leaf)
const findRouteChain = (routes: Route[], path: string): Route[] | null => {
  for (const route of routes) {

    // Direct match
    if (route.path === path) {
      return [route];
    }

    // Dynamic match
    if (route.path.includes(':')) {
      // console.log("dynamic match",route)
      const routePathPattern = route.path.replace(/:\w+/g, '[^/]+');
      const regex = new RegExp(`^${routePathPattern}$`);
      if (regex.test(path)) {
        return [route];
      }
    }

    // Children recursion
    if (route.children) {
      // console.log("search inside children",route)
      const childChain = findRouteChain(route.children, path);
      if (childChain) {
        // console.log("child chain",childChain)
        return [route, ...childChain];
      }
    }
  }

  return null;
};


const Layout: React.FC = () => {
  const isSidebarExpanded = useAppSelector((state) => state.sidebar.isOpen);
  const drawerWidth = isSidebarExpanded ? 240 : 73;
  const location = useLocation();
  const navigate = useNavigate();

  // get full breadcrumb chain
  const routeChain = findRouteChain(protectedRoutes, location.pathname) || [];

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppHeader drawerWidth={drawerWidth} />
      <SideDrawer drawerWidth={drawerWidth} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#f9f9f9',
          overflowY: 'auto',
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          transition: theme =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Toolbar />
        <Box>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Link
              color="inherit"
              onClick={() => navigate(-1)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              Back
            </Link>
            {routeChain.map((route, idx) => (
              <Typography key={idx} color="text.primary" sx={{ fontWeight: 'medium' }}>
                {route.title}
              </Typography>
            ))}
          </Breadcrumbs>
        </Box>
        <Outlet />
      </Box>
    </Box>
  );
};


export default Layout;
