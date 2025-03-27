import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Avatar
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  VerifiedUser as VerifiedUserIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  
  useEffect(() => {
    // Fetch users when component mounts or filters change
    fetchUsers();
  }, [page, rowsPerPage, searchTerm, filterRole, filterStatus]);
  
  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy: 'createdAt',
        order: 'desc'
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (filterRole) {
        params.role = filterRole;
      }
      
      if (filterStatus) {
        params.status = filterStatus;
      }
      
      const response = await authService.getUsers(params);
      
      setUsers(response.data.users || []);
      setTotalCount(response.data.totalCount || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Erreur lors du chargement des utilisateurs');
      setLoading(false);
    }
  };
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  // Handle role filter change
  const handleRoleFilterChange = (event) => {
    setFilterRole(event.target.value);
    setPage(0);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };
  
  // Open action menu
  const handleOpenActionMenu = (event, userId) => {
    setActionMenuAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };
  
  // Close action menu
  const handleCloseActionMenu = () => {
    setActionMenuAnchorEl(null);
    setSelectedUserId(null);
  };
  
  // Open block dialog
  const handleOpenBlockDialog = (user) => {
    setSelectedUser(user);
    setBlockDialogOpen(true);
    handleCloseActionMenu();
  };
  
  // Close block dialog
  const handleCloseBlockDialog = () => {
    setBlockDialogOpen(false);
    setSelectedUser(null);
  };
  
  // Open role dialog
  const handleOpenRoleDialog = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setRoleDialogOpen(true);
    handleCloseActionMenu();
  };
  
  // Close role dialog
  const handleCloseRoleDialog = () => {
    setRoleDialogOpen(false);
    setSelectedUser(null);
    setSelectedRole('');
  };
  
  // Block/unblock user
  const handleToggleBlockUser = async () => {
    try {
      setLoading(true);
      
      const action = selectedUser.status === 'active' ? 'block' : 'unblock';
      await authService.updateUserStatus(selectedUser.id, action);
      
      // Refresh users
      fetchUsers();
      
      handleCloseBlockDialog();
    } catch (error) {
      console.error('Error updating user status:', error);
      setError(`Erreur lors de la ${selectedUser.status === 'active' ? 'désactivation' : 'réactivation'} de l'utilisateur`);
      setLoading(false);
    }
  };
  
  // Update user role
  const handleUpdateUserRole = async () => {
    try {
      setLoading(true);
      
      await authService.updateUserRole(selectedUser.id, selectedRole);
      
      // Refresh users
      fetchUsers();
      
      handleCloseRoleDialog();
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Erreur lors de la mise à jour du rôle de l\'utilisateur');
      setLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };
  
  // Get role chip
  const getRoleChip = (role) => {
    switch (role) {
      case 'admin':
        return <Chip label="Admin" color="error" size="small" icon={<AdminIcon />} />;
      case 'organizer':
        return <Chip label="Organisateur" color="primary" size="small" icon={<VerifiedUserIcon />} />;
      case 'user':
        return <Chip label="Utilisateur" color="default" size="small" icon={<PersonIcon />} />;
      default:
        return <Chip label={role} size="small" />;
    }
  };
  
  // Get status chip
  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip label="Actif" color="success" size="small" />;
      case 'blocked':
        return <Chip label="Bloqué" color="error" size="small" />;
      case 'pending':
        return <Chip label="En attente" color="warning" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };
  
  // Get user initials for avatar
  const getUserInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Gestion des utilisateurs
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="role-filter-label">Rôle</InputLabel>
              <Select
                labelId="role-filter-label"
                id="role-filter"
                value={filterRole}
                label="Rôle"
                onChange={handleRoleFilterChange}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="organizer">Organisateur</MenuItem>
                <MenuItem value="user">Utilisateur</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">Statut</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={filterStatus}
                label="Statut"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="active">Actif</MenuItem>
                <MenuItem value="blocked">Bloqué</MenuItem>
                <MenuItem value="pending">En attente</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {
                setSearchTerm('');
                setFilterRole('');
                setFilterStatus('');
              }}
            >
              Réinitialiser
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Date d'inscription</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Billets achetés</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && page === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {getUserInitials(user.firstName, user.lastName)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.city || 'Aucune ville'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>{getRoleChip(user.role)}</TableCell>
                  <TableCell>{getStatusChip(user.status)}</TableCell>
                  <TableCell>{user.ticketCount || 0}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleOpenActionMenu(e, user.id)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </TableContainer>
      
      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleCloseActionMenu}
      >
        <MenuItem onClick={() => {
          const user = users.find(u => u.id === selectedUserId);
          handleOpenRoleDialog(user);
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Modifier le rôle
        </MenuItem>
        <MenuItem onClick={() => {
          const user = users.find(u => u.id === selectedUserId);
          handleOpenBlockDialog(user);
        }}>
          <BlockIcon fontSize="small" sx={{ mr: 1 }} />
          {users.find(u => u.id === selectedUserId)?.status === 'active' ? 'Bloquer' : 'Débloquer'}
        </MenuItem>
      </Menu>
      
      {/* Block/Unblock User Dialog */}
      <Dialog
        open={blockDialogOpen}
        onClose={handleCloseBlockDialog}
      >
        <DialogTitle>
          {selectedUser?.status === 'active' ? 'Bloquer l\'utilisateur' : 'Débloquer l\'utilisateur'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedUser?.status === 'active' 
              ? `Êtes-vous sûr de vouloir bloquer l'utilisateur ${selectedUser?.firstName} ${selectedUser?.lastName} (${selectedUser?.email}) ? L'utilisateur ne pourra plus se connecter à son compte.`
              : `Êtes-vous sûr de vouloir débloquer l'utilisateur ${selectedUser?.firstName} ${selectedUser?.lastName} (${selectedUser?.email}) ? L'utilisateur pourra à nouveau se connecter à son compte.`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBlockDialog}>Annuler</Button>
          <Button 
            onClick={handleToggleBlockUser} 
            color={selectedUser?.status === 'active' ? 'error' : 'primary'} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (selectedUser?.status === 'active' ? 'Bloquer' : 'Débloquer')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Change Role Dialog */}
      <Dialog
        open={roleDialogOpen}
        onClose={handleCloseRoleDialog}
      >
        <DialogTitle>Modifier le rôle</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Modifier le rôle de l'utilisateur {selectedUser?.firstName} {selectedUser?.lastName} ({selectedUser?.email}).
          </DialogContentText>
          
          <FormControl fullWidth>
            <InputLabel id="role-select-label">Rôle</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={selectedRole}
              label="Rôle"
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="organizer">Organisateur</MenuItem>
              <MenuItem value="user">Utilisateur</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog}>Annuler</Button>
          <Button 
            onClick={handleUpdateUserRole} 
            color="primary" 
            variant="contained"
            disabled={loading || selectedRole === selectedUser?.role}
          >
            {loading ? <CircularProgress size={24} /> : 'Mettre à jour'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsersPage;

