// client/src/pages/member/ServiceDetail.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, Card, CardContent, Divider, Grid, Avatar, Chip, Paper } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';

const ServiceDetail = () => {
  const { id } = useParams();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Service Details</Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>Business Consulting Service {id}</Typography>
              
              <Box sx={{ my: 2 }}>
                <Chip icon={<AccessTimeIcon />} label="60 min" sx={{ mr: 1 }} />
                <Chip icon={<StarIcon />} label="4.8 (24 reviews)" />
              </Box>
              
              <Typography variant="body1" paragraph>
                Professional business consulting services to help you grow your business. Get expert advice on strategy, marketing, and operations from an experienced consultant.
              </Typography>
              
              <Typography variant="body1" paragraph>
                This service includes a one-on-one voice call where we'll discuss your specific business challenges and develop actionable solutions tailored to your needs.
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>What's Included:</Typography>
              <ul>
                <li>Business strategy assessment</li>
                <li>Market analysis and recommendations</li>
                <li>Competitive positioning advice</li>
                <li>Growth opportunity identification</li>
                <li>Follow-up action plan document</li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>50 coins / hour</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Calls are charged per minute based on the hourly rate
            </Typography>
            
            <Button variant="contained" fullWidth size="large" sx={{ mb: 2 }}>
              Start Call Now
            </Button>
            
            <Button variant="outlined" fullWidth>
              Schedule for Later
            </Button>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ width: 56, height: 56, mr: 2 }} src="https://randomuser.me/api/portraits/men/32.jpg" />
              <Box>
                <Typography variant="h6">John Smith</Typography>
                <Typography variant="body2" color="text.secondary">Business Consultant</Typography>
              </Box>
            </Box>
            
            <Typography variant="body2" paragraph>
              MBA with 15+ years of experience in business consulting for startups and SMEs. Specialized in growth strategy and market expansion.
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" color="text.secondary">
              Member since: January 2023
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ServiceDetail;