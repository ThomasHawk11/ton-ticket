import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Button, 
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/Layout/AdminLayout';
import settingsService from '../../services/settingsService';

const AdminSettingsPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [generalSettings, setGeneralSettings] = useState({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    supportPhone: '',
    maintenanceMode: false,
    allowRegistration: true,
    defaultCurrency: 'EUR',
    defaultLanguage: 'fr'
  });
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPassword: '',
    senderEmail: '',
    senderName: '',
    enableEmailNotifications: true
  });
  const [paymentSettings, setPaymentSettings] = useState({
    stripePublicKey: '',
    stripeSecretKey: '',
    paypalClientId: '',
    paypalSecret: '',
    serviceFeePercentage: 5,
    enableStripe: true,
    enablePaypal: false
  });
  const [securitySettings, setSecuritySettings] = useState({
    jwtSecret: '',
    jwtExpiresIn: '24h',
    passwordMinLength: 8,
    requireEmailVerification: true,
    maxLoginAttempts: 5,
    recaptchaEnabled: false,
    recaptchaSiteKey: '',
    recaptchaSecretKey: ''
  });
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      const response = await settingsService.getSettings();
      
      if (response.data.general) {
        setGeneralSettings(response.data.general);
      }
      
      if (response.data.email) {
        setEmailSettings(response.data.email);
      }
      
      if (response.data.payment) {
        setPaymentSettings(response.data.payment);
      }
      
      if (response.data.security) {
        setSecuritySettings(response.data.security);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Erreur lors du chargement des paramètres');
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleGeneralSettingsChange = (event) => {
    const { name, value, checked } = event.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: event.target.type === 'checkbox' ? checked : value
    }));
  };
  
  const handleEmailSettingsChange = (event) => {
    const { name, value, checked } = event.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: event.target.type === 'checkbox' ? checked : value
    }));
  };
  
  const handlePaymentSettingsChange = (event) => {
    const { name, value, checked } = event.target;
    setPaymentSettings(prev => ({
      ...prev,
      [name]: event.target.type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSecuritySettingsChange = (event) => {
    const { name, value, checked } = event.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: event.target.type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      const settings = {
        general: generalSettings,
        email: emailSettings,
        payment: paymentSettings,
        security: securitySettings
      };
      
      await settingsService.updateSettings(settings);
      
      setSuccess('Paramètres enregistrés avec succès');
      setSaving(false);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Erreur lors de l\'enregistrement des paramètres');
      setSaving(false);
    }
  };
  
  const handleOpenTestEmailDialog = () => {
    setTestEmailDialogOpen(true);
  };
  
  const handleCloseTestEmailDialog = () => {
    setTestEmailDialogOpen(false);
    setTestEmailAddress('');
  };
  
  const handleSendTestEmail = async () => {
    try {
      setSaving(true);
      
      await settingsService.sendTestEmail(testEmailAddress);
      
      setSuccess('Email de test envoyé avec succès');
      handleCloseTestEmailDialog();
      setSaving(false);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error sending test email:', error);
      setError('Erreur lors de l\'envoi de l\'email de test');
      setSaving(false);
    }
  };
  
  const handleResetSettings = async () => {
    try {
      setSaving(true);
      
      await settingsService.resetSettings();
      
      fetchSettings();
      
      setSuccess('Paramètres réinitialisés avec succès');
      setSaving(false);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error resetting settings:', error);
      setError('Erreur lors de la réinitialisation des paramètres');
      setSaving(false);
    }
  };
  
  const handleCloseError = () => {
    setError(null);
  };
  
  const handleCloseSuccess = () => {
    setSuccess(null);
  };
  
  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Paramètres du système
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configurez les paramètres généraux, les emails, les paiements et la sécurité.
        </Typography>
      </Box>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper sx={{ mb: 4 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              aria-label="settings tabs"
            >
              <Tab icon={<SettingsIcon />} label="Général" />
              <Tab icon={<EmailIcon />} label="Email" />
              <Tab icon={<PaymentIcon />} label="Paiement" />
              <Tab icon={<SecurityIcon />} label="Sécurité" />
            </Tabs>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            {tabValue === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Paramètres généraux
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Nom du site"
                      name="siteName"
                      value={generalSettings.siteName}
                      onChange={handleGeneralSettingsChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Email de contact"
                      name="contactEmail"
                      value={generalSettings.contactEmail}
                      onChange={handleGeneralSettingsChange}
                      fullWidth
                      margin="normal"
                      type="email"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Description du site"
                      name="siteDescription"
                      value={generalSettings.siteDescription}
                      onChange={handleGeneralSettingsChange}
                      fullWidth
                      margin="normal"
                      multiline
                      rows={3}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Téléphone de support"
                      name="supportPhone"
                      value={generalSettings.supportPhone}
                      onChange={handleGeneralSettingsChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Devise par défaut"
                      name="defaultCurrency"
                      value={generalSettings.defaultCurrency}
                      onChange={handleGeneralSettingsChange}
                      fullWidth
                      margin="normal"
                      select
                      SelectProps={{
                        native: true
                      }}
                    >
                      <option value="EUR">Euro (€)</option>
                      <option value="USD">Dollar US ($)</option>
                      <option value="GBP">Livre Sterling (£)</option>
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Langue par défaut"
                      name="defaultLanguage"
                      value={generalSettings.defaultLanguage}
                      onChange={handleGeneralSettingsChange}
                      fullWidth
                      margin="normal"
                      select
                      SelectProps={{
                        native: true
                      }}
                    >
                      <option value="fr">Français</option>
                      <option value="en">Anglais</option>
                      <option value="es">Espagnol</option>
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={generalSettings.maintenanceMode}
                          onChange={handleGeneralSettingsChange}
                          name="maintenanceMode"
                          color="primary"
                        />
                      }
                      label="Mode maintenance"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={generalSettings.allowRegistration}
                          onChange={handleGeneralSettingsChange}
                          name="allowRegistration"
                          color="primary"
                        />
                      }
                      label="Autoriser les inscriptions"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Paramètres email
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Hôte SMTP"
                      name="smtpHost"
                      value={emailSettings.smtpHost}
                      onChange={handleEmailSettingsChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Port SMTP"
                      name="smtpPort"
                      value={emailSettings.smtpPort}
                      onChange={handleEmailSettingsChange}
                      fullWidth
                      margin="normal"
                      type="number"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Utilisateur SMTP"
                      name="smtpUser"
                      value={emailSettings.smtpUser}
                      onChange={handleEmailSettingsChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Mot de passe SMTP"
                      name="smtpPassword"
                      value={emailSettings.smtpPassword}
                      onChange={handleEmailSettingsChange}
                      fullWidth
                      margin="normal"
                      type="password"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Email expéditeur"
                      name="senderEmail"
                      value={emailSettings.senderEmail}
                      onChange={handleEmailSettingsChange}
                      fullWidth
                      margin="normal"
                      type="email"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Nom expéditeur"
                      name="senderName"
                      value={emailSettings.senderName}
                      onChange={handleEmailSettingsChange}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={handleOpenTestEmailDialog}
                        sx={{ mr: 2 }}
                      >
                        Envoyer un email de test
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Paramètres de paiement
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={paymentSettings.enableStripe}
                          onChange={handlePaymentSettingsChange}
                          name="enableStripe"
                          color="primary"
                        />
                      }
                      label="Activer Stripe"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={paymentSettings.enablePaypal}
                          onChange={handlePaymentSettingsChange}
                          name="enablePaypal"
                          color="primary"
                        />
                      }
                      label="Activer PayPal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Clé publique Stripe"
                      name="stripePublicKey"
                      value={paymentSettings.stripePublicKey}
                      onChange={handlePaymentSettingsChange}
                      fullWidth
                      margin="normal"
                      disabled={!paymentSettings.enableStripe}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Clé secrète Stripe"
                      name="stripeSecretKey"
                      value={paymentSettings.stripeSecretKey}
                      onChange={handlePaymentSettingsChange}
                      fullWidth
                      margin="normal"
                      type="password"
                      disabled={!paymentSettings.enableStripe}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Client ID PayPal"
                      name="paypalClientId"
                      value={paymentSettings.paypalClientId}
                      onChange={handlePaymentSettingsChange}
                      fullWidth
                      margin="normal"
                      disabled={!paymentSettings.enablePaypal}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Secret PayPal"
                      name="paypalSecret"
                      value={paymentSettings.paypalSecret}
                      onChange={handlePaymentSettingsChange}
                      fullWidth
                      margin="normal"
                      type="password"
                      disabled={!paymentSettings.enablePaypal}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Pourcentage de frais de service (%)"
                      name="serviceFeePercentage"
                      value={paymentSettings.serviceFeePercentage}
                      onChange={handlePaymentSettingsChange}
                      fullWidth
                      margin="normal"
                      type="number"
                      InputProps={{
                        inputProps: { min: 0, max: 100, step: 0.1 }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {tabValue === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Paramètres de sécurité
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Secret JWT"
                      name="jwtSecret"
                      value={securitySettings.jwtSecret}
                      onChange={handleSecuritySettingsChange}
                      fullWidth
                      margin="normal"
                      type="password"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Expiration JWT"
                      name="jwtExpiresIn"
                      value={securitySettings.jwtExpiresIn}
                      onChange={handleSecuritySettingsChange}
                      fullWidth
                      margin="normal"
                      placeholder="Ex: 24h, 7d"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Longueur minimale du mot de passe"
                      name="passwordMinLength"
                      value={securitySettings.passwordMinLength}
                      onChange={handleSecuritySettingsChange}
                      fullWidth
                      margin="normal"
                      type="number"
                      InputProps={{
                        inputProps: { min: 6, max: 30 }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Nombre maximal de tentatives de connexion"
                      name="maxLoginAttempts"
                      value={securitySettings.maxLoginAttempts}
                      onChange={handleSecuritySettingsChange}
                      fullWidth
                      margin="normal"
                      type="number"
                      InputProps={{
                        inputProps: { min: 1, max: 20 }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.requireEmailVerification}
                          onChange={handleSecuritySettingsChange}
                          name="requireEmailVerification"
                          color="primary"
                        />
                      }
                      label="Exiger la vérification de l'email"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.recaptchaEnabled}
                          onChange={handleSecuritySettingsChange}
                          name="recaptchaEnabled"
                          color="primary"
                        />
                      }
                      label="Activer reCAPTCHA"
                    />
                  </Grid>
                  
                  {securitySettings.recaptchaEnabled && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Clé site reCAPTCHA"
                          name="recaptchaSiteKey"
                          value={securitySettings.recaptchaSiteKey}
                          onChange={handleSecuritySettingsChange}
                          fullWidth
                          margin="normal"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Clé secrète reCAPTCHA"
                          name="recaptchaSecretKey"
                          value={securitySettings.recaptchaSecretKey}
                          onChange={handleSecuritySettingsChange}
                          fullWidth
                          margin="normal"
                          type="password"
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleResetSettings}
                startIcon={<RefreshIcon />}
                sx={{ mr: 2 }}
                disabled={saving}
              >
                Réinitialiser
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveSettings}
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={saving}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
              </Button>
            </Box>
          </Paper>
        </>
      )}
      
      <Dialog open={testEmailDialogOpen} onClose={handleCloseTestEmailDialog}>
        <DialogTitle>Envoyer un email de test</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Entrez l'adresse email à laquelle vous souhaitez envoyer un email de test pour vérifier la configuration SMTP.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="testEmailAddress"
            label="Adresse email"
            type="email"
            fullWidth
            value={testEmailAddress}
            onChange={(e) => setTestEmailAddress(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTestEmailDialog}>Annuler</Button>
          <Button 
            onClick={handleSendTestEmail} 
            color="primary"
            disabled={saving || !testEmailAddress}
          >
            {saving ? <CircularProgress size={24} /> : 'Envoyer'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
