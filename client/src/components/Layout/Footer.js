import React from 'react';
import { Box, Container, Typography, Link, Grid, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100]
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Ton Ticket
            </Typography>
            <Typography variant="body2" color="text.secondary">
              La plateforme de billetterie en ligne simple, sécurisée et fiable pour tous vos événements.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Liens Rapides
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" display="block" sx={{ mb: 1 }}>
              Accueil
            </Link>
            <Link component={RouterLink} to="/events" color="inherit" display="block" sx={{ mb: 1 }}>
              Événements
            </Link>
            <Link component={RouterLink} to="/login" color="inherit" display="block" sx={{ mb: 1 }}>
              Connexion
            </Link>
            <Link component={RouterLink} to="/register" color="inherit" display="block">
              Inscription
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Email: contact@ton-ticket.com
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Téléphone: +33 1 23 45 67 89
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Adresse: 123 Avenue des Événements, 75001 Paris
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' Ton Ticket. Tous droits réservés.'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;

