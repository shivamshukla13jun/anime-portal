import { Link } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { SearchOff as SearchOffIcon } from '@mui/icons-material';
import { paths } from '@/utils/paths';

const NotFound = () => {
  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center'
        }}
      >
        <SearchOffIcon sx={{ fontSize: 100, color: 'primary.main', mb: 2 }} />
        <Typography variant="h1" color='primary' sx={{ mb: 2 }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you are looking for doesn't exist or has been moved.
        </Typography>
        {/* or Dashboard */}
       <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <Button
          component={Link}
          to={paths.dashboard}
          variant="contained"
          color="primary"
          // size="large"
        >
          Go to Dashboard
        </Button>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 0 }}>
          or
        </Typography>
        {/* or Login */}
        <Button
          component={Link}
          to={paths.login}
          variant="contained"
          color="primary"
          // size="large"
        >
          Login
        </Button>
        </Box>
           </Box>
    </Container>
  );
};

export default NotFound;