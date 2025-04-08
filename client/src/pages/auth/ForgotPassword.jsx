// client/src/pages/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Link, Alert } from '@mui/material';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/assets/images/login-background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(25, 118, 210, 0.7)',
          zIndex: 1,
        },
      }}
    >
      <Paper
        sx={{
          p: 4,
          maxWidth: 500,
          width: '90%',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Reset Password
        </Typography>
        <Typography variant="body1" align="center" paragraph>
          Enter your email address and we'll send you a link to reset your password.
        </Typography>
        
        {submitted ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            If your email address exists in our database, you will receive a password recovery link at your email address shortly.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mb: 3 }}
            >
              Reset Password
            </Button>
          </Box>
        )}
        
        <Box textAlign="center">
          <Link component={RouterLink} to="/login" variant="body2">
            Back to login
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;