import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Container, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Divider, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Chip
} from '@mui/material';
import { 
  Event as EventIcon, 
  LocationOn as LocationIcon, 
  AccessTime as TimeIcon, 
  QrCode as QrCodeIcon, 
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import QRCode from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import ticketService from '../services/ticketService';

const MyTicketsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // State
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellingTicket, setCancellingTicket] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/my-tickets' } });
      return;
    }
    
    // Fetch user's tickets when component mounts
    fetchUserTickets();
    
    // Add event listeners for ticket updates
    window.addEventListener('ticketPurchased', handleTicketUpdated);
    window.addEventListener('ticketCancelled', handleTicketUpdated);
    
    // Cleanup
    return () => {
      window.removeEventListener('ticketPurchased', handleTicketUpdated);
      window.removeEventListener('ticketCancelled', handleTicketUpdated);
    };
  }, [isAuthenticated]);
  
  // Fetch user's tickets
  const fetchUserTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getUserTickets();
      setTickets(response.data.tickets || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle ticket updates from socket events
  const handleTicketUpdated = () => {
    fetchUserTickets();
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Open QR code dialog
  const handleShowQrCode = (ticket) => {
    setSelectedTicket(ticket);
    setQrDialogOpen(true);
  };
  
  // Close QR code dialog
  const handleQrDialogClose = () => {
    setQrDialogOpen(false);
  };
  
  // Open cancel ticket dialog
  const handleCancelTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setCancelDialogOpen(true);
  };
  
  // Close cancel ticket dialog
  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
  };
  
  // Cancel ticket
  const handleCancelTicket = async () => {
    if (!selectedTicket) return;
    
    try {
      setCancellingTicket(true);
      await ticketService.cancelTicket(selectedTicket.id);
      
      // Update local state
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === selectedTicket.id 
            ? { ...ticket, status: 'cancelled' } 
            : ticket
        )
      );
      
      setCancelDialogOpen(false);
      setCancellingTicket(false);
    } catch (error) {
      console.error('Error cancelling ticket:', error);
      setCancellingTicket(false);
    }
  };
  
  // Format event date
  const formatEventDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE dd MMMM yyyy', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };
  
  // Format event time
  const formatEventTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'HH:mm', { locale: fr });
    } catch (error) {
      return '';
    }
  };
  
  // Get status chip based on ticket status
  const getStatusChip = (status) => {
    switch (status) {
      case 'reserved':
        return (
          <Chip 
            icon={<PendingIcon />} 
            label="Réservé" 
            color="warning" 
            size="small" 
          />
        );
      case 'purchased':
        return (
          <Chip 
            icon={<CheckCircleIcon />} 
            label="Confirmé" 
            color="success" 
            size="small" 
          />
        );
      case 'used':
        return (
          <Chip 
            icon={<CheckCircleIcon />} 
            label="Utilisé" 
            color="default" 
            size="small" 
          />
        );
      case 'cancelled':
        return (
          <Chip 
            icon={<CancelIcon />} 
            label="Annulé" 
            color="error" 
            size="small" 
          />
        );
      default:
        return (
          <Chip 
            label={status} 
            size="small" 
          />
        );
    }
  };
  
  // Filter tickets based on current tab
  const filteredTickets = tickets.filter(ticket => {
    const eventDate = new Date(ticket.event.startDate);
    const now = new Date();
    
    if (tabValue === 0) {
      // Upcoming tickets
      return eventDate >= now && ticket.status !== 'cancelled';
    } else if (tabValue === 1) {
      // Past tickets
      return eventDate < now || ticket.status === 'used';
    } else {
      // Cancelled tickets
      return ticket.status === 'cancelled';
    }
  });
  
  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Mes Billets
      </Typography>
      
      {error ? (
        <Alert severity="error" sx={{ my: 4 }}>
          {error}
        </Alert>
      ) : tickets.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 8 }}>
          <Typography variant="h6" gutterBottom>
            Vous n'avez pas encore de billets
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/events')}
            sx={{ mt: 2 }}
          >
            Découvrir les événements
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="ticket tabs"
            >
              <Tab label="À venir" />
              <Tab label="Passés" />
              <Tab label="Annulés" />
            </Tabs>
          </Box>
          
          {filteredTickets.length === 0 ? (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography variant="body1">
                Aucun billet dans cette catégorie
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredTickets.map((ticket) => (
                <Grid item xs={12} md={6} key={ticket.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" component="div">
                          {ticket.event.title}
                        </Typography>
                        {getStatusChip(ticket.status)}
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EventIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {formatEventDate(ticket.event.startDate)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {formatEventTime(ticket.event.startDate)}
                        </Typography>
                      </Box>
                      
                      {ticket.event.venue && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {`${ticket.event.venue.name}, ${ticket.event.venue.city}`}
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Numéro de billet: {ticket.ticketNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Prix: {ticket.price ? `${ticket.price} ${ticket.currency || '€'}` : 'Gratuit'}
                        </Typography>
                      </Box>
                    </CardContent>
                    
                    <Divider />
                    
                    <CardActions>
                      {ticket.status === 'purchased' && (
                        <>
                          <Button 
                            size="small" 
                            startIcon={<QrCodeIcon />}
                            onClick={() => handleShowQrCode(ticket)}
                          >
                            Afficher QR Code
                          </Button>
                          
                          <Button 
                            size="small" 
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleCancelTicketClick(ticket)}
                          >
                            Annuler
                          </Button>
                        </>
                      )}
                      
                      <Button 
                        size="small" 
                        onClick={() => navigate(`/events/${ticket.event.id}`)}
                        sx={{ ml: 'auto' }}
                      >
                        Détails de l'événement
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
      
      {/* QR Code Dialog */}
      <Dialog 
        open={qrDialogOpen} 
        onClose={handleQrDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Votre billet QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            {selectedTicket && (
              <>
                <QRCode 
                  value={selectedTicket.qrCode || selectedTicket.id} 
                  size={200}
                  level="H"
                  includeMargin
                />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {selectedTicket.event.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatEventDate(selectedTicket.event.startDate)} à {formatEventTime(selectedTicket.event.startDate)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Numéro de billet: {selectedTicket.ticketNumber}
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleQrDialogClose}>Fermer</Button>
        </DialogActions>
      </Dialog>
      
      {/* Cancel Ticket Dialog */}
      <Dialog 
        open={cancelDialogOpen} 
        onClose={handleCancelDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Annuler ce billet ?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Êtes-vous sûr de vouloir annuler ce billet ? Cette action est irréversible.
          </Typography>
          {selectedTicket && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {selectedTicket.event.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatEventDate(selectedTicket.event.startDate)} à {formatEventTime(selectedTicket.event.startDate)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose}>Annuler</Button>
          <Button 
            onClick={handleCancelTicket} 
            color="error" 
            variant="contained"
            disabled={cancellingTicket}
            startIcon={cancellingTicket ? <CircularProgress size={20} /> : <CancelIcon />}
          >
            {cancellingTicket ? 'Annulation...' : 'Confirmer l\'annulation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyTicketsPage;

