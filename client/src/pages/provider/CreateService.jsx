// client/src/pages/provider/CreateService.jsx - Enhanced version
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Box, Typography, Button, Grid, Paper, CircularProgress, Alert, FormControl, InputLabel, MenuItem } from '@mui/material';
import { TextField, Select } from 'formik-mui';
import { serviceAdService } from '../../services/api';

const ServiceSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').max(100, 'Title is too long'),
  hourlyRate: Yup.number().required('Hourly rate is required').min(1, 'Minimum rate is 1 coin'),
  category: Yup.string().required('Category is required'),
  description: Yup.string().required('Description is required').max(150, 'Description is too long'),
  serviceDetails: Yup.string().required('Service details are required'),
});

const CreateService = () => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setSubmitError('');
      const response = await serviceAdService.createAd({
        title: values.title,
        hourlyRate: values.hourlyRate,
        categories: [values.category],
        description: values.description,
        serviceDetails: values.serviceDetails
      });
      
      setSuccess(true);
      resetForm();
      setTimeout(() => {
        navigate('/provider/services');
      }, 2000);
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to create service');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Create New Service</Typography>
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Service created successfully! Redirecting to your services...
        </Alert>
      )}
      
      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <Formik
          initialValues={{
            title: '',
            hourlyRate: '',
            category: '',
            description: '',
            serviceDetails: ''
          }}
          validationSchema={ServiceSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Field
                    component={TextField}
                    name="title"
                    label="Service Title"
                    fullWidth
                    required
                    placeholder="e.g., Business Consulting"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field
                    component={TextField}
                    name="hourlyRate"
                    label="Hourly Rate (coins)"
                    type="number"
                    fullWidth
                    required
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Field
                      component={Select}
                      name="category"
                      label="Category"
                    >
                      <MenuItem value="business">Business</MenuItem>
                      <MenuItem value="technology">Technology</MenuItem>
                      <MenuItem value="legal">Legal</MenuItem>
                      <MenuItem value="health">Health & Wellness</MenuItem>
                      <MenuItem value="finance">Finance</MenuItem>
                      <MenuItem value="creative">Creative</MenuItem>
                      <MenuItem value="education">Education</MenuItem>
                    </Field>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Field
                    component={TextField}
                    name="description"
                    label="Short Description"
                    fullWidth
                    required
                    multiline
                    rows={2}
                    placeholder="Brief overview of your service (max 150 characters)"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Field
                    component={TextField}
                    name="serviceDetails"
                    label="Detailed Description"
                    fullWidth
                    required
                    multiline
                    rows={5}
                    placeholder="Provide a detailed description of what your service includes, your expertise, and what clients can expect"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate('/provider/services')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="contained" 
                      type="submit"
                      disabled={isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Service'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default CreateService;