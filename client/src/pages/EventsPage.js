import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Button, 
  Container, 
  Box, 
  TextField, 
  InputAdornment, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Pagination, 
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Event as EventIcon, 
  LocationOn as LocationIcon 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import eventService from '../services/eventService';

const EventsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // State
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
  const [category, setCategory] = useState(queryParams.get('category') || '');
  const [sortBy, setSortBy] = useState(queryParams.get('sortBy') || 'date');
  
  useEffect(() => {
    // Fetch categories when component mounts
    fetchCategories();
    
    // Fetch events with current filters
    fetchEvents();
  }, [page, category, sortBy, location.search]);
  
  // Fetch event categories
  const fetchCategories = async () => {
    try {
      const response = await eventService.getCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  // Fetch events with filters
  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Get search term from URL if present
      const searchParam = queryParams.get('search');
      if (searchParam && searchParam !== searchTerm) {
        setSearchTerm(searchParam);
      }
      
      // Prepare query parameters
      const params = {
        page,
        limit: 9,
        sortBy,
        order: sortBy === 'price' ? 'asc' : 'desc'
      };
      
      if (searchParam) {
        params.search = searchParam;
      }
      
      if (category) {
        params.category = category;
      }
      
      const response = await eventService.getEvents(params);
      setEvents(response.data.events || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setError(null);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (category) params.set('category', category);
    if (sortBy) params.set('sortBy', sortBy);
    
    navigate(`/events?${params.toString()}`);
  };
  
  // Handle category change
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };
  
  // Handle pagination change
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
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
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Événements
      </Typography>
      
      {/* Filters */}
      <Box 
        component="form" 
        onSubmit={handleSearch}
        sx={{ 
          mb: 4, 
          p: 3, 
          borderRadius: 2, 
          backgroundColor: 'background.paper',
          boxShadow: 1
        }}
      >
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Rechercher"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="category-label">Catégorie</InputLabel>
              <Select
                labelId="category-label"
                value={category}
                label="Catégorie"
                onChange={handleCategoryChange}
              >
                <MenuItem value="">Toutes les catégories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="sort-label">Trier par</InputLabel>
              <Select
                labelId="sort-label"
                value={sortBy}
                label="Trier par"
                onChange={handleSortChange}
              >
                <MenuItem value="date">Date (plus récent)</MenuItem>
                <MenuItem value="popularity">Popularité</MenuItem>
                <MenuItem value="price">Prix (croissant)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth
            >
              Filtrer
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {/* Events Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ textAlign: 'center', my: 4 }}>
          {error}
        </Typography>
      ) : events.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 4, py: 4 }}>
          <Typography variant="h6" gutterBottom>
            Aucun événement trouvé
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Essayez de modifier vos critères de recherche
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={4}>
            {events.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <Card className="event-card card-hover">
                  <CardMedia
                    component="img"
                    height="200"
                    image={event.featuredImage || 'assets/images/placeholder.jpg'}
                    alt={event.title}
                  />
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip 
                        icon={<EventIcon />} 
                        label={formatEventDate(event.startDate)} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                      {event.category && (
                        <Chip 
                          label={event.category.name} 
                          size="small" 
                          color="secondary"
                        />
                      )}
                    </Box>
                    <Typography gutterBottom variant="h5" component="div">
                      {event.title}
                    </Typography>
                    {event.venue && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {`${event.venue.name}, ${event.venue.city}`}
                        </Typography>
                      </Box>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {event.description && event.description.length > 120
                        ? `${event.description.substring(0, 120)}...`
                        : event.description}
                    </Typography>
                  </CardContent>
                  <Divider />
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default EventsPage;

