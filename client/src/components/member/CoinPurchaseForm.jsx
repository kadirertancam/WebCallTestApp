// client/src/components/member/CoinPurchaseForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CoinPurchaseForm = ({ onPurchaseComplete }) => {
  const [coinPackages, setCoinPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch coin packages on component mount
  useEffect(() => {
    const fetchCoinPackages = async () => {
      try {
        const response = await axios.get('/api/coins/packages', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setCoinPackages(response.data);
        if (response.data.length > 0) {
          setSelectedPackage(response.data[0].id);
        }
      } catch (err) {
        setError('Failed to load coin packages');
        console.error(err);
      }
    };
    
    fetchCoinPackages();
  }, []);
  
  // Handle package selection
  const handlePackageSelect = (packageId) => {
    setSelectedPackage(packageId);
  };
  
  // Handle payment method selection
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // In a real app, integrate with payment provider here
      const paymentDetails = {
        // Mock payment details
        method: paymentMethod,
        timestamp: new Date().toISOString()
      };
      
      // Submit purchase request
      const response = await axios.post('/api/coins/purchase', {
        packageId: selectedPackage,
        paymentMethod,
        paymentDetails
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Call completion callback with new balance
      if (onPurchaseComplete) {
        onPurchaseComplete(response.data.newBalance);
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process payment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (coinPackages.length === 0 && !error) {
    return <div className="loading">Loading coin packages...</div>;
  }
  
  return (
    <div className="coin-purchase-form">
      <h2>Purchase Coins</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="packages-selection">
          {coinPackages.map(pkg => (
            <div 
              key={pkg.id} 
              className={`package-card ${selectedPackage === pkg.id ? 'selected' : ''}`}
              onClick={() => handlePackageSelect(pkg.id)}
            >
              <h3>{pkg.name}</h3>
              <div className="coin-amount">{pkg.coins} coins</div>
              <div className="package-price">${pkg.price.toFixed(2)}</div>
              {selectedPackage === pkg.id && <div className="selected-badge">Selected</div>}
            </div>
          ))}
        </div>
        
        <div className="payment-methods">
          <h3>Select Payment Method</h3>
          <div className="payment-options">
            <div className="payment-option">
              <input
                type="radio"
                id="credit_card"
                name="paymentMethod"
                value="credit_card"
                checked={paymentMethod === 'credit_card'}
                onChange={handlePaymentMethodChange}
              />
              <label htmlFor="credit_card">Credit Card</label>
            </div>
            
            <div className="payment-option">
              <input
                type="radio"
                id="paypal"
                name="paymentMethod"
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={handlePaymentMethodChange}
              />
              <label htmlFor="paypal">PayPal</label>
            </div>
            
            <div className="payment-option">
              <input
                type="radio"
                id="crypto"
                name="paymentMethod"
                value="crypto"
                checked={paymentMethod === 'crypto'}
                onChange={handlePaymentMethodChange}
              />
              <label htmlFor="crypto">Cryptocurrency</label>
            </div>
          </div>
        </div>
        
        <button type="submit" className="submit-button" disabled={loading || !selectedPackage}>
          {loading ? 'Processing...' : 'Purchase Coins'}
        </button>
      </form>
    </div>
  );
};

export default CoinPurchaseForm;