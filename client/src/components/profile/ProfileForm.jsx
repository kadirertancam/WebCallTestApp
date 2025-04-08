// client/src/components/profile/ProfileForm.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Box, Typography, Grid, TextField, Button, Paper, Avatar, 
  IconButton, Switch, FormControlLabel, CircularProgress, Alert,
  Accordion, AccordionSummary, AccordionDetails, Divider
} from '@mui/material';
import { ExpandMore, PhotoCamera, Save } from '@mui/icons-material';
import { userService } from '../../services/api';

const ProfileForm = () => {
  const { currentUser, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    bio: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    settings: {
      emailNotifications: true,
      smsNotifications: false,
      callReminders: true
    }
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Load current user data
  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.profile?.firstName || '',
        lastName: currentUser.profile?.lastName || '',
        phoneNumber: currentUser.profile?.phoneNumber || '',
        bio: currentUser.profile?.bio || '',
        address: {
          street: currentUser.profile?.address?.street || '',
          city: currentUser.profile?.address?.city || '',
          state: currentUser.profile?.address?.state || '',
          zipCode: currentUser.profile?.address?.zipCode || '',
          country: currentUser.profile?.address?.country || ''
        },
        settings: {
          emailNotifications: currentUser.profile?.settings?.emailNotifications !== false,
          smsNotifications: currentUser.profile?.settings?.smsNotifications || false,
          callReminders: currentUser.profile?.settings?.callReminders !== false
        }
      });
      
      if (currentUser.profile?.profileImage) {
        setImagePreview(currentUser.profile.profileImage);
      }
    }
  }, [currentUser]);
  
  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle settings toggle
  const handleToggle = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: checked
      }
    }));
  };
  
  // Handle profile image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess(false);
      
      // Update profile
      const profileResponse = await userService.updateProfile(formData);
      
      // Upload profile image if changed
      if (profileImage) {
        const formData = new FormData();
        formData.append('profileImage', profileImage);
        await userService.uploadProfileImage(formData);
      }
      
      // Update auth context
      updateProfile(profileResponse.data.data);
      
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit}>
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative', mr: 3 }}>
            <Avatar
              src={imagePreview || '/assets/images/default-avatar.png'}
              alt="Profile"
              sx={{ width: 100, height: 100 }}
            />
            <input
             // client/src/components/profile/ProfileForm.jsx (continued)
             accept="image/*"
             type="file"
             id="profile-image-upload"
             onChange={handleImageChange}
             style={{ display: 'none' }}
           />
           <label htmlFor="profile-image-upload">
             <IconButton
               component="span"
               sx={{
                 position: 'absolute',
                 bottom: 0,
                 right: 0,
                 bgcolor: 'primary.main',
                 color: 'white',
                 '&:hover': {
                   bgcolor: 'primary.dark',
                 },
               }}
             >
               <PhotoCamera />
             </IconButton>
           </label>
         </Box>
         <Box>
           <Typography variant="h5">
             {currentUser?.profile?.firstName} {currentUser?.profile?.lastName}
           </Typography>
           <Typography variant="body2" color="text.secondary">
             {currentUser?.email}
           </Typography>
           <Typography variant="body2" color="text.secondary">
             {currentUser?.role === 'user' ? 'Service Provider' : 
              currentUser?.role === 'admin' ? 'Administrator' : 'Member'}
           </Typography>
         </Box>
       </Box>
       
       <Divider sx={{ mb: 3 }} />
       
       <Typography variant="h6" gutterBottom>
         Personal Information
       </Typography>
       
       <Grid container spacing={2}>
         <Grid item xs={12} sm={6}>
           <TextField
             fullWidth
             label="First Name"
             name="firstName"
             value={formData.firstName}
             onChange={handleChange}
           />
         </Grid>
         <Grid item xs={12} sm={6}>
           <TextField
             fullWidth
             label="Last Name"
             name="lastName"
             value={formData.lastName}
             onChange={handleChange}
           />
         </Grid>
         <Grid item xs={12}>
           <TextField
             fullWidth
             label="Phone Number"
             name="phoneNumber"
             value={formData.phoneNumber}
             onChange={handleChange}
           />
         </Grid>
         <Grid item xs={12}>
           <TextField
             fullWidth
             label="Bio"
             name="bio"
             value={formData.bio}
             onChange={handleChange}
             multiline
             rows={4}
             placeholder="Tell us about yourself..."
           />
         </Grid>
       </Grid>
     </Paper>
     
     <Accordion>
       <AccordionSummary expandIcon={<ExpandMore />}>
         <Typography variant="h6">Address Information</Typography>
       </AccordionSummary>
       <AccordionDetails>
         <Grid container spacing={2}>
           <Grid item xs={12}>
             <TextField
               fullWidth
               label="Street Address"
               name="address.street"
               value={formData.address.street}
               onChange={handleChange}
             />
           </Grid>
           <Grid item xs={12} sm={6}>
             <TextField
               fullWidth
               label="City"
               name="address.city"
               value={formData.address.city}
               onChange={handleChange}
             />
           </Grid>
           <Grid item xs={12} sm={6}>
             <TextField
               fullWidth
               label="State/Province"
               name="address.state"
               value={formData.address.state}
               onChange={handleChange}
             />
           </Grid>
           <Grid item xs={12} sm={6}>
             <TextField
               fullWidth
               label="Zip/Postal Code"
               name="address.zipCode"
               value={formData.address.zipCode}
               onChange={handleChange}
             />
           </Grid>
           <Grid item xs={12} sm={6}>
             <TextField
               fullWidth
               label="Country"
               name="address.country"
               value={formData.address.country}
               onChange={handleChange}
             />
           </Grid>
         </Grid>
       </AccordionDetails>
     </Accordion>
     
     <Accordion sx={{ mt: 2 }}>
       <AccordionSummary expandIcon={<ExpandMore />}>
         <Typography variant="h6">Notification Settings</Typography>
       </AccordionSummary>
       <AccordionDetails>
         <FormControlLabel
           control={
             <Switch
               checked={formData.settings.emailNotifications}
               onChange={handleToggle}
               name="emailNotifications"
               color="primary"
             />
           }
           label="Email Notifications"
         />
         <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
           Receive email notifications about calls, messages, and updates.
         </Typography>
         
         <FormControlLabel
           control={
             <Switch
               checked={formData.settings.smsNotifications}
               onChange={handleToggle}
               name="smsNotifications"
               color="primary"
             />
           }
           label="SMS Notifications"
         />
         <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
           Receive text messages about upcoming calls and important updates.
         </Typography>
         
         <FormControlLabel
           control={
             <Switch
               checked={formData.settings.callReminders}
               onChange={handleToggle}
               name="callReminders"
               color="primary"
             />
           }
           label="Call Reminders"
         />
         <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
           Receive reminders before scheduled calls.
         </Typography>
       </AccordionDetails>
     </Accordion>
     
     <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
       <Button
         type="submit"
         variant="contained"
         color="primary"
         size="large"
         startIcon={<Save />}
         disabled={loading}
       >
         {loading ? <CircularProgress size={24} /> : 'Save Changes'}
       </Button>
     </Box>
   </Box>
 );
};

export default ProfileForm;