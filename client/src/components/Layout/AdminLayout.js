import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  useTheme,
  Collapse,
  ListItemButton
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Event as EventIcon,
  ConfirmationNumber as TicketIcon,
  People as PeopleIcon,
  BarChart as ChartIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  EventNote as EventNoteIcon,
  Add as AddIcon,
  AccountCircle
} from '@mui/icons-material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const AdminLayout = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [open, setOpen] = useState(!isMobile);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [eventsOpen, setEventsOpen] = useState(false);
  
  // Handle drawer open/close
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  
  const handleDrawerClose = () => {
    setOpen(false);
  };
  
  // Handle user menu open/close
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Handle profile click
  const handleProfileClick = () => {
    navigate('/profile');
    handleUserMenuClose();
  };
  
  // Toggle events submenu
  const handleEventsToggle = () => {
    setEventsOpen(!eventsOpen);
  };
  
  // Check if route is active
  const isRouteActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    if (path !== '/admin' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };
  
  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            TonTicket Admin
          </Typography>
          
          {/* User Menu */}
          <Tooltip title={user?.email || 'Utilisateur'}>
            <IconButton 
              onClick={handleUserMenuOpen} 
              color="inherit"
              sx={{ p: 0 }}
            >
              <Avatar 
                alt={`${user?.firstName} ${user?.lastName}`} 
                src={user?.avatar}
                sx={{ bgcolor: theme.palette.primary.main }}
              >
                {user?.firstName?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      
      {/* Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={handleDrawerClose}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            ...(isMobile && !open && { display: 'none' }),
          },
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: [1],
          }}
        >
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        
        {/* Main Menu Items */}
        <List>
          <ListItem 
            button 
            component={Link} 
            to="/admin" 
            selected={isRouteActive('/admin')}
          >
            <ListItemIcon>
              <DashboardIcon color={isRouteActive('/admin') ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary="Tableau de bord" />
          </ListItem>
          
          {/* Events with submenu */}
          <ListItem button onClick={handleEventsToggle}>
            <ListItemIcon>
              <EventIcon color={isRouteActive('/admin/events') ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary="Événements" />
            {eventsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          
          <Collapse in={eventsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton 
                sx={{ pl: 4 }} 
                component={Link} 
                to="/admin/events"
                selected={location.pathname === '/admin/events'}
              >
                <ListItemIcon>
                  <EventNoteIcon color={location.pathname === '/admin/events' ? "primary" : "inherit"} />
                </ListItemIcon>
                <ListItemText primary="Liste des événements" />
              </ListItemButton>
              
              <ListItemButton 
                sx={{ pl: 4 }} 
                component={Link} 
                to="/admin/events/new"
                selected={location.pathname === '/admin/events/new'}
              >
                <ListItemIcon>
                  <AddIcon color={location.pathname === '/admin/events/new' ? "primary" : "inherit"} />
                </ListItemIcon>
                <ListItemText primary="Nouvel événement" />
              </ListItemButton>
            </List>
          </Collapse>
          
          <ListItem 
            button 
            component={Link} 
            to="/admin/tickets" 
            selected={isRouteActive('/admin/tickets')}
          >
            <ListItemIcon>
              <TicketIcon color={isRouteActive('/admin/tickets') ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary="Billets" />
          </ListItem>
          
          {user?.role === 'admin' && (
            <>
              <ListItem 
                button 
                component={Link} 
                to="/admin/users" 
                selected={isRouteActive('/admin/users')}
              >
                <ListItemIcon>
                  <PeopleIcon color={isRouteActive('/admin/users') ? "primary" : "inherit"} />
                </ListItemIcon>
                <ListItemText primary="Utilisateurs" />
              </ListItem>
              
              <ListItem 
                button 
                component={Link} 
                to="/admin/stats" 
                selected={isRouteActive('/admin/stats')}
              >
                <ListItemIcon>
                  <ChartIcon color={isRouteActive('/admin/stats') ? "primary" : "inherit"} />
                </ListItemIcon>
                <ListItemText primary="Statistiques" />
              </ListItem>
              
              <ListItem 
                button 
                component={Link} 
                to="/admin/settings" 
                selected={isRouteActive('/admin/settings')}
              >
                <ListItemIcon>
                  <SettingsIcon color={isRouteActive('/admin/settings') ? "primary" : "inherit"} />
                </ListItemIcon>
                <ListItemText primary="Paramètres" />
              </ListItem>
            </>
          )}
        </List>
        
        <Divider />
        
        {/* Bottom Menu Items */}
        <List>
          <ListItem button onClick={handleProfileClick}>
            <ListItemIcon>
              <AccountCircle />
            </ListItemIcon>
            <ListItemText primary="Mon profil" />
          </ListItem>
          
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Déconnexion" />
          </ListItem>
        </List>
      </Drawer>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar /> {/* This is for spacing below the AppBar */}
        {children}
      </Box>
      
      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchorEl}
        open={Boolean(userMenuAnchorEl)}
        onClose={handleUserMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Mon profil" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Déconnexion" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AdminLayout;

