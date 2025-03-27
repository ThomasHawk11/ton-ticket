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
  Tooltip
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  QrCode as QrCodeIcon,
  Email as EmailIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode.react';
import ticketService from '../../services/ticketService';
import eventService from '../../services/eventService';

const AdminTicketsPage = () => {
  const navigate = useNavigate();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [events, setEvents] = useState([]);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchTickets();
    fetchEvents();
  }, [page, rowsPerPage, searchTerm, filterEvent, filterStatus]);
  
  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy: 'purchaseDate',
        order: 'desc'
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (filterEvent) {
        params.eventId = filterEvent;
      }
      
      if (filterStatus) {
        params.status = filterStatus;
      }
      
      const response = await ticketService.getAllTickets(params);
      
      setTickets(response.data.tickets || []);
      setTotalCount(response.data.totalCount || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Erreur lors du chargement des billets');
      setLoading(false);
    }
  };
  
  const fetchEvents = async () => {
    try {
      const response = await eventService.getEvents({ limit: 100 });
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  const handleEventFilterChange = (event) => {
    setFilterEvent(event.target.value);
    setPage(0);
  };
  
  const handleStatusFilterChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };
  
  const handleOpenActionMenu = (event, ticketId) => {
    setActionMenuAnchorEl(event.currentTarget);
    setSelectedTicketId(ticketId);
  };
  
  const handleCloseActionMenu = () => {
    setActionMenuAnchorEl(null);
    setSelectedTicketId(null);
  };
  
  const handleOpenQrDialog = (ticket) => {
    setSelectedTicket(ticket);
    setQrDialogOpen(true);
    handleCloseActionMenu();
  };
  
  const handleCloseQrDialog = () => {
    setQrDialogOpen(false);
    setSelectedTicket(null);
  };
  
  const handleOpenCancelDialog = (ticket) => {
    setSelectedTicket(ticket);
    setCancelDialogOpen(true);
    handleCloseActionMenu();
  };
  
  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setSelectedTicket(null);
  };
  
  const handleOpenResendDialog = (ticket) => {
    setSelectedTicket(ticket);
    setResendDialogOpen(true);
    handleCloseActionMenu();
  };
  
  const handleCloseResendDialog = () => {
    setResendDialogOpen(false);
    setSelectedTicket(null);
  };
  
  const handleCancelTicket = async () => {
    try {
      setLoading(true);
      
      await ticketService.cancelTicket(selectedTicket.id);
      
      fetchTickets();
      
      handleCloseCancelDialog();
    } catch (error) {
      console.error('Error cancelling ticket:', error);
      setError('Erreur lors de l\'annulation du billet');
      setLoading(false);
    }
  };
  
  const handleResendTicket = async () => {
    try {
      setLoading(true);
      
      await ticketService.resendTicket(selectedTicket.id);
      
      handleCloseResendDialog();
      setLoading(false);
      
      setError(null);
      alert('Le billet a été renvoyé avec succès');
    } catch (error) {
      console.error('Error resending ticket:', error);
      setError('Erreur lors du renvoi du billet');
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getStatusChip = (status) => {
    switch (status) {
      case 'reserved':
        return <Chip label="Réservé" color="warning" size="small" />;
      case 'purchased':
        return <Chip label="Acheté" color="success" size="small" />;
      case 'cancelled':
        return <Chip label="Annulé" color="error" size="small" />;
      case 'used':
        return <Chip label="Utilisé" color="default" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Gestion des billets
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
              placeholder="Rechercher un billet..."
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
              <InputLabel id="event-filter-label">Événement</InputLabel>
              <Select
                labelId="event-filter-label"
                id="event-filter"
                value={filterEvent}
                label="Événement"
                onChange={handleEventFilterChange}
              >
                <MenuItem value="">Tous</MenuItem>
                {events.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.title}
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
                <MenuItem value="reserved">Réservé</MenuItem>
                <MenuItem value="purchased">Acheté</MenuItem>
                <MenuItem value="cancelled">Annulé</MenuItem>
                <MenuItem value="used">Utilisé</MenuItem>
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
                setFilterEvent('');
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
              <TableCell>ID</TableCell>
              <TableCell>Événement</TableCell>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Date d'achat</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && page === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  Aucun billet trouvé
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>{ticket.event?.title || 'N/A'}</TableCell>
                  <TableCell>{ticket.user?.email || 'N/A'}</TableCell>
                  <TableCell>{ticket.ticketType?.name || 'Standard'}</TableCell>
                  <TableCell>{formatCurrency(ticket.price || 0)}</TableCell>
                  <TableCell>{formatDate(ticket.purchaseDate || ticket.createdAt)}</TableCell>
                  <TableCell>{getStatusChip(ticket.status)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Voir QR Code">
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenQrDialog(ticket)}
                      >
                        <QrCodeIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleOpenActionMenu(e, ticket.id)}
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
      
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleCloseActionMenu}
      >
        <MenuItem onClick={() => {
          const ticket = tickets.find(t => t.id === selectedTicketId);
          handleOpenQrDialog(ticket);
        }}>
          <QrCodeIcon fontSize="small" sx={{ mr: 1 }} />
          Voir QR Code
        </MenuItem>
        <MenuItem onClick={() => {
          const ticket = tickets.find(t => t.id === selectedTicketId);
          handleOpenResendDialog(ticket);
        }}>
          <EmailIcon fontSize="small" sx={{ mr: 1 }} />
          Renvoyer par email
        </MenuItem>
        <MenuItem 
          onClick={() => {
            const ticket = tickets.find(t => t.id === selectedTicketId);
            handleOpenCancelDialog(ticket);
          }}
          disabled={tickets.find(t => t.id === selectedTicketId)?.status === 'cancelled' || 
                   tickets.find(t => t.id === selectedTicketId)?.status === 'used'}
        >
          <CancelIcon fontSize="small" sx={{ mr: 1 }} />
          Annuler le billet
        </MenuItem>
        <MenuItem 
          onClick={() => {
            const ticket = tickets.find(t => t.id === selectedTicketId);
            alert(`Billet ${ticket.id} marqué comme utilisé`);
            handleCloseActionMenu();
          }}
          disabled={tickets.find(t => t.id === selectedTicketId)?.status !== 'purchased'}
        >
          <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
          Marquer comme utilisé
        </MenuItem>
      </Menu>
      
      <Dialog
        open={qrDialogOpen}
        onClose={handleCloseQrDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>QR Code du billet</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            {selectedTicket && (
              <>
                <QRCode 
                  value={`ticket:${selectedTicket.id}`} 
                  size={200}
                  level="H"
                  includeMargin
                />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  ID: {selectedTicket.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedTicket.event?.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedTicket.user?.email}
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQrDialog}>Fermer</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              alert('Fonctionnalité de téléchargement à implémenter');
            }}
          >
            Télécharger
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
      >
        <DialogTitle>Confirmer l'annulation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir annuler ce billet ? Cette action est irréversible et le montant sera remboursé à l'utilisateur.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>Annuler</Button>
          <Button 
            onClick={handleCancelTicket} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirmer l\'annulation'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog
        open={resendDialogOpen}
        onClose={handleCloseResendDialog}
      >
        <DialogTitle>Renvoyer le billet</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Voulez-vous renvoyer ce billet par email à {selectedTicket?.user?.email} ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResendDialog}>Annuler</Button>
          <Button 
            onClick={handleResendTicket} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Renvoyer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTicketsPage;
