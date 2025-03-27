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
  Select
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import eventService from '../../services/eventService';

const AdminEventsPage = () => {
  const navigate = useNavigate();
  
  // State
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [categories, setCategories] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  
  useEffect(() => {
    // Fetch events when component mounts or filters change
    fetchEvents();
    fetchCategories();
  }, [page, rowsPerPage, searchTerm, filterCategory, filterStatus]);
  
  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy: 'startDate',
        order: 'desc'
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (filterCategory) {
        params.category = filterCategory;
      }
      
      if (filterStatus) {
        params.status = filterStatus;
      }
      
      const response = await eventService.getEvents(params);
      
      setEvents(response.data.events || []);
      setTotalCount(response.data.totalCount || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Erreur lors du chargement des événements');
      setLoading(false);
    }
  };
  
  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await eventService.getEventCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
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
  
  // Handle category filter change
  const handleCategoryFilterChange = (event) => {
    setFilterCategory(event.target.value);
    setPage(0);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };
  
  // Open action menu
  const handleOpenActionMenu = (event, eventId) => {
    setActionMenuAnchorEl(event.currentTarget);
    setSelectedEventId(eventId);
  };
  
  // Close action menu
  const handleCloseActionMenu = () => {
    setActionMenuAnchorEl(null);
    setSelectedEventId(null);
  };
  
  // Open delete dialog
  const handleOpenDeleteDialog = (event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
    handleCloseActionMenu();
  };
  
  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };
  
  // Delete event
  const handleDeleteEvent = async () => {
    try {
      setLoading(true);
      
      await eventService.deleteEvent(eventToDelete.id);
      
      // Refresh events
      fetchEvents();
      
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Erreur lors de la suppression de l\'événement');
      setLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };
  
  // Get event status
  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    if (now < startDate) {
      return { label: 'À venir', color: 'primary' };
    } else if (now >= startDate && now <= endDate) {
      return { label: 'En cours', color: 'success' };
    } else {
      return { label: 'Terminé', color: 'default' };
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Gestion des événements
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/events/new')}
        >
          Nouvel événement
        </Button>
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
              placeholder="Rechercher un événement..."
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
              <InputLabel id="category-filter-label">Catégorie</InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={filterCategory}
                label="Catégorie"
                onChange={handleCategoryFilterChange}
              >
                <MenuItem value="">Toutes</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
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
                <MenuItem value="upcoming">À venir</MenuItem>
                <MenuItem value="ongoing">En cours</MenuItem>
                <MenuItem value="past">Terminé</MenuItem>
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
                setFilterCategory('');
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
              <TableCell>Titre</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Lieu</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Billets</TableCell>
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
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  Aucun événement trouvé
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => {
                const status = getEventStatus(event);
                
                return (
                  <TableRow key={event.id}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{formatDate(event.startDate)}</TableCell>
                    <TableCell>{event.venue?.name || 'Non défini'}</TableCell>
                    <TableCell>{event.category?.name || 'Non catégorisé'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={status.label} 
                        color={status.color} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {event.ticketsSold || 0}/{event.ticketsAvailable || 0}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={() => navigate(`/events/${event.id}`)}
                        title="Voir"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => navigate(`/admin/events/${event.id}`)}
                        title="Modifier"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleOpenActionMenu(e, event.id)}
                        title="Plus d'options"
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
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
          navigate(`/admin/events/${selectedEventId}`);
          handleCloseActionMenu();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Modifier
        </MenuItem>
        <MenuItem onClick={() => {
          const event = events.find(e => e.id === selectedEventId);
          handleOpenDeleteDialog(event);
        }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Supprimer
        </MenuItem>
      </Menu>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer l'événement "{eventToDelete?.title}" ? 
            Cette action est irréversible et supprimera également tous les billets associés.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button 
            onClick={handleDeleteEvent} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminEventsPage;

