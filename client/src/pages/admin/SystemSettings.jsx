// client/src/pages/admin/SystemSettings.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Slider,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { Save, ExpandMore, SettingsOutlined } from '@mui/icons-material';
import { adminService } from '../../services/api';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    general: {
      siteName: 'ConnectMarket',
      contactEmail: 'support@connectmarket.com',
      maintenanceMode: false,
    },
    coins: {
      conversionRate: 50, // 50 coins = $1
      minimumPurchase: 100,
      maximumPurchase: 10000,
    },
    calls: {
      minimumCallDuration: 5, // minutes
      maximumCallDuration: 120, // minutes
      defaultCallDuration: 15, // minutes
      autoEndWarningTime: 2, // minutes before end
    },
    commission: {
      providerCommissionRate: 20, // 20% commission
      payoutThreshold: 1000, // coins
      automaticPayout: false,
    },
    email: {
      enableEmailNotifications: true,
      welcomeEmailEnabled: true,
      callReminderEnabled: true,
      paymentConfirmationEnabled: true,
    },
    security: {
      requireEmailVerification: true,
      passwordMinLength: 8,
      sessionTimeout: 60, // minutes
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await adminService.getSystemSettings();
        setSettings(response.data);
      } catch (err) {
        setError('Failed to load settings: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  // Handle input changes
  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess(false);
      
      await adminService.updateSystemSettings(settings);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError('Failed to save settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">System Settings</Typography>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={<Save />}
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : 'Save Settings'}
        </Button>
      </Box>
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">General Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  label="Site Name"
                  value={settings.general.siteName}
                  onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Contact Email"
                  value={settings.general.contactEmail}
                  onChange={(e) => handleChange('general', 'contactEmail', e.target.value)}
                  margin="normal"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.general.maintenanceMode}
                      onChange={(e) => handleChange('general', 'maintenanceMode', e.target.checked)}
                      color="warning"
                    />
                  }
                  label="Maintenance Mode"
                  sx={{ mt: 2 }}
                />
                
                {settings.general.maintenanceMode && (
                  <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                    Warning: Enabling maintenance mode will make the site inaccessible to regular users.
                  </Typography>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>
        
        {/* Coin Settings */}
        <Grid item xs={12} md={6}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Coin System</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ p: 2 }}>
                <Typography gutterBottom>Coin Conversion Rate (coins per $1)</Typography>
                <Slider
                  value={settings.coins.conversionRate}
                  onChange={(_, value) => handleChange('coins', 'conversionRate', value)}
                  min={10}
                  max={100}
                  step={5}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 10, label: '10' },
                    { value: 50, label: '50' },
                    { value: 100, label: '100' }
                  ]}
                  sx={{ mb: 3 }}
                />
                
                <TextField
                  fullWidth
                  label="Minimum Coin Purchase"
                  type="number"
                  value={settings.coins.minimumPurchase}
                  onChange={(e) => handleChange('coins', 'minimumPurchase', parseInt(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">coins</InputAdornment>,
                  }}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Maximum Coin Purchase"
                  type="number"
                  value={settings.coins.maximumPurchase}
                  onChange={(e) => handleChange('coins', 'maximumPurchase', parseInt(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">coins</InputAdornment>,
                  }}
                  margin="normal"
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>
        
        {/* Call Settings */}
        <Grid item xs={12} md={6}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Call Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  label="Minimum Call Duration"
                  type="number"
                  value={settings.calls.minimumCallDuration}
                  onChange={(e) => handleChange('calls', 'minimumCallDuration', parseInt(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                  }}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Maximum Call Duration"
                  type="number"
                  value={settings.calls.maximumCallDuration}
                  onChange={(e) => handleChange('calls', 'maximumCallDuration', parseInt(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                  }}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Default Call Duration"
                  type="number"
                  value={settings.calls.defaultCallDuration}
                  onChange={(e) => handleChange('calls', 'defaultCallDuration', parseInt(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                  }}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Auto-End Warning Time"
                  type="number"
                  value={settings.calls.autoEndWarningTime}
                  onChange={(e) => handleChange('calls', 'autoEndWarningTime', parseInt(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">minutes before end</InputAdornment>,
                  }}
                  margin="normal"
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>
        
        {/* Commission Settings */}
        <Grid item xs={12} md={6}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Commission & Payouts</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ p: 2 }}>
                <Typography gutterBottom>Provider Commission Rate (%)</Typography>
                <Slider
                  value={settings.commission.providerCommissionRate}
                  onChange={(_, value) => handleChange('commission', 'providerCommissionRate', value)}
                  min={0}
                  max={50}
                  step={5}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 20, label: '20%' },
                    { value: 50, label: '50%' }
                  ]}
                  sx={{ mb: 3 }}
                />
                
                <TextField
                  fullWidth
                  label="Payout Threshold"
                  type="number"
                  value={settings.commission.payoutThreshold}
                  onChange={(e) => handleChange('commission', 'payoutThreshold', parseInt(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">coins</InputAdornment>,
                  }}
                  margin="normal"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.commission.automaticPayout}
                      onChange={(e) => handleChange('commission', 'automaticPayout', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Automatic Payouts"
                  sx={{ mt: 2 }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>
        
        {/* Email Settings */}
        <Grid item xs={12} md={6}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Email Notifications</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ p: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email.enableEmailNotifications}
                      onChange={(e) => handleChange('email', 'enableEmailNotifications', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Enable Email Notifications"
                  sx={{ mb: 2 }}
                />
                
                <Divider sx={{ my: 2 }} />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email.welcomeEmailEnabled}
                      onChange={(e) => handleChange('email', 'welcomeEmailEnabled', e.target.checked)}
                      color="primary"
                      disabled={!settings.email.enableEmailNotifications}
                    />
                  }
                  label="Welcome Email"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email.callReminderEnabled}
                      onChange={(e) => handleChange('email', 'callReminderEnabled', e.target.checked)}
                      color="primary"
                      disabled={!settings.email.enableEmailNotifications}
                    />
                  }
                  label="Call Reminders"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email.paymentConfirmationEnabled}
                      onChange={(e) => handleChange('email', 'paymentConfirmationEnabled', e.target.checked)}
                      color="primary"
                      disabled={!settings.email.enableEmailNotifications}
                    />
                  }
                  label="Payment Confirmations"
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>
        
        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Security Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ p: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.requireEmailVerification}
                      onChange={(e) => handleChange('security', 'requireEmailVerification', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Require Email Verification"
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Minimum Password Length"
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => handleChange('security', 'passwordMinLength', parseInt(e.target.value))}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Session Timeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                  }}
                  margin="normal"
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Save />}
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : 'Save All Settings'}
        </Button>
      </Box>
    </Box>
  );
};

export default SystemSettings;