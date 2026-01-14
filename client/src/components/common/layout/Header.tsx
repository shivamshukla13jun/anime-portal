import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, IconButton, Typography, Badge, Menu, MenuItem, Tooltip, Box, ListItemIcon, ListItemText, Select, FormControl, InputLabel, SelectChangeEvent, FormControlLabel, Switch } from "@mui/material";
import { Menu as MenuIcon, Notifications as NotificationsIcon, AccountCircle, Logout as LogoutIcon, Person as PersonIcon } from "@mui/icons-material";
import { toggleSidebar } from "@/redux/slices/sidebarSlice";
import apiService from "@/service/apiService";
import { paths } from "@/utils/paths";
import { AppDispatch, useAppSelector } from '@/redux/store';
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import { IUser } from "@/types";

interface HeaderProps {
  drawerWidth: number;
}

const Header: React.FC<HeaderProps> = ({ drawerWidth }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user,themeMode} = useAppSelector((state) => state.user);
  // Fetch notifications using React Query

  // Menu anchors
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);

  const logoutMutation = useMutation({
    mutationFn: () => apiService.AuthService.logout(),
    onSuccess: () => {
      dispatch({ type: 'LOGOUT' });
      navigate(paths.login, { replace: true });
      toast.success('Logged out successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Logout failed');
    }
  });
 
  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);

  };

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    handleUserMenuClose();
  };
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: themeMode === 'dark' ? '#333' : 'white',
        color: "primary.main",
        boxShadow: 1,
        transition: theme => theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => dispatch(toggleSidebar())}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
           
        </Typography>
        {/* Notifications */}
        <Box sx={{ display: 'flex' }}>
        
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleNotificationClick}
              aria-controls="notification-menu"
              aria-haspopup="true"
            >
              <Badge badgeContent={1} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu
            id="notification-menu"
            anchorEl={notificationAnchorEl}
            keepMounted
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationClose}
            PaperProps={{
              style: {
                maxHeight: 300,
                width: 320,
              },
            }}
          >
            {/* {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <MenuItem key={index} onClick={() => handleNotificationItemClick(notification)}>
                  {notification.message}
                </MenuItem>
              ))
            ) : (
              <MenuItem>No notifications</MenuItem>
            )} */}
          </Menu>

          {/* User Menu */}
          <Tooltip title="Account settings">
            <IconButton
              color="inherit"
              onClick={handleUserMenuClick}
              aria-controls="user-menu"
              aria-haspopup="true"
              sx={{ ml: 1 }}
            >
              <AccountCircle />
            </IconButton>
          </Tooltip>
          <Menu
            id="user-menu"
            anchorEl={userMenuAnchorEl}
            keepMounted
            open={Boolean(userMenuAnchorEl)}
            onClose={handleUserMenuClose}
          >

            {/* role  */}
            <MenuItem sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <ListItemIcon>
    <PersonIcon fontSize="small" color="primary" />
  </ListItemIcon>
  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    <Typography
      variant="body1"
      sx={{ fontWeight: 600, textTransform: "capitalize", lineHeight: 1.2 }}
    >
      {user?.name}
    </Typography>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ textTransform: "capitalize" }}
    >
      {user?.role}
    </Typography>
  </Box>
               </MenuItem>

            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;