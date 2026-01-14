import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Container, Chip } from '@mui/material';
import { LockOutlined as LockIcon } from '@mui/icons-material';
import { paths } from '@/utils/paths';
import { useAppSelector } from '@/redux/store';
import { CurrentRole } from '@/redux/selectors';

const NotAuthorized: FC = () => {
  const role = useAppSelector(CurrentRole);

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
        <LockIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h3" color="error" sx={{ mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary"  sx={{ mb: 3 }}>
          Sorry, you don't have permission to access this page.
        </Typography>
        {role && (
          <Chip
            label={`Current Role: ${role}`}
            color="default"
            sx={{ mb: 4 }}
          />
        )}
        <Button
          component={Link}
          to={paths.users}
          variant="contained"
          color="primary"
          size="large"
        >
          Back To Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default NotAuthorized;