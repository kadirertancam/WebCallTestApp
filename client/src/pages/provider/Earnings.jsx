// client/src/pages/provider/Earnings.jsx
import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, Grid } from '@mui/material';

const Earnings = () => {
  // Sample data
  const transactions = [
    { id: 1, date: '2023-04-05', type: 'Call Earnings', service: 'Business Consulting', client: 'John Doe', amount: 75 },
    { id: 2, date: '2023-04-01', type: 'Call Earnings', service: 'Business Consulting', client: 'Sarah Smith', amount: 60 },
    { id: 3, date: '2023-03-28', type: 'Call Earnings', service: 'Business Consulting', client: 'David Johnson', amount: 100 },
    { id: 4, date: '2023-03-25', type: 'Withdrawal', service: '-', client: '-', amount: -200 },
    { id: 5, date: '2023-03-20', type: 'Call Earnings', service: 'Business Consulting', client: 'Michael Brown', amount: 25 },
  ];

  // Calculate total earnings
  const totalEarnings = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Earnings</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Current Balance
              </Typography>
              <Typography variant="h4" component="div">
                {totalEarnings} coins
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Typography variant="h5" gutterBottom>Transaction History</Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Client</TableCell>
              <TableCell align="right">Amount (coins)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>{transaction.service}</TableCell>
                <TableCell>{transaction.client}</TableCell>
                <TableCell align="right" sx={{ 
                  color: transaction.amount >= 0 ? 'success.main' : 'error.main',
                  fontWeight: 'bold'
                }}>
                  {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Earnings;