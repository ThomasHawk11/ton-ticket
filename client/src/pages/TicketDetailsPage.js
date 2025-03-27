import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Chip,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Event as EventIcon, 
  LocationOn as LocationIcon, 
  AccessTime as TimeIcon,
  ConfirmationNumber as TicketIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import QRCode from 'qrcode.react';
import { useAuth } from '../context/AuthContext';

const TicketDetailsPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch ticket details
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        // Simulate API call - replace with actual API call
        // const response = await ticketService.getTicketById(ticketId);
        // setTicket(response.data);
        
        // Mock data for now
        setTimeout(() => {
          setTicket({
            id: ticketId,
            eventId: 'event123',
            eventTitle: 'Concert de Jazz',
            eventDate: new Date(2025, 3, 30, 20, 0),
            venue: 'Salle Pleyel',
            address: '252 Rue du Faubourg Saint-Honoré, 75008 Paris',
            ticketType: 'VIP',
            price: 75.00,
            purchaseDate: new Date(2025, 2, 15),
            status: 'valid', // valid, used, cancelled
            qrCode: `ticket-${ticketId}-${Date.now()}`,
            seat: 'A12'
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching ticket:', error);
        setError('Impossible de récupérer les détails du billet. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };
    
    fetchTicket();
  }, [ticketId]);
  
  // Handle back button
  const handleBack = () => {
    navigate('/my-tickets');
  };
  
  // Format date
  const formatDate = (date) => {
    return format(new Date(date), 'dd MMMM yyyy à HH:mm', { locale: fr });
  };
  
  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box mt={2}>
          <Button variant="outlined" onClick={handleBack}>
            Retour à mes billets
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button variant="outlined" onClick={handleBack} sx={{ mb: 2 }}>
        Retour à mes billets
      </Button>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Détails du billet
          </Typography>
          
          <Chip 
            label={
              ticket.status === 'valid' ? 'Valide' : 
              ticket.status === 'used' ? 'Utilisé' : 'Annulé'
            }
            color={
              ticket.status === 'valid' ? 'success' : 
              ticket.status === 'used' ? 'default' : 'error'
            }
            icon={<TicketIcon />}
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Typography variant="h5" gutterBottom>
              {ticket.eventTitle}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body1">
                {formatDate(ticket.eventDate)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body1">
                {ticket.venue} - {ticket.address}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Informations du billet
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Type de billet
                  </Typography>
                  <Typography variant="body1">
                    {ticket.ticketType}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Siège
                  </Typography>
                  <Typography variant="body1">
                    {ticket.seat || 'Non assigné'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Prix
                  </Typography>
                  <Typography variant="body1">
                    {ticket.price.toFixed(2)} €
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date d'achat
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(ticket.purchaseDate)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="subtitle1" gutterBottom>
                QR Code du billet
              </Typography>
              
              <Paper elevation={2} sx={{ p: 2, mb: 2, width: '100%', maxWidth: 250 }}>
                <Box className="qr-code-container">
                  <QRCode value={ticket.qrCode} size={200} />
                </Box>
              </Paper>
              
              <Typography variant="body2" color="text.secondary" align="center">
                Présentez ce QR code à l'entrée de l'événement
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {ticket.status === 'valid' && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            color="error" 
            sx={{ mr: 1 }}
            // onClick={() => handleCancelTicket(ticket.id)}
          >
            Annuler ce billet
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default TicketDetailsPage;

