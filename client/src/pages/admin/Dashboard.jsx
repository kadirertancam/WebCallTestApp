// client/src/pages/admin/Dashboard.jsx
import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

const AdminDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>Total Users</Typography>
            <Typography component="p" variant="h4">2,543</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>Active Services</Typography>
            <Typography component="p" variant="h4">784</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>Total Revenue</Typography>
            <Typography component="p" variant="h4">$45,865</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>Calls Today</Typography>
            <Typography component="p" variant="h4">247</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;