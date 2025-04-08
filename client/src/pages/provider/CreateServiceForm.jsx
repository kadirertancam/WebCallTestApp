// Enhanced CreateServiceForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { 
  Box, Typography, Button, Grid, Paper, CircularProgress, 
  Alert, FormControl, InputLabel, MenuItem, FormHelperText,
  Select, Chip, Divider, IconButton, Input
} from '@mui/material';
import { TextField } from 'formik-mui';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { serviceAdService } from '../../services/api';

const serviceCategories = [
  'Business Consulting', 'Legal Advice', 'Financial Planning',
  'Career Coaching', 'Life Coaching', 'Mental Health',
  'Technology Support', 'Marketing Strategy', 'Creative Consulting',
  'Academic Tutoring', 'Language Learning', 'Health & Wellness',
  'Spiritual Guidance', 'Relationship Advice', 'Other'
];

const ServiceSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .min(5, 'Title is too short')
    .max(100, 'Title is too long'),
  hourlyRate: Yup.number()
    .required('Hourly rate is required')
    .min(1, 'Minimum rate is 1 coin')
    .max(1000, 'Maximum rate is 1000 coins'),
  categories: Yup.array()
    .min(1, 'Select at least one category')
    .required('At least one category is required'),
  description: Yup.string()
    .required('Description is required')
    .min(20, 'Description is too short')
    .max(500, 'Description is too long'),
  serviceDetails: Yup.string()
    .required('Service details are required')
    .min(50, 'Please provide more detailed information')
    .max(2000, 'Service details are too long'),
  availability: Yup.array().of(
    Yup.object().shape({
      day: Yup.string().required('Day is required'),
      hours: Yup.array().of(
        Yup.object().shape({
          start: Yup.string().required('Start time is required'),
          end: Yup.string().required('End time is required')
        })
      )
    })
  )
});

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const CreateServiceForm = () => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const initialValues = {
    title: '',
    hourlyRate: 50,
    categories: [],
    description: '',
    serviceDetails: '',
    availability: [
      { 
        day: 'Monday', 
        hours: [{ start: '09:00', end: '17:00' }] 
      }
    ]
  };
  
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setSubmitError('');
      const response = await serviceAdService.createAd(values);
      
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
          initialValues={initialValues}
          validationSchema={ServiceSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values, errors, touched, setFieldValue }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Field
                    component={TextField}
                    name="title"
                    label="Service Title"
                    fullWidth
                    required
                    placeholder="e.g., Business Strategy Consulting"
                    helperText="Create a clear, descriptive title that helps members understand your service"
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
                    inputProps={{ min: 1, max: 1000 }}
                    helperText="Set your rate per hour in coins. Members will be charged proportionally for the call duration."
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={touched.categories && Boolean(errors.categories)}>
                    <InputLabel>Categories</InputLabel>
                    <Select
                      multiple
                      value={values.categories}
                      onChange={(e) => setFieldValue('categories', e.target.value)}
                      input={<Input />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    >
                      {serviceCategories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.categories && errors.categories && (
                      <FormHelperText>{errors.categories}</FormHelperText>
                    )}
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
                    placeholder="Brief overview of your service (max 500 characters)"
                    helperText="This will appear in search results. Make it concise and compelling."
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
                    rows={6}
                    placeholder="Provide a comprehensive description of what your service includes, your expertise, and what clients can expect during the call"
                    helperText="Be specific about your qualifications, experience, and the value you provide"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Availability</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Set your general availability for calls. Members will be able to see when you're typically available.
                  </Typography>
                  
                  <FieldArray name="availability">
                    {({ push, remove }) => (
                      <Box>
                        {values.availability.map((dayAvail, dayIndex) => (
                          <Paper key={dayIndex} variant="outlined" sx={{ p: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <FormControl sx={{ width: 200, mr: 2 }}>
                                <InputLabel>Day</InputLabel>
                                <Select
                                  value={dayAvail.day}
                                  onChange={(e) => setFieldValue(`availability[${dayIndex}].day`, e.target.value)}
                                  label="Day"
                                >
                                  {daysOfWeek.map((day) => (
                                    <MenuItem key={day} value={day}>
                                      {day}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                              
                              {values.availability.length > 1 && (
                                <IconButton 
                                  color="error" 
                                  onClick={() => remove(dayIndex)}
                                  size="small"
                                >
                                  <RemoveIcon />
                                </IconButton>
                              )}
                            </Box>
                            
                            <Typography variant="subtitle2" gutterBottom>Time Slots:</Typography>
                            
                            <FieldArray name={`availability[${dayIndex}].hours`}>
                              {({ push: pushHour, remove: removeHour }) => (
                                <Box>
                                  {dayAvail.hours.map((timeSlot, timeIndex) => (
                                    <Box key={timeIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      <TextField
                                        type="time"
                                        label="Start Time"
                                        value={timeSlot.start}
                                        onChange={(e) => setFieldValue(`availability[${dayIndex}].hours[${timeIndex}].start`, e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ mr: 2, width: 150 }}
                                      />
                                      
                                      <TextField
                                        type="time"
                                        label="End Time"
                                        value={timeSlot.end}
                                        onChange={(e) => setFieldValue(`availability[${dayIndex}].hours[${timeIndex}].end`, e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ mr: 2, width: 150 }}
                                      />
                                      
                                      {dayAvail.hours.length > 1 && (
                                        <IconButton 
                                          color="error" 
                                          onClick={() => removeHour(timeIndex)}
                                          size="small"
                                        >
                                          <RemoveIcon fontSize="small" />
                                        </IconButton>
                                      )}
                                    </Box>
                                  ))}
                                  
                                  <Button
                                    startIcon={<AddIcon />}
                                    onClick={() => pushHour({ start: '', end: '' })}
                                    variant="outlined"
                                    size="small"
                                    sx={{ mt: 1 }}
                                  >
                                    Add Time Slot
                                  </Button>
                                </Box>
                              )}
                            </FieldArray>
                          </Paper>
                        ))}
                        
                        <Button
                          startIcon={<AddIcon />}
                          onClick={() => push({ day: 'Monday', hours: [{ start: '09:00', end: '17:00' }] })}
                          variant="outlined"
                        >
                          Add Day
                        </Button>
                      </Box>
                    )}
                  </FieldArray>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
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

export default CreateServiceForm;