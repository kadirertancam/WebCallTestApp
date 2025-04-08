// client/src/pages/provider/CreateServiceSimplified.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, Grid, Paper, CircularProgress, 
  Alert, TextField, MenuItem, Divider, Chip, IconButton,
  Select, FormControl, InputLabel, FormHelperText
} from '@mui/material';
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

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const CreateServiceSimplified = () => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [hourlyRate, setHourlyRate] = useState(50);
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState('');
  const [serviceDetails, setServiceDetails] = useState('');
  const [availability, setAvailability] = useState([
    { day: 'Monday', hours: [{ start: '09:00', end: '17:00' }] }
  ]);
  
  // Form validation errors
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!title) newErrors.title = 'Title is required';
    else if (title.length < 5) newErrors.title = 'Title is too short';
    else if (title.length > 100) newErrors.title = 'Title is too long';
    
    if (!hourlyRate) newErrors.hourlyRate = 'Hourly rate is required';
    else if (hourlyRate < 1) newErrors.hourlyRate = 'Minimum rate is 1 coin';
    else if (hourlyRate > 1000) newErrors.hourlyRate = 'Maximum rate is 1000 coins';
    
    if (categories.length === 0) newErrors.categories = 'Select at least one category';
    
    if (!description) newErrors.description = 'Description is required';
    else if (description.length < 20) newErrors.description = 'Description is too short';
    else if (description.length > 500) newErrors.description = 'Description is too long';
    
    if (!serviceDetails) newErrors.serviceDetails = 'Service details are required';
    else if (serviceDetails.length < 50) newErrors.serviceDetails = 'Please provide more detailed information';
    else if (serviceDetails.length > 2000) newErrors.serviceDetails = 'Service details are too long';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setSubmitError('');
      
      // In a real implementation, this would be an API call
      // const response = await serviceAdService.createAd({
      //   title,
      //   hourlyRate,
      //   categories,
      //   description,
      //   serviceDetails,
      //   availability
      // });
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      
      // Reset form
      setTitle('');
      setHourlyRate(50);
      setCategories([]);
      setDescription('');
      setServiceDetails('');
      setAvailability([{ day: 'Monday', hours: [{ start: '09:00', end: '17:00' }] }]);
      
      // Navigate after delay
      setTimeout(() => {
        navigate('/provider/services');
      }, 2000);
    } catch (error) {
      setSubmitError(error.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle category selection
  const handleCategoryChange = (event) => {
    setCategories(event.target.value);
  };
  
  // Add a day to availability
  const addDay = () => {
    setAvailability([
      ...availability,
      { day: 'Monday', hours: [{ start: '09:00', end: '17:00' }] }
    ]);
  };
  
  // Remove a day from availability
  const removeDay = (index) => {
    const newAvailability = [...availability];
    newAvailability.splice(index, 1);
    setAvailability(newAvailability);
  };
  
  // Update day value
  const updateDay = (index, day) => {
    const newAvailability = [...availability];
    newAvailability[index].day = day;
    setAvailability(newAvailability);
  };
  
  // Add a time slot to a day
  const addTimeSlot = (dayIndex) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].hours.push({ start: '', end: '' });
    setAvailability(newAvailability);
  };
  
  // Remove a time slot from a day
  const removeTimeSlot = (dayIndex, timeIndex) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].hours.splice(timeIndex, 1);
    setAvailability(newAvailability);
  };
  
  // Update time slot
  const updateTimeSlot = (dayIndex, timeIndex, field, value) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].hours[timeIndex][field] = value;
    setAvailability(newAvailability);
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
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Service Title"
                fullWidth
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Business Strategy Consulting"
                helperText={errors.title || "Create a clear, descriptive title that helps members understand your service"}
                error={!!errors.title}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Hourly Rate (coins)"
                type="number"
                fullWidth
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                inputProps={{ min: 1, max: 1000 }}
                helperText={errors.hourlyRate || "Set your rate per hour in coins. Members will be charged proportionally for the call duration."}
                error={!!errors.hourlyRate}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.categories}>
                <InputLabel>Categories</InputLabel>
                <Select
                  multiple
                  value={categories}
                  onChange={handleCategoryChange}
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
                <FormHelperText>{errors.categories || "Select at least one category for your service"}</FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Short Description"
                fullWidth
                required
                multiline
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief overview of your service (max 500 characters)"
                helperText={errors.description || "This will appear in search results. Make it concise and compelling."}
                error={!!errors.description}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Detailed Description"
                fullWidth
                required
                multiline
                rows={6}
                value={serviceDetails}
                onChange={(e) => setServiceDetails(e.target.value)}
                placeholder="Provide a comprehensive description of what your service includes, your expertise, and what clients can expect during the call"
                helperText={errors.serviceDetails || "Be specific about your qualifications, experience, and the value you provide"}
                error={!!errors.serviceDetails}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Availability</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Set your general availability for calls. Members will be able to see when you're typically available.
              </Typography>
              
              {availability.map((dayAvail, dayIndex) => (
                <Paper key={dayIndex} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FormControl sx={{ width: 200, mr: 2 }}>
                      <InputLabel>Day</InputLabel>
                      <Select
                        value={dayAvail.day}
                        onChange={(e) => updateDay(dayIndex, e.target.value)}
                        label="Day"
                      >
                        {daysOfWeek.map((day) => (
                          <MenuItem key={day} value={day}>
                            {day}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    {availability.length > 1 && (
                      <IconButton 
                        color="error" 
                        onClick={() => removeDay(dayIndex)}
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>Time Slots:</Typography>
                  
                  {dayAvail.hours.map((timeSlot, timeIndex) => (
                    <Box key={timeIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TextField
                        type="time"
                        label="Start Time"
                        value={timeSlot.start}
                        onChange={(e) => updateTimeSlot(dayIndex, timeIndex, 'start', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mr: 2, width: 150 }}
                      />
                      
                      <TextField
                        type="time"
                        label="End Time"
                        value={timeSlot.end}
                        onChange={(e) => updateTimeSlot(dayIndex, timeIndex, 'end', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mr: 2, width: 150 }}
                      />
                      
                      {dayAvail.hours.length > 1 && (
                        <IconButton 
                          color="error" 
                          onClick={() => removeTimeSlot(dayIndex, timeIndex)}
                          size="small"
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                  
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => addTimeSlot(dayIndex)}
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Add Time Slot
                  </Button>
                </Paper>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={addDay}
                variant="outlined"
              >
                Add Day
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/provider/services')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  type="submit"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Creating...' : 'Create Service'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateServiceSimplified;