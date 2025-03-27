import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText, 
  Divider, 
  Alert, 
  CircularProgress,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Autocomplete
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon, 
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Euro as EuroIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import frLocale from 'date-fns/locale/fr';
import eventService from '../../services/eventService';

const AdminEventFormPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const isEditMode = Boolean(eventId);
  
  // State
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [ticketTypes, setTicketTypes] = useState([
    { id: 1, name: 'Standard', price: 0, quantity: 0, description: '' }
  ]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  useEffect(() => {
    // Fetch categories and venues when component mounts
    fetchCategories();
    fetchVenues();
    
    // If in edit mode, fetch event data
    if (isEditMode) {
      fetchEventData();
    }
  }, [eventId]);
  
  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await eventService.getEventCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Erreur lors du chargement des catégories');
    }
  };
  
  // Fetch venues
  const fetchVenues = async () => {
    try {
      // In a real application, you would have a dedicated API endpoint for venues
      // Here we're using mock data
      setVenues([
        { id: 1, name: 'Salle Pleyel', address: 'Paris', capacity: 1000 },
        { id: 2, name: 'Zénith', address: 'Paris', capacity: 5000 },
        { id: 3, name: 'Olympia', address: 'Paris', capacity: 2000 },
        { id: 4, name: 'Stade de France', address: 'Saint-Denis', capacity: 80000 }
      ]);
    } catch (error) {
      console.error('Error fetching venues:', error);
      setError('Erreur lors du chargement des lieux');
    }
  };
  
  // Fetch event data
  const fetchEventData = async () => {
    try {
      setInitialLoading(true);
      
      const response = await eventService.getEventById(eventId);
      const event = response.data;
      
      // Set form values
      formik.setValues({
        title: event.title || '',
        description: event.description || '',
        categoryId: event.category?.id || '',
        venueId: event.venue?.id || '',
        startDate: event.startDate ? new Date(event.startDate) : null,
        endDate: event.endDate ? new Date(event.endDate) : null,
        featuredEvent: event.featuredEvent || false,
        organizerInfo: event.organizerInfo || '',
        maxTicketsPerUser: event.maxTicketsPerUser || 5
      });
      
      // Set ticket types
      if (event.ticketTypes && event.ticketTypes.length > 0) {
        setTicketTypes(event.ticketTypes);
      }
      
      // Set image preview
      if (event.imageUrl) {
        setImagePreview(event.imageUrl);
      }
      
      setInitialLoading(false);
    } catch (error) {
      console.error('Error fetching event data:', error);
      setError('Erreur lors du chargement des données de l\'événement');
      setInitialLoading(false);
    }
  };
  
  // Form validation schema
  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Le titre est requis')
      .max(100, 'Le titre ne doit pas dépasser 100 caractères'),
    description: Yup.string()
      .required('La description est requise'),
    categoryId: Yup.string()
      .required('La catégorie est requise'),
    venueId: Yup.string()
      .required('Le lieu est requis'),
    startDate: Yup.date()
      .required('La date de début est requise')
      .min(new Date(), 'La date de début doit être dans le futur'),
    endDate: Yup.date()
      .required('La date de fin est requise')
      .min(
        Yup.ref('startDate'),
        'La date de fin doit être postérieure à la date de début'
      ),
    maxTicketsPerUser: Yup.number()
      .required('Le nombre maximum de billets par utilisateur est requis')
      .min(1, 'Le nombre minimum est 1')
      .max(10, 'Le nombre maximum est 10')
  });
  
  // Formik form handling
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      categoryId: '',
      venueId: '',
      startDate: null,
      endDate: null,
      featuredEvent: false,
      organizerInfo: '',
      maxTicketsPerUser: 5
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        // Validate ticket types
        if (ticketTypes.length === 0) {
          setError('Vous devez définir au moins un type de billet');
          setLoading(false);
          return;
        }
        
        // Check if at least one ticket type has quantity > 0
        const hasTickets = ticketTypes.some(ticket => ticket.quantity > 0);
        if (!hasTickets) {
          setError('Au moins un type de billet doit avoir une quantité supérieure à 0');
          setLoading(false);
          return;
        }
        
        // Create FormData for image upload
        const formData = new FormData();
        
        // Add event data
        const eventData = {
          ...values,
          ticketTypes
        };
        
        formData.append('eventData', JSON.stringify(eventData));
        
        // Add image if selected
        if (imageFile) {
          formData.append('image', imageFile);
        }
        
        // Create or update event
        if (isEditMode) {
          await eventService.updateEvent(eventId, formData);
          setSuccess('Événement mis à jour avec succès');
        } else {
          const response = await eventService.createEvent(formData);
          setSuccess('Événement créé avec succès');
          
          // Navigate to edit page after creation
          navigate(`/admin/events/${response.data.id}`);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Event form error:', error);
        setError(error.response?.data?.message || 'Erreur lors de l\'enregistrement de l\'événement');
        setLoading(false);
      }
    }
  });
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle image change
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Add ticket type
  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      {
        id: ticketTypes.length + 1,
        name: '',
        price: 0,
        quantity: 0,
        description: ''
      }
    ]);
  };
  
  // Remove ticket type
  const removeTicketType = (index) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes.splice(index, 1);
    setTicketTypes(newTicketTypes);
  };
  
  // Update ticket type
  const updateTicketType = (index, field, value) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes[index][field] = value;
    setTicketTypes(newTicketTypes);
  };
  
  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          {isEditMode ? 'Modifier l\'événement' : 'Créer un nouvel événement'}
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/events')}
        >
          Retour
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="event form tabs"
          variant="fullWidth"
        >
          <Tab label="Informations générales" />
          <Tab label="Billets" />
          <Tab label="Image et médias" />
        </Tabs>
        
        <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ p: 3 }}>
          {/* General Information Tab */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="title"
                  name="title"
                  label="Titre de l'événement"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="description"
                  name="description"
                  label="Description"
                  multiline
                  rows={4}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}
                >
                  <InputLabel id="category-label">Catégorie</InputLabel>
                  <Select
                    labelId="category-label"
                    id="categoryId"
                    name="categoryId"
                    value={formik.values.categoryId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Catégorie"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.categoryId && formik.errors.categoryId && (
                    <FormHelperText>{formik.errors.categoryId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.venueId && Boolean(formik.errors.venueId)}
                >
                  <InputLabel id="venue-label">Lieu</InputLabel>
                  <Select
                    labelId="venue-label"
                    id="venueId"
                    name="venueId"
                    value={formik.values.venueId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Lieu"
                  >
                    {venues.map((venue) => (
                      <MenuItem key={venue.id} value={venue.id}>
                        {venue.name} - {venue.address} (Capacité: {venue.capacity})
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.venueId && formik.errors.venueId && (
                    <FormHelperText>{formik.errors.venueId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                  <DateTimePicker
                    label="Date et heure de début"
                    value={formik.values.startDate}
                    onChange={(value) => formik.setFieldValue('startDate', value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                        helperText={formik.touched.startDate && formik.errors.startDate}
                        onBlur={() => formik.setFieldTouched('startDate', true)}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                  <DateTimePicker
                    label="Date et heure de fin"
                    value={formik.values.endDate}
                    onChange={(value) => formik.setFieldValue('endDate', value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                        helperText={formik.touched.endDate && formik.errors.endDate}
                        onBlur={() => formik.setFieldTouched('endDate', true)}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="organizerInfo"
                  name="organizerInfo"
                  label="Informations sur l'organisateur"
                  multiline
                  rows={2}
                  value={formik.values.organizerInfo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="maxTicketsPerUser"
                  name="maxTicketsPerUser"
                  label="Nombre maximum de billets par utilisateur"
                  type="number"
                  InputProps={{ inputProps: { min: 1, max: 10 } }}
                  value={formik.values.maxTicketsPerUser}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.maxTicketsPerUser && Boolean(formik.errors.maxTicketsPerUser)}
                  helperText={formik.touched.maxTicketsPerUser && formik.errors.maxTicketsPerUser}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="featured-label">Événement à la une</InputLabel>
                  <Select
                    labelId="featured-label"
                    id="featuredEvent"
                    name="featuredEvent"
                    value={formik.values.featuredEvent}
                    onChange={formik.handleChange}
                    label="Événement à la une"
                  >
                    <MenuItem value={true}>Oui</MenuItem>
                    <MenuItem value={false}>Non</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
          
          {/* Tickets Tab */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Types de billets
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Définissez les différents types de billets disponibles pour cet événement.
              </Typography>
              
              {ticketTypes.map((ticket, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, position: 'relative' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Nom du billet"
                        value={ticket.name}
                        onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Prix"
                        type="number"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EuroIcon />
                            </InputAdornment>
                          ),
                          inputProps: { min: 0 }
                        }}
                        value={ticket.price}
                        onChange={(e) => updateTicketType(index, 'price', Number(e.target.value))}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Quantité disponible"
                        type="number"
                        InputProps={{ inputProps: { min: 0 } }}
                        value={ticket.quantity}
                        onChange={(e) => updateTicketType(index, 'quantity', Number(e.target.value))}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={2}
                        value={ticket.description}
                        onChange={(e) => updateTicketType(index, 'description', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                  
                  {ticketTypes.length > 1 && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeTicketType(index)}
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Paper>
              ))}
              
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addTicketType}
                sx={{ mt: 2 }}
              >
                Ajouter un type de billet
              </Button>
            </Box>
          )}
          
          {/* Image Tab */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Image de l'événement
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Ajoutez une image attractive pour votre événement. Formats acceptés : JPG, PNG. Taille maximale : 5 MB.
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Sélectionner une image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                  
                  {imagePreview && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Aperçu de l'image
                      </Typography>
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                      />
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    Conseils pour les images
                  </Typography>
                  <ul>
                    <li>Utilisez des images de haute qualité (minimum 1200x800 pixels)</li>
                    <li>Évitez les images floues ou pixelisées</li>
                    <li>Choisissez des images qui représentent bien votre événement</li>
                    <li>Assurez-vous que vous avez les droits d'utilisation de l'image</li>
                  </ul>
                </Grid>
              </Grid>
            </Box>
          )}
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {isEditMode ? 'Mettre à jour' : 'Créer l\'événement'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminEventFormPage;

