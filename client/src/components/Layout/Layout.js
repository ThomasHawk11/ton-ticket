import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  AccountCircle, 
  Event as EventIcon, 
  ConfirmationNumber as TicketIcon, 
  Dashboard as DashboardIcon, 
  ExitToApp as LogoutIcon, 
  Person as PersonIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Footer from './Footer';

const Layout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for menus and drawer
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Handle profile menu
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle drawer
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    setDrawerOpen(false);
  };
  
  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    handleProfileMenuClose();
    setDrawerOpen(false);
  };
  
  // Drawer content
  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Ton Ticket
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem button onClick={() => handleNavigation('/')}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button onClick={() => handleNavigation('/events')}>
          <ListItemIcon>
            <EventIcon />
          </ListItemIcon>
          <ListItemText primary="Events" />
        </ListItem>
        
        {isAuthenticated && (
          <>
            <ListItem button onClick={() => handleNavigation('/my-tickets')}>
              <ListItemIcon>
                <TicketIcon />
              </ListItemIcon>
              <ListItemText primary="My Tickets" />
            </ListItem>
            <ListItem button onClick={() => handleNavigation('/profile')}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            
            {user && (user.role === 'admin' || user.role === 'organizer') && (
              <ListItem button onClick={() => handleNavigation('/admin')}>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
            )}
            
            <Divider />
            
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        )}
        
        {!isAuthenticated && (
          <>
            <Divider />
            <ListItem button onClick={() => handleNavigation('/login')}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button onClick={() => handleNavigation('/register')}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/"
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 'bold'
            }}
          >
            Ton Ticket
          </Typography>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/"
                sx={{ mx: 1 }}
              >
                Home
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/events"
                sx={{ mx: 1 }}
              >
                Events
              </Button>
              
              {isAuthenticated && (
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/my-tickets"
                  sx={{ mx: 1 }}
                >
                  My Tickets
                </Button>
              )}
              
              {isAuthenticated && user && (user.role === 'admin' || user.role === 'organizer') && (
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/admin"
                  sx={{ mx: 1 }}
                >
                  Dashboard
                </Button>
              )}
            </Box>
          )}
          
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
            </Box>
          ) : (
            <Box>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                sx={{ mx: 1 }}
              >
                Login
              </Button>
              <Button 
                variant="contained" 
                color="secondary" 
                component={RouterLink} 
                to="/register"
                sx={{ mx: 1 }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Profile Menu */}
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={() => handleNavigation('/profile')}>Profile</MenuItem>
        <MenuItem onClick={() => handleNavigation('/my-tickets')}>My Tickets</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
      
      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerContent}
      </Drawer>
      
      {/* Main Content */}
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>
      
      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default Layout;

