// client/src/components/user/CreateAdForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateAdForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hourlyRate: '',
    serviceDetails: '',
    categories: [],
    availability: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Category options
  const categoryOptions = [
    'Consulting', 'Tutoring', 'Coaching', 'Technology', 
    'Business', 'Design', 'Marketing', 'Health', 'Other'
  ];
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle category selection
  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      categories: checked
        ? [...prev.categories, value]
        : prev.categories.filter(cat => cat !== value)
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validate form
      if (!formData.title || !formData.description || !formData.hourlyRate || !formData.serviceDetails) {
        throw new Error('Please fill in all required fields');
      }
      
      if (formData.categories.length === 0) {
        throw new Error('Please select at least one category');
      }
      
      // Submit form
      const response = await axios.post('/api/services', formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Redirect to service provider dashboard
      navigate('/user/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="create-ad-form">
      <h2>Create New Service Advertisement</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="hourlyRate">Hourly Rate (in coins) *</label>
          <input
            type="number"
            id="hourlyRate"
            name="hourlyRate"
            value={formData.hourlyRate}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="serviceDetails">Service Details *</label>
          <textarea
            id="serviceDetails"
            name="serviceDetails"
            value={formData.serviceDetails}
            onChange={handleChange}
            rows="4"
            placeholder="Describe what clients can expect during the call"
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label>Categories *</label>
          <div className="categories-checkboxes">
            {categoryOptions.map(category => (
              <div key={category} className="category-option">
                <input
                  type="checkbox"
                  id={`category-${category}`}
                  name="categories"
                  value={category}
                  checked={formData.categories.includes(category)}
                  onChange={handleCategoryChange}
                />
                <label htmlFor={`category-${category}`}>{category}</label>
              </div>
            ))}
          </div>
        </div>
        
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Creating...' : 'Create Service Ad'}
        </button>
      </form>
    </div>
  );
};

export default CreateAdForm;