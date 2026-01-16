import { useState } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Checkbox, 
  FormControlLabel, 
  Stack,
  Paper,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { defaultLoginValues, loginSchema } from './loginSchema';

const Login = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultLoginValues,
  });

  const onSubmit = async (data: any) => {
    const nextPath = searchParams.get("next");

    try {
      setError(null);
      setLoading(true);
      
      const success = await login(data.email, data.password);
      
      if (success) {
        navigate(nextPath || '/');
      } else {
        setError('Invalid email or password');
      }
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('/anime-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#141414',
      }}
    >
      <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
        {/* Left Side - Branding */}
        <Box sx={{ width: { xs: '0%', md: '50%' }, position: 'relative', zIndex: 2, pl: 4, display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h2"
              sx={{
                color: '#e50914',
                fontWeight: 'bold',
                mb: 2,
                fontSize: '3.5rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              ANIME STREAM
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'white',
                mb: 2,
                fontWeight: 300,
              }}
            >
              Your Gateway to Anime & Manga
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#b3b3b3',
                maxWidth: '400px',
                lineHeight: 1.6,
              }}
            >
              Stream thousands of anime episodes and manga chapters. 
              Create AI-generated content, manage playlists, and more.
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            {['Trending', 'New Releases', 'Popular'].map((item) => (
              <Box
                key={item}
                sx={{
                  backgroundColor: 'rgba(229, 9, 20, 0.2)',
                  border: '1px solid #e50914',
                  borderRadius: 1,
                  px: 2,
                  py: 1,
                }}
              >
                <Typography variant="body2" sx={{ color: '#e50914', fontWeight: 'bold' }}>
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right Side - Login Form */}
        <Box sx={{ width: { xs: '100%', md: '50%' }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Paper
            elevation={24}
            sx={{
              width: '100%',
              maxWidth: 450,
              backgroundColor: 'rgba(20, 20, 20, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              p: 4,
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 1,
                }}
              >
                Sign In
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#b3b3b3',
                }}
              >
                Access your anime streaming dashboard
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="Email Address"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message as string}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#e50914',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#b3b3b3',
                    '&.Mui-focused': {
                      color: '#e50914',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                  },
                }}
              />
              
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message as string}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#e50914',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#b3b3b3',
                    '&.Mui-focused': {
                      color: '#e50914',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#b3b3b3' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{ 
                        color: '#b3b3b3',
                        '&.Mui-checked': {
                          color: '#e50914',
                        },
                      }}
                    />
                  }
                  label="Remember me"
                  sx={{ color: '#b3b3b3' }}
                />
                <Link 
                  to="/forgot-password"
                  style={{ 
                    color: '#e50914',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  backgroundColor: '#e50914',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  '&:hover': {
                    backgroundColor: '#f40612',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(229, 9, 20, 0.5)',
                  },
                  mb: 3,
                }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 1 }}>
                  Don't have an account?
                </Typography>
                <Link
                  to="/register"
                  style={{
                    color: '#e50914',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                  }}
                >
                  Sign up now
                </Link>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                {['Terms', 'Privacy', 'Support'].map((item) => (
                  <Link
                    key={item}
                    to="#"
                    style={{ 
                      color: '#666',
                      textDecoration: 'none',
                      fontSize: '0.75rem',
                    }}
                  >
                    {item}
                  </Link>
                ))}
              </Box>
            </form>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
