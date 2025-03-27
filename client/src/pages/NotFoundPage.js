import React from 'react';
import { Typography, Button, Container, Box, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFoundPage = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        py: 8
      }}>
        <Paper elevation={3} sx={{ p: 6, borderRadius: 2, width: '100%' }}>
          <Typography variant="h1" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            404
          </Typography>
          
          <Typography variant="h4" component="h2" gutterBottom>
            Page non trouvée
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
            La page que vous recherchez n'existe pas ou a été déplacée. 
            Veuillez vérifier l'URL ou retourner à la page d'accueil.
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            component={RouterLink} 
            to="/"
            startIcon={<HomeIcon />}
            size="large"
          >
            Retour à l'accueil
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFoundPage;

