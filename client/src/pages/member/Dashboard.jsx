// client/src/pages/member/Dashboard.jsx
import React from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';

const MemberDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Member Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>Available Coins</Typography>
            <Typography component="p" variant="h4">250</Typography>
            <Box sx={{ mt: 'auto' }}>
              <Button size="small" color="primary">Buy more</Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>Recent Calls</Typography>
            <Typography component="p" variant="h4">12</Typography>
            <Box sx={{ mt: 'auto' }}>
              <Button size="small" color="primary">View all</Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>Favorite Services</Typography>
            <Typography component="p" variant="h4">5</Typography>
            <Box sx={{ mt: 'auto' }}>
              <Button size="small" color="primary">View all</Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>Upcoming Calls</Typography>
            <Typography component="p" variant="h4">2</Typography>
            <Box sx={{ mt: 'auto' }}>
              <Button size="small" color="primary">View schedule</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MemberDashboard;