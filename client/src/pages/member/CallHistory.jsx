// client/src/pages/member/CallHistory.jsx
import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

const CallHistory = () => {
  // Sample data
  const calls = [
    { id: 1, provider: 'John Smith', service: 'Business Consulting', duration: 45, date: '2023-04-05', time: '14:30', cost: 75, status: 'completed' },
    { id: 2, provider: 'Sarah Johnson', service: 'Legal Advice', duration: 30, date: '2023-04-01', time: '10:15', cost: 60, status: 'completed' },
    { id: 3, provider: 'Michael Brown', service: 'Financial Planning', duration: 60, date: '2023-03-28', time: '16:00', cost: 100, status: 'completed' },
    { id: 4, provider: 'Emma Wilson', service: 'Marketing Strategy', duration: 20, date: '2023-03-25', time: '11:45', cost: 40, status: 'completed' },
    { id: 5, provider: 'Robert Lee', service: 'Tech Support', duration: 15, date: '2023-03-20', time: '09:30', cost: 25, status: 'missed' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Call History</Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Service</TableCell>
              <TableCell align="right">Duration</TableCell>
              <TableCell align="right">Cost</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {calls.map((call) => (
              <TableRow key={call.id}>
                <TableCell>{call.date} {call.time}</TableCell>
                <TableCell>{call.provider}</TableCell>
                <TableCell>{call.service}</TableCell>
                <TableCell align="right">{call.duration} min</TableCell>
                <TableCell align="right">{call.cost} coins</TableCell>
                <TableCell>
                  <Chip 
                    label={call.status} 
                    color={call.status === 'completed' ? 'success' : 'error'} 
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small">
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CallHistory;