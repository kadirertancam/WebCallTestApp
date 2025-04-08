// client/src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4A6CF7',
      light: '#6E8DF9',
      dark: '#3349D4',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#17C6AA',
      light: '#5AD9C5',
      dark: '#0D9A83',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#28a745',
      light: '#48C664',
      dark: '#1B8A33',
    },
    error: {
      main: '#dc3545',
      light: '#E25865',
      dark: '#B01E2D',
    },
    warning: {
      main: '#FFA500',
      light: '#FFB733',
      dark: '#CC7A00',
    },
    info: {
      main: '#0dcaf0',
      light: '#61DBF5',
      dark: '#0AA2C0',
    },
    background: {
      default: '#F8F9FD',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1D2B4F',
      secondary: '#5E6E8B',
      disabled: '#A2A9BB',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.05)',
    '0px 8px 16px rgba(0, 0, 0, 0.05)',
    '0px 12px 24px rgba(0, 0, 0, 0.05)',
    '0px 16px 32px rgba(0, 0, 0, 0.05)',
    '0px 20px 40px rgba(0, 0, 0, 0.05)',
    // ... add the rest of the shadow levels
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #4A6CF7 0%, #5E7DF9 100%)',
        },
        containedSecondary: {
          background: 'linear-gradient(90deg, #17C6AA 0%, #29D8BC 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default theme;