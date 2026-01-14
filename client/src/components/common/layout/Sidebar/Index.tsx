import React from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  IconButton,
  Collapse,
  Typography,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { protectedRoutes } from "@/routes";
import { toggleSidebar } from "@/redux/slices/sidebarSlice";
import { AppDispatch,useAppSelector } from "@/redux/store";
import { UserLogout } from "@/redux/api";
import { getIcon } from "@/components/common/icons/getIcon";
import { SidebarMenuItem, SideDrawerProps } from "@/types";
import { hasAccess } from "@/hooks/ProtectedRoute/authUtils";

const SideDrawer: React.FC<SideDrawerProps> = ({ drawerWidth }) => {
  const isExpanded = useAppSelector((state) => state.sidebar.isOpen);
  const  user  = useAppSelector((state) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const [openSubMenus, setOpenSubMenus] = React.useState<Record<string, boolean>>({});

  // Use dynamic routes if available, otherwise fallback to static routes
  const menuRoutes = protectedRoutes;
  

  // On location change, auto-open any parent menus whose children match the current path
  React.useEffect(() => {
    const expanded: Record<string, boolean> = {};

    const stripParams = (path: string) => path.split(":")[0].replace(/\/$/, "");

    const expandMatchingSubMenus = (items: SidebarMenuItem[]) => {
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          const hasMatch = item.children.some((child) => {
            if (!child.path) return false;
            const base = stripParams(child.path);
            return location.pathname.startsWith(base);
          });
          if (hasMatch) {
            expanded[item.title] = true;
          }
          // Recurse into deeper levels if nested
          expandMatchingSubMenus(item.children);
        }
      });
    };

    expandMatchingSubMenus(menuRoutes as SidebarMenuItem[]);
    setOpenSubMenus((prev) => ({ ...prev, ...expanded }));
  }, [location.pathname, menuRoutes]);

  const handleSubMenuToggle = (title: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const stripParams = (path: string) => path.split(":")[0].replace(/\/$/, "");
  const normalizePath = (p: string) => stripParams(p);

  const renderMenuItems = (items: SidebarMenuItem[], level = 0) => {
    return items
      .filter((route) => !route.hideInMenu && hasAccess(route.resource,"GET",route.parentResource, user))
      .map((item, index) => {
        const icon = getIcon(item.icon);
        const basePath = item.path ? normalizePath(item.path) : "";
        const isActive =
          basePath && location.pathname.startsWith(basePath);
        const hasChildren = item.children && item.children.length > 0;
        const isSubMenuOpen = openSubMenus[item.title] || false;

        if (hasChildren) {
          return (
            <React.Fragment key={`${level}-${index}`}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSubMenuToggle(item.title)}
                  sx={{
                    pl: level * 2 + 2,
                    backgroundColor: isActive
                      ? "rgba(255, 255, 255, 0.2)"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  {icon && (
                    <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                      {icon}
                    </ListItemIcon>
                  )}
                  {isExpanded && (
                    <>
                      <ListItemText
                        primary={item.title}
                        sx={{ color: "white" }}
                      />
                      {isSubMenuOpen ? (
                        <ExpandLess sx={{ color: "white" }} />
                      ) : (
                        <ExpandMore sx={{ color: "white" }} />
                      )}
                    </>
                  )}
                </ListItemButton>
              </ListItem>
              {isExpanded && (
                <Collapse in={isSubMenuOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children && renderMenuItems(item.children, level + 1)}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        }

        // simple item
        // handle paramized paths (e.g., "/edit/:id") by stripping after colon
        const targetPath = item.path ? normalizePath(item.path) : "#";

        return (
          <ListItem disablePadding key={`${level}-${index}`} sx={{fontSize:"14px"}}>
            <ListItemButton
              component={Link}
              to={targetPath}
              sx={{
                pl: level * 2 + 2,
                backgroundColor: isActive
                  ? "rgba(255, 255, 255, 0.2)"
                  : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              {icon && (
                <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                  {icon}
                </ListItemIcon>
              )}
              {isExpanded && (
                <ListItemText primary={item.title} sx={{ color: "white" }} />
              )}
            </ListItemButton>
          </ListItem>
        );
      });
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "primary.main",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          overflowX: "hidden",
        },
      }}
      open={isExpanded}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isExpanded ? "space-between" : "center",
          px: [1],
        }}
      >
        {isExpanded && (
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ color: "white", fontWeight: "bold" }}
          >
            
          </Typography>
        )}
        <IconButton
          onClick={() => dispatch(toggleSidebar())}
          sx={{ color: "white" }}
        >
          {isExpanded ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>
      <Divider sx={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
      <List sx={{ pt: 0 }}>
        {renderMenuItems(menuRoutes as SidebarMenuItem[])}
        <Divider sx={{ my: 1, backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
        <ListItem disablePadding>
          <ListItemButton
            onClick={async () => dispatch(UserLogout())}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            {isExpanded && (
              <ListItemText primary="Logout" sx={{ color: "white" }} />
            )}
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default SideDrawer;
