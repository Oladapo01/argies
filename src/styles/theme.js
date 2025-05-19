const theme = {
  colors: {
    primary: 'rgb(227, 151, 199)', // Pink
    secondary: '#f8f9fa', // Light gray
    accent: '#e84c88', // Darker pink
    text: '#333',
    lightText: '#6c757d',
    white: '#ffffff',
    black: '#000000',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    large: '1200px',
    xlarge: '1440px',
  },
  fonts: {
    primary: '"Poppins", sans-serif',
    secondary: '"Playfair Display", serif',
  },
  shadows: {
    small: '0 2px 4px rgba(0,0,0,0.1)',
    medium: '0 4px 6px rgba(0,0,0,0.1)',
    large: '0 10px 15px rgba(0,0,0,0.1)',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    full: '9999px',
  },
  transitions: {
    default: 'all 0.3s ease-in-out',
    fast: 'all 0.15s ease-in-out',
    slow: 'all 0.5s ease-in-out',
  },
};

export default theme;