// client/src/pages/LandingPage.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CallIcon from '@mui/icons-material/Call';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LockIcon from '@mui/icons-material/Lock';

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navigation */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            ConnectMarket
          </Typography>
          <Button component={RouterLink} to="/login" color="primary" variant="outlined" sx={{ mr: 2 }}>
            Log In
          </Button>
          <Button component={RouterLink} to="/register" color="primary" variant="contained">
            Sign Up
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #F8F9FD 0%, #E9EFFD 100%)',
          py: 10,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h1" gutterBottom sx={{ fontWeight: 800 }}>
                Connect with Experts On Demand
              </Typography>
              <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 4 }}>
                Access professional services through secure voice calls, paid with our convenient coin system.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="large"
                  sx={{ py: 1.5, px: 4 }}
                >
                  Get Started
                </Button>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  size="large"
                  sx={{ py: 1.5, px: 4 }}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/assets/images/hero-image.png"
                alt="Platform illustration"
                sx={{
                  width: '100%',
                  maxWidth: 550,
                  height: 'auto',
                  display: 'block',
                  mx: 'auto',
                  borderRadius: 3,
                  boxShadow: 3,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Our platform connects service providers with members seeking expertise through a simple, secure process.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'primary.light',
                  color: 'white',
                  mb: 2,
                }}
              >
                <PersonIcon fontSize="large" />
              </Box>
              <CardContent sx={{ textAlign: 'center', p: 0 }}>
                <Typography variant="h5" component="h3" gutterBottom>
                  Create Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign up as a service provider or member in just a few simple steps.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'secondary.light',
                  color: 'white',
                  mb: 2,
                }}
              >
                <MonetizationOnIcon fontSize="large" />
              </Box>
              <CardContent sx={{ textAlign: 'center', p: 0 }}>
                <Typography variant="h5" component="h3" gutterBottom>
                  Purchase Coins
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Buy coins to spend on voice calls with service providers of your choice.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'warning.light',
                  color: 'white',
                  mb: 2,
                }}
              >
                <CallIcon fontSize="large" />
              </Box>
              <CardContent sx={{ textAlign: 'center', p: 0 }}>
                <Typography variant="h5" component="h3" gutterBottom>
                  Connect via Call
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start voice calls with service providers based on their hourly rates.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'success.light',
                  color: 'white',
                  mb: 2,
                }}
              >
                <LockIcon fontSize="large" />
              </Box>
              <CardContent sx={{ textAlign: 'center', p: 0 }}>
                <Typography variant="h5" component="h3" gutterBottom>
                  Secure Transactions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All payments and calls are secure, private, and protected.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Services Section */}
      <Box sx={{ bgcolor: 'background.default', py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" gutterBottom>
              Featured Services
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Discover some of our most popular service categories available on our platform.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                title: 'Business Consulting',
                image: '/assets/images/business-consulting.jpg',
                description: 'Get expert advice on business strategy, growth, and management.',
              },
              {
                title: 'Tech Support',
                image: '/assets/images/tech-support.jpg',
                description: 'Solve your technology problems with help from IT professionals.',
              },
              {
                title: 'Legal Advice',
                image: '/assets/images/legal-advice.jpg',
                description: 'Speak with qualified legal experts about your legal questions.',
              },
              {
                title: 'Financial Planning',
                image: '/assets/images/financial-planning.jpg',
                description: 'Plan your financial future with certified financial advisors.',
              },
              {
                title: 'Health & Wellness',
                image: '/assets/images/health-wellness.jpg',
                description: 'Connect with health professionals for personalized advice.',
              },
              {
                title: 'Creative Services',
                image: '/assets/images/creative-services.jpg',
                description: 'Get feedback and guidance on your creative projects.',
              },
            ].map((service, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={service.image}
                    alt={service.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {service.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              sx={{ py: 1.5, px: 4 }}
            >
              Explore All Services
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', py: 6, borderTop: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                ConnectMarket
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The premier platform for connecting service providers with clients through secure voice calls.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Quick Links
              </Typography>
              <Typography variant="body2" paragraph>
                <RouterLink to="/login" style={{ color: theme.palette.text.secondary, textDecoration: 'none' }}>
                  Login
                </RouterLink>
              </Typography>
              <Typography variant="body2" paragraph>
                <RouterLink to="/register" style={{ color: theme.palette.text.secondary, textDecoration: 'none' }}>
                  Register
                </RouterLink>
              </Typography>
              <Typography variant="body2" paragraph>
                <RouterLink to="#" style={{ color: theme.palette.text.secondary, textDecoration: 'none' }}>
                  About Us
                </RouterLink>
              </Typography>
              <Typography variant="body2" paragraph>
                <RouterLink to="#" style={{ color: theme.palette.text.secondary, textDecoration: 'none' }}>
                  Contact
                </RouterLink>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Contact Us
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Email: support@connectmarket.com
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Phone: +1 (555) 123-4567
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Address: 123 Market Street, Suite 100
                <br />
                San Francisco, CA 94103
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} ConnectMarket. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;