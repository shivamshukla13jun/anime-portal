import { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Checkbox, FormControlLabel, Stack, } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { defaultLoginValues, loginSchema } from '@/pages/Auth/Schema/loginSchema';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginFailure, loginStart, loginSuccess } from '@/redux/slices/UserSlice';
import apiService from '@/service/apiService';
import { paths } from '@/utils/paths';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/redux/store';
import { SelectUser } from '@/redux/selectors';
import { useAuth } from '@/hooks/ProtectedRoute/authUtils';
import { useQueryClient } from '@tanstack/react-query';
const Login = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const q=useQueryClient()
  const { loading,error } = useAppSelector(SelectUser);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultLoginValues,
  });
  const onSubmit = async (data: any) => {

   const nextPath=searchParams.get("next")

    try {
      dispatch(loginStart());
      const response = await apiService.AuthService.login(data);
      navigate(nextPath ?nextPath:paths.users);
    } catch (error: any) {
      dispatch(loginFailure(error.message));
    }finally {
      // Any final actions can be performed here
      q.invalidateQueries({queryKey:['fetchUser']})
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        backgroundImage: `url('/banners/login.png')`, // Use the correct path to your background image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          clipPath: 'polygon(0 0, 55% 0, 65% 100%, 0% 100%)'
        }
      }}
    >
      <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '50%', position: 'relative', zIndex: 2, pl: 4 ,textAlign:"center"}}>
          <Box sx={{ mb: 2 }}>
            <Box 
              component="img"
              src={"/logo.png"} // Use the correct path to your logo image
              alt="Logo"
              sx={{ 
                width: 'auto',
                height: '80px',
                mb: 1
              }}
            />
          </Box>
      </Box>
        <Box sx={{ width: '50%', display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ 
            width: '100%', 
            maxWidth: 400,
            bgcolor: 'white',
            borderRadius: 2,
            p: 4,
          }}>
            <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 600, mb: 1 }}>
              Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
              Enter your email and password to access your account
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                placeholder="Email Address *"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message as string}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                placeholder="Password *"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message as string}
                sx={{ mb: 2 }}
              />
              {error && <Box sx={{color:"red"}}>{error}</Box>}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{ 
                        color: '#DF5727',
                        '&.Mui-checked': {
                          color: '#DF5727',
                        },
                      }}
                    />
                  }
                  label="Remember me"
                />
                <Link 
                  to={paths.forgetpassword}
                  style={{ 
                    color: '#DF5727',
                    textDecoration: 'none',
                    fontSize: '0.875rem'
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
                  bgcolor: '#DF5727',
                  '&:hover': {
                    bgcolor: '#c94d22'
                  },
                  mb: 3
                }}
              >
                Access Securely
              </Button>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                {['Terms', 'Privacy', 'Support'].map((item) => (
                  <Link
                    key={item}
                    to="#"
                    style={{ 
                      color: '#666',
                      textDecoration: 'none',
                      fontSize: '0.75rem'
                    }}
                  >
                    {item}
                  </Link>
                ))}
              </Box>
            </form>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
