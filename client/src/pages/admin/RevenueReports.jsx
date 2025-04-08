// client/src/pages/admin/RevenueReports.jsx
import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent } from '@mui/material';

const RevenueReports = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Revenue Reports</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" component="div">
                $45,865
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Revenue This Month
              </Typography>
              <Typography variant="h4" component="div">
                $6,257
              </Typography>
              <Typography variant="body2" color="success.main">
                +12% vs last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Coin Purchases
              </Typography>
              <Typography variant="h4" component="div">
                95,400
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total coins sold
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Average Transaction
              </Typography>
              <Typography variant="h4" component="div">
                $42.75
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Per purchase
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Typography variant="h5" gutterBottom>Revenue Chart would go here</Typography>
      <Paper sx={{ p: 3, height: 300, mb: 4 }}>
        <Typography variant="body1" color="text.secondary" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Chart placeholder - Recharts implementation would go here
        </Typography>
      </Paper>
      
      <Typography variant="h5" gutterBottom>Top Revenue Sources</Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Table of top categories and service providers by revenue would go here
        </Typography>
      </Paper>
    </Box>
  );
};

export default RevenueReports;