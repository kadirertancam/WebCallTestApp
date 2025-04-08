// client/src/pages/provider/MyServices.jsx
import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip } from '@mui/material';

const MyServices = () => {
  const services = [
    { id: 1, title: 'Business Consulting', rate: 50, active: true },
    { id: 2, title: 'Marketing Strategy', rate: 45, active: true },
    { id: 3, title: 'Financial Planning', rate: 60, active: false },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Services</Typography>
        <Button variant="contained" color="primary">Add New Service</Button>
      </Box>
      
      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid item xs={12} md={6} lg={4} key={service.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{service.title}</Typography>
                  <Chip 
                    label={service.active ? 'Active' : 'Inactive'} 
                    color={service.active ? 'success' : 'default'} 
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Service description would go here. This is a brief overview of what you offer.
                </Typography>
                <Typography variant="h6" color="primary">
                  {service.rate} coins / hour
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Edit</Button>
                <Button size="small" color={service.active ? "error" : "success"}>
                  {service.active ? 'Deactivate' : 'Activate'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyServices;