// client/src/pages/member/BrowseServices.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// At the top of client/src/pages/member/BrowseServices.jsx, add Avatar to imports:
import { 
    Box, Typography, Grid, Card, CardContent, CardMedia, CardActions, 
    Button, TextField, InputAdornment, IconButton, Chip, FormControl,
    InputLabel, Select, MenuItem, Pagination, Slider, Paper, Divider,
    CircularProgress, Alert, Avatar
  } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { serviceAdService } from '../../services/api';

const BrowseServices = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // State
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(queryParams.get('query') || '');
  const [selectedCategory, setSelectedCategory] = useState(queryParams.get('category') || '');
  const [priceRange, setPriceRange] = useState([
    queryParams.get('minRate') || 0,
    queryParams.get('maxRate') || 500
  ]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(parseInt(queryParams.get('page')) || 1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch services
  useEffect(() => {
    fetchServices();
  }, [currentPage, selectedCategory, priceRange]);
  
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
      
      const response = await serviceAdService.searchServices(params);
      
      setServices(response.data.data);
      setCategories(response.data.categories);
      setTotalPages(response.data.pages);
      
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
      setError('Failed to load services: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page
    fetchServices();
  };
  
  // Handle category change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1); // Reset to first page
  };
  
  // Handle price range change
  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };
  
  // Handle pagination
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo(0, 0);
  };
  
  // Navigate to service detail
  const viewServiceDetail = (serviceId) => {
    navigate(`/member/services/${serviceId}`);
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Browse Services</Typography>
      
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
              <IconButton 
                onClick={() => setShowFilters(!showFilters)}
                color={showFilters ? "primary" : "default"}
              >
                <FilterListIcon />
              </IconButton>
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
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={`https://source.unsplash.com/random/300x140?${service.categories[0]}&sig=${service._id}`}
                    alt={service.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {service.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar
                        src={service.provider.profile?.profileImage || '/assets/images/default-avatar.png'}
                        sx={{ width: 24, height: 24, mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {service.provider.profile?.firstName} {service.provider.profile?.lastName}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {service.description.substring(0, 100)}
                      {service.description.length > 100 ? '...' : ''}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <StarIcon sx={{ color: 'gold', mr: 0.5, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                        4.8 (24)
                      </Typography>
                      <AccessTimeIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        1h call
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {service.categories.map((category) => (
                        <Chip 
                          key={category} 
                          label={category} 
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    
                    <Typography variant="h6" color="primary">
                      {service.hourlyRate} coins / hour
                    </Typography>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => viewServiceDetail(service._id)}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="small" 
                      variant="contained"
                      onClick={() => navigate(`/member/call/${service._id}`)}
                    >
                      Start Call
                    </Button>
                  </CardActions>
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
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default BrowseServices;