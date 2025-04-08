// client/src/pages/admin/UserManagement.jsx
import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, InputAdornment, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const UserManagement = () => {
  // Sample data
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'member', status: 'active', joinDate: '2023-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'provider', status: 'active', joinDate: '2023-02-01' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'member', status: 'suspended', joinDate: '2023-01-20' },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'provider', status: 'active', joinDate: '2023-03-10' },
    { id: 5, name: 'David Brown', email: 'david@example.com', role: 'admin', status: 'active', joinDate: '2022-12-05' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>User Management</Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search users..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Join Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={
                      user.role === 'admin' 
                        ? 'secondary' 
                        : user.role === 'provider' 
                          ? 'primary' 
                          : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.status}
                    color={user.status === 'active' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{user.joinDate}</TableCell>
                <TableCell align="center">
                  <Button size="small" sx={{ mr: 1 }}>Edit</Button>
                  <Button size="small" color="error">
                    {user.status === 'active' ? 'Suspend' : 'Activate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserManagement;
