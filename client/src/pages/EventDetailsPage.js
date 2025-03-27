import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  Container, 
  Box, 
  Grid, 
  Paper, 
  Divider, 
  Chip, 
  CircularProgress, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar
} from '@mui/material';
import { 
  Event as EventIcon, 
  LocationOn as LocationIcon, 
  AccessTime as TimeIcon, 
  Category as CategoryIcon, 
  ConfirmationNumber as TicketIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/eventService';
import ticketService from '../services/ticketService';

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // State
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [reservedTicket, setReservedTicket] = useState(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  useEffect(() => {
    // Fetch event details when component mounts
    fetchEventDetails();
  }, [eventId]);
  
  // Fetch event details
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEventById(eventId);
      setEvent(response.data.event);
      setError(null);
    } catch (error) {
      console.error('Error fetching event details:', error);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
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
  
  // Handle ticket reservation
  const handleReserveTicket = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${eventId}` } });
      return;
    }
    
    try {
      setProcessingPayment(true);
      const response = await ticketService.reserveTicket(eventId);
      setReservedTicket(response.data.ticket);
      setPurchaseDialogOpen(true);
      setProcessingPayment(false);
    } catch (error) {
      console.error('Error reserving ticket:', error);
      setProcessingPayment(false);
      setPaymentError('Failed to reserve ticket. Please try again.');
    }
  };
  
  // Handle purchase dialog close
  const handlePurchaseDialogClose = () => {
    setPurchaseDialogOpen(false);
    setPaymentError(null);
  };
  
  // Handle ticket purchase
  const handlePurchaseTicket = async () => {
    if (!reservedTicket) return;
    
    // Basic validation
    if (paymentMethod === 'card') {
      if (!cardNumber || !cardName || !cardExpiry || !cardCvc) {
        setPaymentError('Please fill in all payment details');
        return;
      }
    }
    
    try {
      setProcessingPayment(true);
      
      // Prepare payment data
      const paymentData = {
        method: paymentMethod,
        details: paymentMethod === 'card' ? {
          cardNumber,
          cardName,
          cardExpiry,
          cardCvc
        } : {}
      };
      
      // Purchase ticket
      await ticketService.purchaseTicket(reservedTicket.id, paymentData);
      
      // Close dialog and show success message
      setPurchaseDialogOpen(false);
      setSuccessMessage('Ticket purchased successfully! Check your email for details.');
      
      // Reset form
      setCardNumber('');
      setCardName('');
      setCardExpiry('');
      setCardCvc('');
      setPaymentMethod('card');
      setReservedTicket(null);
      setProcessingPayment(false);
      
      // Navigate to tickets page after short delay
      setTimeout(() => {
        navigate('/my-tickets');
      }, 3000);
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      setProcessingPayment(false);
      setPaymentError('Failed to process payment. Please try again.');
    }
  };
  
  // Handle success message close
  const handleSuccessClose = () => {
    setSuccessMessage(null);
  };
  
  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error || !event) {
    return (
      <Container>
        <Alert severity="error" sx={{ my: 4 }}>
          {error || 'Event not found'}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/events')}
        >
          Back to Events
        </Button>
      </Container>
    );
  }
  
  return (
    <Container>
      {/* Event Image */}
      <Box 
        sx={{ 
          height: 300, 
          backgroundImage: `url(${event.featuredImage || 'assets/images/placeholder.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 2,
          mb: 4
        }} 
      />
      
      <Grid container spacing={4}>
        {/* Event Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {event.title}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {event.category && (
                <Chip 
                  icon={<CategoryIcon />} 
                  label={event.category.name} 
                  color="secondary"
                />
              )}
              <Chip 
                icon={<EventIcon />} 
                label={formatEventDate(event.startDate)} 
                color="primary" 
                variant="outlined"
              />
              <Chip 
                icon={<TimeIcon />} 
                label={`${formatEventTime(event.startDate)} - ${formatEventTime(event.endDate)}`} 
                variant="outlined"
              />
            </Box>
            
            {event.venue && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LocationIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {`${event.venue.name}, ${event.venue.address}, ${event.venue.city}, ${event.venue.postalCode}`}
                </Typography>
              </Box>
            )}
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {event.description}
            </Typography>
            
            {event.organizer && (
              <>
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>
                  Organisateur
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {event.organizer.name}
                  </Typography>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
        
        {/* Ticket Purchase */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h5" gutterBottom>
              <TicketIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Billets
            </Typography>
            
            <Box sx={{ my: 3 }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {event.ticketPrice ? `${event.ticketPrice} ${event.currency || '€'}` : 'Gratuit'}
              </Typography>
              
              {event.ticketsAvailable > 0 ? (
                <>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {event.ticketsAvailable} billets disponibles
                  </Typography>
                  
                  <Box sx={{ mt: 3 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth 
                      size="large"
                      onClick={handleReserveTicket}
                      disabled={processingPayment}
                      startIcon={processingPayment ? <CircularProgress size={20} /> : <TicketIcon />}
                    >
                      {processingPayment ? 'Traitement en cours...' : 'Acheter un billet'}
                    </Button>
                  </Box>
                </>
              ) : (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Cet événement est complet
                </Alert>
              )}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="body2" color="text.secondary">
              Les billets sont envoyés par email immédiatement après l'achat.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Purchase Dialog */}
      <Dialog 
        open={purchaseDialogOpen} 
        onClose={handlePurchaseDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Finaliser votre achat</DialogTitle>
        <DialogContent>
          {paymentError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {paymentError}
            </Alert>
          )}
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Détails de la commande
            </Typography>
            <Typography variant="body1">
              {event.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatEventDate(event.startDate)} à {formatEventTime(event.startDate)}
            </Typography>
            <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
              Total: {event.ticketPrice ? `${event.ticketPrice} ${event.currency || '€'}` : 'Gratuit'}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Méthode de paiement
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="payment-method-label">Méthode de paiement</InputLabel>
            <Select
              labelId="payment-method-label"
              value={paymentMethod}
              label="Méthode de paiement"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="card">Carte bancaire</MenuItem>
              <MenuItem value="paypal">PayPal</MenuItem>
            </Select>
          </FormControl>
          
          {paymentMethod === 'card' && (
            <Box>
              <TextField
                label="Numéro de carte"
                fullWidth
                margin="normal"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
              />
              <TextField
                label="Nom sur la carte"
                fullWidth
                margin="normal"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Date d'expiration"
                    fullWidth
                    margin="normal"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/AA"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="CVC"
                    fullWidth
                    margin="normal"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
          
          {paymentMethod === 'paypal' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Vous serez redirigé vers PayPal pour finaliser votre paiement.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePurchaseDialogClose}>Annuler</Button>
          <Button 
            onClick={handlePurchaseTicket} 
            variant="contained" 
            color="primary"
            disabled={processingPayment}
            startIcon={processingPayment ? <CircularProgress size={20} /> : null}
          >
            {processingPayment ? 'Traitement en cours...' : 'Payer maintenant'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleSuccessClose}
        message={successMessage}
      />
    </Container>
  );
};

export default EventDetailsPage;

