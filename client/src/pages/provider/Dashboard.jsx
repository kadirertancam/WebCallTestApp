// client/src/pages/provider/Dashboard.jsx
import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

const ProviderDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Provider Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>Total Earnings</Typography>
            <Typography component="p" variant="h4">1,250 coins</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>Completed Calls</Typography>
            <Typography component="p" variant="h4">43</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>Active Services</Typography>
            <Typography component="p" variant="h4">5</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>Average Rating</Typography>
            <Typography component="p" variant="h4">4.8/5</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProviderDashboard;