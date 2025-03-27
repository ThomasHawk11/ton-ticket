import React, { useState } from 'react';
import { 
  Typography, 
  TextField, 
  Button, 
  Container, 
  Box, 
  Paper, 
  Link, 
  Alert, 
  CircularProgress,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Grid
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  PersonAdd as RegisterIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  // State
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Steps for registration
  const steps = ['Informations personnelles', 'Identifiants de connexion'];
  
  // Form validation schema
  const validationSchema = Yup.object({
    firstName: Yup.string()
      .required('Le prénom est requis'),
    lastName: Yup.string()
      .required('Le nom est requis'),
    email: Yup.string()
      .email('Adresse email invalide')
      .required('L\'email est requis'),
    password: Yup.string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial'
      )
      .required('Le mot de passe est requis'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Les mots de passe doivent correspondre')
      .required('La confirmation du mot de passe est requise'),
    phone: Yup.string()
      .matches(/^[0-9+\s-]{8,15}$/, 'Numéro de téléphone invalide'),
    city: Yup.string()
  });
  
  // Formik form handling
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      city: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        // Remove confirmPassword from values before sending to API
        const { confirmPassword, ...userData } = values;
        
        await register(userData);
        
        // Navigate to login page after successful registration
        navigate('/login', { 
          state: { 
            registrationSuccess: true,
            email: values.email
          } 
        });
      } catch (error) {
        console.error('Registration error:', error);
        setError(error.response?.data?.message || 'Échec de l\'inscription. Veuillez réessayer.');
        setLoading(false);
      }
    }
  });
  
  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Toggle confirm password visibility
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Handle next step
  const handleNext = () => {
    // Validate current step fields
    let canProceed = true;
    
    if (activeStep === 0) {
      // Validate personal information
      formik.setTouched({
        firstName: true,
        lastName: true,
        phone: true,
        city: true
      });
      
      if (formik.errors.firstName || formik.errors.lastName || formik.errors.phone || formik.errors.city) {
        canProceed = false;
      }
    }
    
    if (canProceed) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <Typography variant="h6" gutterBottom>
              Informations personnelles
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="firstName"
                  label="Prénom"
                  name="firstName"
                  autoComplete="given-name"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Nom"
                  name="lastName"
                  autoComplete="family-name"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="phone"
                  label="Téléphone"
                  name="phone"
                  autoComplete="tel"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="city"
                  label="Ville"
                  name="city"
                  autoComplete="address-level2"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.city && Boolean(formik.errors.city)}
                  helperText={formik.touched.city && formik.errors.city}
                />
              </Grid>
            </Grid>
          </>
        );
      case 1:
        return (
          <>
            <Typography variant="h6" gutterBottom>
              Identifiants de connexion
            </Typography>
            
            <TextField
              required
              fullWidth
              id="email"
              label="Adresse email"
              name="email"
              autoComplete="email"
              margin="normal"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            
            <TextField
              required
              fullWidth
              id="password"
              label="Mot de passe"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              margin="normal"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              required
              fullWidth
              id="confirmPassword"
              label="Confirmer le mot de passe"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              margin="normal"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </>
        );
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Créer un compte
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" paragraph>
          Rejoignez Ton Ticket pour découvrir et réserver des événements
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<BackIcon />}
            >
              Retour
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <RegisterIcon />}
              >
                {loading ? 'Inscription en cours...' : 'S\'inscrire'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                endIcon={<NextIcon />}
              >
                Suivant
              </Button>
            )}
          </Box>
        </Box>
        
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2">
            Déjà inscrit ?{' '}
            <Link component={RouterLink} to="/login" variant="body2">
              Se connecter
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;

