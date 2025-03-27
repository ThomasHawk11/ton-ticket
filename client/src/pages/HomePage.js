import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Box, 
  Container, 
  TextField, 
  InputAdornment, 
  CircularProgress,
  Chip
} from '@mui/material';
import { Search as SearchIcon, Event as EventIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import eventService from '../services/eventService';

const HomePage = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch featured events when component mounts
    fetchFeaturedEvents();
  }, []);
  
  // Fetch featured events from API
  const fetchFeaturedEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getFeaturedEvents();
      setFeaturedEvents(response.data.events || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching featured events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/events?search=${encodeURIComponent(searchTerm)}`);
  };
  
  // Format event date
  const formatEventDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };
  
  // Navigate to event details
  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };
  
  return (
    <>
      {/* Hero Section */}
      <Box className="hero-section">
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" className="hero-title">
            Découvrez et réservez vos événements préférés
          </Typography>
          <Typography variant="h5" className="hero-subtitle">
            La plateforme de billetterie simple, sécurisée et fiable
          </Typography>
          
          {/* Search Bar */}
          <Box 
            component="form" 
            onSubmit={handleSearch}
            sx={{ 
              display: 'flex', 
              width: '100%', 
              maxWidth: 600, 
              margin: '2rem auto 0',
              backgroundColor: 'white',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <TextField
              fullWidth
              placeholder="Rechercher un événement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { borderRadius: 0 }
              }}
              sx={{ backgroundColor: 'white' }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="secondary"
              sx={{ borderRadius: '0 8px 8px 0', px: 3 }}
            >
              Rechercher
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* Featured Events Section */}
      <Container className="featured-events">
        <Typography variant="h4" component="h2" className="section-title" sx={{ mb: 4 }}>
          Événements à la une
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ textAlign: 'center', my: 4 }}>
            {error}
          </Typography>
        ) : featuredEvents.length === 0 ? (
          <Typography sx={{ textAlign: 'center', my: 4 }}>
            Aucun événement à afficher
          </Typography>
        ) : (
          <Grid container spacing={4}>
            {featuredEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <Card className="event-card card-hover">
                  <CardMedia
                    component="img"
                    className="event-card-media"
                    image={event.featuredImage || 'assets/images/placeholder.jpg'}
                    alt={event.title}
                  />
                  <CardContent className="event-card-content">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip 
                        icon={<EventIcon />} 
                        label={formatEventDate(event.startDate)} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                    <Typography gutterBottom variant="h5" component="div">
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {event.venue ? `${event.venue.name}, ${event.venue.city}` : 'Lieu à confirmer'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.description && event.description.length > 120
                        ? `${event.description.substring(0, 120)}...`
                        : event.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => handleEventClick(event.id)}
                    >
                      Voir les détails
                    </Button>
                    <Typography 
                      variant="body1" 
                      color="primary" 
                      sx={{ ml: 'auto', fontWeight: 'bold' }}
                    >
                      {event.ticketPrice ? `${event.ticketPrice} ${event.currency || '€'}` : 'Gratuit'}
                    </Typography>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => navigate('/events')}
          >
            Voir tous les événements
          </Button>
        </Box>
      </Container>
      
      {/* How It Works Section */}
      <Box sx={{ backgroundColor: 'grey.100', py: 6 }}>
        <Container>
          <Typography variant="h4" component="h2" className="section-title" sx={{ mb: 4 }}>
            Comment ça marche
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box 
                  sx={{ 
                    backgroundColor: 'primary.main', 
                    color: 'white', 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto',
                    mb: 2,
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}
                >
                  1
                </Box>
                <Typography variant="h6" gutterBottom>
                  Trouvez votre événement
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Parcourez notre catalogue d'événements ou utilisez la recherche pour trouver celui qui vous intéresse.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box 
                  sx={{ 
                    backgroundColor: 'primary.main', 
                    color: 'white', 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto',
                    mb: 2,
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}
                >
                  2
                </Box>
                <Typography variant="h6" gutterBottom>
                  Réservez vos billets
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sélectionnez le nombre de billets souhaité et procédez au paiement sécurisé en quelques clics.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box 
                  sx={{ 
                    backgroundColor: 'primary.main', 
                    color: 'white', 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto',
                    mb: 2,
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}
                >
                  3
                </Box>
                <Typography variant="h6" gutterBottom>
                  Profitez de l'événement
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Recevez votre billet électronique avec QR code par email et présentez-le à l'entrée le jour J.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default HomePage;

