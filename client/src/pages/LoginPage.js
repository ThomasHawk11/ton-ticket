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
  IconButton
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Login as LoginIcon 
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Get redirect path from location state or default to home
  const from = location.state?.from || '/';
  
  // State
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Form validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Adresse email invalide')
      .required('L\'email est requis'),
    password: Yup.string()
      .required('Le mot de passe est requis')
  });
  
  // Formik form handling
  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await login(values.email, values.password);
        
        if (result.success) {
          // Navigate to the redirect path after successful login
          navigate(from, { replace: true });
        } else {
          setError(result.error || 'Échec de la connexion. Veuillez vérifier vos identifiants.');
          setLoading(false);
        }
      } catch (error) {
        setError('Une erreur est survenue lors de la connexion.');
        setLoading(false);
      }
    }
  });
  
  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Connexion
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" paragraph>
          Connectez-vous pour accéder à votre compte et gérer vos billets
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Adresse email"
            name="email"
            autoComplete="email"
            autoFocus
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
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
          
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Link component={RouterLink} to="/forgot-password" variant="body2">
              Mot de passe oublié ?
            </Link>
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Pas encore de compte ?{' '}
              <Link component={RouterLink} to="/register" variant="body2">
                Créer un compte
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;

