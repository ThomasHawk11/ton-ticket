import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Button, 
  CircularProgress
} from '@mui/material';
import { 
  Event as EventIcon, 
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/Layout/AdminLayout';
import eventService from '../../services/eventService';
import ticketService from '../../services/ticketService';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalTickets: 0,
    ticketsSold: 0,
    revenue: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch dashboard data when component mounts
    fetchDashboardData();
  }, []);
  
  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // In a real application, you would have a dedicated API endpoint for dashboard stats
      // Here we're simulating by making separate calls
      
      // Get events
      const eventsResponse = await eventService.getEvents({ 
        limit: 5, 
        sortBy: 'createdAt', 
        order: 'desc' 
      });
      
      setRecentEvents(eventsResponse.data.events || []);
      
      // Set mock stats for now
      // In a real application, these would come from the API
      setStats({
        totalEvents: 12,
        upcomingEvents: 5,
        totalTickets: 500,
        ticketsSold: 324,
        revenue: 12960
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };
  
  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tableau de bord
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenue, {user?.firstName} {user?.lastName}. Voici un aperçu de vos événements et billets.
        </Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Événements
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalEvents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.upcomingEvents} à venir
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Billets vendus
                  </Typography>
                  <Typography variant="h4">
                    {stats.ticketsSold}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    sur {stats.totalTickets} disponibles
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Taux de remplissage
                  </Typography>
                  <Typography variant="h4">
                    {Math.round((stats.ticketsSold / stats.totalTickets) * 100)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    en moyenne
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Revenus
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(stats.revenue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Recent Events and Quick Actions */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Événements récents
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => navigate('/admin/events')}
                    >
                      Voir tous
                    </Button>
                  </Box>
                  <Divider />
                  <List>
                    {recentEvents.length === 0 ? (
                      <ListItem>
                        <ListItemText 
                          primary="Aucun événement récent" 
                          secondary="Créez votre premier événement dès maintenant"
                        />
                      </ListItem>
                    ) : (
                      recentEvents.map((event, index) => (
                        <React.Fragment key={event.id}>
                          <ListItem 
                            button
                            onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                          >
                            <EventIcon sx={{ mr: 2, color: 'primary.main' }} />
                            <ListItemText 
                              primary={event.title} 
                              secondary={`${formatDate(event.startDate)} - ${event.ticketsSold || 0} billets vendus`}
                            />
                          </ListItem>
                          {index < recentEvents.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                      ))
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Actions rapides
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    fullWidth
                    sx={{ mb: 2 }}
                    onClick={() => navigate('/admin/events/new')}
                  >
                    Nouvel événement
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2 }}
                    onClick={() => navigate('/admin/tickets')}
                  >
                    Gérer les billets
                  </Button>
                  {user?.role === 'admin' && (
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate('/admin/users')}
                    >
                      Gérer les utilisateurs
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboardPage;

