// client/src/pages/member/BrowseServices.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, Typography, Grid, Card, CardContent, CardMedia, 
  Button, TextField, InputAdornment, Chip, FormControl,
  InputLabel, Select, MenuItem, Pagination, Slider, Paper, 
  CircularProgress, Alert, Avatar, Rating, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { serviceAdService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const BrowseServices = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  
  // State
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(queryParams.get('query') || '');
  const [selectedCategory, setSelectedCategory] = useState(queryParams.get('category') || '');
  const [priceRange, setPriceRange] = useState([
    parseInt(queryParams.get('minRate') || '0'),
    parseInt(queryParams.get('maxRate') || '500')
  ]);
  const [categories, setCategories] = useState([
    'Business Consulting', 'Legal Advice', 'Financial Planning',
    'Career Coaching', 'Life Coaching', 'Technology Support',
    'Marketing Strategy', 'Health & Wellness', 'Academic Tutoring'
  ]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(parseInt(queryParams.get('page')) || 1);
  const [showFilters, setShowFilters] = useState(false);
  
  const fetchServices = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: 12
      };
      
      if (searchQuery) params.query = searchQuery;
      if (selectedCategory) params.category = selectedCategory;
      if (priceRange[0] > 0) params.minRate = priceRange[0];
      if (priceRange[1] < 500) params.maxRate = priceRange[1];
      
      // Temporary mock data (replace with actual API call in production)
      // In a real implementation: const response = await serviceAdService.searchServices(params);
      setTimeout(() => {
        const mockServices = Array(12).fill(null).map((_, i) => ({
          _id: `service_${i}`,
          title: `Professional Service ${i + 1}`,
          description: 'This is a professional service offering expert advice and consultation.',
          hourlyRate: Math.floor(Math.random() * 100) + 20,
          categories: [categories[Math.floor(Math.random() * categories.length)]],
          provider: {
            _id: `provider_${i}`,
            profile: {
              firstName: `Provider ${i}`,
              lastName: 'Expert',
              profileImage: null
            },
            isVerified: Math.random() > 0.3
          }
        }));
        
        setServices(mockServices);
        setTotalPages(3); // Mock pagination
        setLoading(false);
      }, 1000);
      
      // Update URL with query parameters
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.set('query', searchQuery);
      if (selectedCategory) queryParams.set('category', selectedCategory);
      if (priceRange[0] > 0) queryParams.set('minRate', priceRange[0]);
      if (priceRange[1] < 500) queryParams.set('maxRate', priceRange[1]);
      queryParams.set('page', currentPage);
      
      navigate({
        pathname: location.pathname,
        search: queryParams.toString()
      }, { replace: true });
    } catch (err) {
      setError('Failed to load services: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchServices();
  }, [currentPage, selectedCategory, priceRange]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchServices();
  };
  
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };
  
  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };
  
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo(0, 0);
  };
  
  const calculateCallCost = (hourlyRate, minutes) => {
    return Math.ceil(hourlyRate * (minutes/60));
  };
  
  const initiateCall = (serviceId) => {
    navigate(`/member/call/${serviceId}`);
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Browse Expert Services</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search for services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button type="submit" variant="contained">
                        Search
                      </Button>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={10} md={5}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={2} md={1}>
              <Button
                variant={showFilters ? "contained" : "outlined"}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ minWidth: 0, p: 1 }}
              >
                <FilterListIcon />
              </Button>
            </Grid>
          </Grid>
          
          {showFilters && (
            <Box sx={{ mt: 3 }}>
              <Typography gutterBottom>Price Range (coins per hour)</Typography>
              <Slider
                value={priceRange}
                onChange={handlePriceRangeChange}
                valueLabelDisplay="auto"
                min={0}
                max={500}
                step={10}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">{priceRange[0]} coins</Typography>
                <Typography variant="body2">{priceRange[1]} coins</Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : services.length === 0 ? (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No services found matching your criteria
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }}
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setPriceRange([0, 500]);
              setCurrentPage(1);
            }}
          >
            Clear Filters
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {services.map((service) => (
              <Grid item key={service._id} xs={12} sm={6} md={4}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: '0.3s',
                  '&:hover': {
                    boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)',
                    transform: 'translateY(-4px)'
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={`https://source.unsplash.com/random/300x140?${service.categories?.[0]}&sig=${service._id}`}
                    alt={service.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography gutterBottom variant="h6" component="div" noWrap>
                        {service.title}
                      </Typography>
                      {service.provider.isVerified && (
                        <Chip 
                          label="Verified" 
                          size="small" 
                          color="primary" 
                        />
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar
                        src={service.provider.profile?.profileImage || '/assets/images/default-avatar.png'}
                        sx={{ width: 24, height: 24, mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {service.provider.profile?.firstName} {service.provider.profile?.lastName}
                      </Typography>
                    </Box>
                    
                    <Rating 
                      value={4.5} 
                      precision={0.5} 
                      size="small" 
                      readOnly 
                      sx={{ mb: 1 }}
                    />
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 60, overflow: 'hidden' }}>
                      {service.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {service.categories?.map((category) => (
                        <Chip 
                          key={category} 
                          label={category} 
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {service.hourlyRate} coins/hour
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon sx={{ color: 'text.secondary', fontSize: 16, mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          15 min: {calculateCallCost(service.hourlyRate, 15)} coins
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  <Divider />
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                      size="small" 
                      onClick={() => navigate(`/member/services/${service._id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="small" 
                      variant="contained"
                      onClick={() => initiateCall(service._id)}
                    >
                      Start Call
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={totalPages} 
              page={currentPage} 
              onChange={handlePageChange} 
              color="primary"
              siblingCount={1}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default BrowseServices;