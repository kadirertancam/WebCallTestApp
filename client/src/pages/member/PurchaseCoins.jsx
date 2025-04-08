// client/src/pages/member/PurchaseCoins.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Box, Typography, Grid, Card, CardContent, Button, Radio, 
  RadioGroup, FormControlLabel, Paper, Divider, CircularProgress, 
  Alert, Tabs, Tab, Stepper, Step, StepLabel
} from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { coinService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

// Load Stripe
const stripePromise = loadStripe('pk_test_51RBGgIQW4yZi6xe9sxgLHIOvhL2LeNqV4Lr7snlExTIX31rXVTEBEeUq9t5K4Tv5MrIX1o6madB4fV9RtY9jyI1b00HFhHEUXw');

// Stripe Payment Form
const StripePaymentForm = ({ packageDetails, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });
      
      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }
      
      // Process payment
      const response = await coinService.purchaseCoins({
        packageId: packageDetails.id,
        paymentMethod: 'credit_card',
        paymentDetails: {
          stripePaymentMethodId: paymentMethod.id
        }
      });
      
      onSuccess(response.data);
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      onError(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ my: 3 }}>
        <Typography variant="h6" gutterBottom>
          Credit Card Details
        </Typography>
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Button 
        type="submit" 
        variant="contained" 
        color="primary" 
        fullWidth
        disabled={!stripe || loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : `Pay $${packageDetails.price.toFixed(2)}`}
      </Button>
    </Box>
  );
};

// Main component
const PurchaseCoins = () => {
  const navigate = useNavigate();
  const { currentUser, updateCoins } = useAuth();
  const [coinPackages, setCoinPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [activeStep, setActiveStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await coinService.getPackages();
        // Eğer API'den dönen veri bir dizi değilse, varsayılan olarak boş bir dizi kullan.
        const packages = Array.isArray(response.data) ? response.data : (response.data.packages || []);
        setCoinPackages(packages);
        if (packages.length > 0) {
          setSelectedPackage(packages[0].id);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load coin packages');
        setLoading(false);
      }
    };
    
    fetchPackages();
  }, []);
  
  const getSelectedPackageDetails = () => {
    return coinPackages.find(pkg => pkg.id === selectedPackage) || null;
  };
  
  const handlePurchase = () => {
    // Simulate purchase
    setSuccess(true);
    setTimeout(() => {
      navigate('/member/dashboard');
    }, 2000);
  };
  
  const handlePaymentSuccess = (data) => {
    setSuccess(true);
    updateCoins(data.newBalance);
    setActiveStep(2);
  };
  
  const handlePaymentError = (err) => {
    setError(err.message || 'Payment failed. Please try again.');
  };
  
  const handlePackageSelect = (packageId) => {
    setSelectedPackage(packageId);
  };
  
  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };
  
  const proceedToPayment = () => {
    if (!selectedPackage) {
      setError('Please select a coin package');
      return;
    }
    
    setActiveStep(1);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  const packageDetails = getSelectedPackageDetails();
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Purchase Coins</Typography>
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Your purchase was successful! Coins have been added to your account.
        </Alert>
      )}
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>Select Coin Package</Typography>
          <Grid container spacing={2}>
            {coinPackages.map((pkg) => (
              <Grid item xs={12} sm={6} key={pkg.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedPackage === pkg.id ? '2px solid' : '1px solid',
                    borderColor: selectedPackage === pkg.id ? 'primary.main' : 'divider',
                  }}
                  onClick={() => handlePackageSelect(pkg.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">{pkg.name}</Typography>
                      <Radio 
                        checked={selectedPackage === pkg.id}
                        onChange={() => handlePackageSelect(pkg.id)}
                      />
                    </Box>
                    <Typography variant="h4" sx={{ my: 2, color: 'primary.main' }}>
                      {pkg.coins} coins
                    </Typography>
                    <Typography variant="h6">${pkg.price.toFixed(2)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              color="primary"
              size="large"
              fullWidth
              onClick={handlePurchase}
            >
              Complete Purchase
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Order Summary</Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1">
                  {packageDetails?.name} Package
                </Typography>
                <Typography variant="body1">
                  {packageDetails?.coins} coins
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="body1" fontWeight="bold">Total</Typography>
                <Typography variant="body1" fontWeight="bold">
                  ${packageDetails?.price.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PurchaseCoins;
