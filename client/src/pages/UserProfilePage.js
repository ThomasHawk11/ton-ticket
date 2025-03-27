import React, { useState } from 'react';
import { 
  Typography, 
  Container, 
  Box, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  Divider, 
  Alert, 
  CircularProgress, 
  Tabs, 
  Tab, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Person as PersonIcon, 
  Security as SecurityIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const UserProfilePage = () => {
  const { user, updateUser } = useAuth();
  
  // State
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Profile form validation schema
  const profileValidationSchema = Yup.object({
    firstName: Yup.string()
      .required('Le prénom est requis'),
    lastName: Yup.string()
      .required('Le nom est requis'),
    email: Yup.string()
      .email('Adresse email invalide')
      .required('L\'email est requis'),
    phone: Yup.string()
      .matches(/^[0-9+\s-]{8,15}$/, 'Numéro de téléphone invalide'),
    city: Yup.string()
  });
  
  // Password form validation schema
  const passwordValidationSchema = Yup.object({
    currentPassword: Yup.string()
      .required('Le mot de passe actuel est requis'),
    newPassword: Yup.string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial'
      )
      .required('Le nouveau mot de passe est requis'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Les mots de passe doivent correspondre')
      .required('La confirmation du mot de passe est requise')
  });
  
  // Profile form handling
  const profileFormik = useFormik({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      city: user?.city || ''
    },
    validationSchema: profileValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        await authService.updateProfile(values);
        
        // Update user in context
        updateUser({
          ...user,
          ...values
        });
        
        setSuccess('Profil mis à jour avec succès');
        setLoading(false);
      } catch (error) {
        console.error('Profile update error:', error);
        setError(error.response?.data?.message || 'Échec de la mise à jour du profil');
        setLoading(false);
      }
    }
  });
  
  // Password form handling
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        await authService.changePassword(values.currentPassword, values.newPassword);
        
        // Close dialog and reset form
        setPasswordDialogOpen(false);
        passwordFormik.resetForm();
        setSuccess('Mot de passe mis à jour avec succès');
        setLoading(false);
      } catch (error) {
        console.error('Password change error:', error);
        setError(error.response?.data?.message || 'Échec de la mise à jour du mot de passe');
        setLoading(false);
      }
    }
  });
  
  // Toggle password visibility
  const handleTogglePasswordVisibility = (field) => {
    if (field === 'current') {
      setShowCurrentPassword(!showCurrentPassword);
    } else if (field === 'new') {
      setShowNewPassword(!showNewPassword);
    } else if (field === 'confirm') {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };
  
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Mon Profil
      </Typography>
      
      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="profile tabs"
          variant="fullWidth"
        >
          <Tab icon={<PersonIcon />} label="Informations Personnelles" />
          <Tab icon={<SecurityIcon />} label="Sécurité" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
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
          
          {/* Personal Information Tab */}
          {tabValue === 0 && (
            <Box component="form" onSubmit={profileFormik.handleSubmit} noValidate>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="firstName"
                    label="Prénom"
                    name="firstName"
                    value={profileFormik.values.firstName}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                    error={profileFormik.touched.firstName && Boolean(profileFormik.errors.firstName)}
                    helperText={profileFormik.touched.firstName && profileFormik.errors.firstName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Nom"
                    name="lastName"
                    value={profileFormik.values.lastName}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                    error={profileFormik.touched.lastName && Boolean(profileFormik.errors.lastName)}
                    helperText={profileFormik.touched.lastName && profileFormik.errors.lastName}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Adresse email"
                    name="email"
                    value={profileFormik.values.email}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                    error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
                    helperText={profileFormik.touched.email && profileFormik.errors.email}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="phone"
                    label="Téléphone"
                    name="phone"
                    value={profileFormik.values.phone}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                    error={profileFormik.touched.phone && Boolean(profileFormik.errors.phone)}
                    helperText={profileFormik.touched.phone && profileFormik.errors.phone}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="city"
                    label="Ville"
                    name="city"
                    value={profileFormik.values.city}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                    error={profileFormik.touched.city && Boolean(profileFormik.errors.city)}
                    helperText={profileFormik.touched.city && profileFormik.errors.city}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  Enregistrer les modifications
                </Button>
              </Box>
            </Box>
          )}
          
          {/* Security Tab */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Sécurité du compte
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Gérez les paramètres de sécurité de votre compte, y compris votre mot de passe.
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  Changer mon mot de passe
                </Button>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Sessions actives
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Vous êtes actuellement connecté sur cet appareil.
              </Typography>
              
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  // Handle logout from all devices
                  alert('Cette fonctionnalité sera disponible prochainement.');
                }}
              >
                Se déconnecter de tous les appareils
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
        <DialogTitle>Changer mon mot de passe</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={passwordFormik.handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="currentPassword"
              label="Mot de passe actuel"
              type={showCurrentPassword ? 'text' : 'password'}
              id="currentPassword"
              autoComplete="current-password"
              value={passwordFormik.values.currentPassword}
              onChange={passwordFormik.handleChange}
              onBlur={passwordFormik.handleBlur}
              error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
              helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => handleTogglePasswordVisibility('current')}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="Nouveau mot de passe"
              type={showNewPassword ? 'text' : 'password'}
              id="newPassword"
              autoComplete="new-password"
              value={passwordFormik.values.newPassword}
              onChange={passwordFormik.handleChange}
              onBlur={passwordFormik.handleBlur}
              error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
              helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => handleTogglePasswordVisibility('new')}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmer le nouveau mot de passe"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={passwordFormik.values.confirmPassword}
              onChange={passwordFormik.handleChange}
              onBlur={passwordFormik.handleBlur}
              error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
              helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => handleTogglePasswordVisibility('confirm')}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Annuler</Button>
          <Button 
            onClick={passwordFormik.handleSubmit} 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfilePage;

