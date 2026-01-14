import React, { useEffect, useState } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import apiService from '@/service/apiService';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel,
  Select, MenuItem, Box, FormHelperText,
  InputAdornment,
  IconButton,
  OutlinedInput, Chip, Typography, Grid, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Checkbox
} from '@mui/material';
import {Visibility,VisibilityOff} from '@mui/icons-material';
import getAssignableRoles from '@/utils/getAvailableRoles';
import {  Userschema, defaulUsertValues } from '@/pages/users/Schema/userSchema';
import {  IUser, Role } from '@/types';
import { toast } from 'react-toastify';
import { paths } from '@/utils/paths';
import { useAppSelector } from '@/redux/store';
import { isRole } from '@/utils';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { CurrentUser } from '@/redux/selectors';


interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  user?: IUser | null
}

const UserForm: React.FC<UserFormProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  user 
}) => {
  const currentUser = useAppSelector(CurrentUser);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState({
    password: false,
    repeatPassword: false
  });

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset,
    watch,
    setValue,
    control
  } = useForm<IUser>({
    resolver: zodResolver(Userschema) as Resolver<IUser>,
    defaultValues: defaulUsertValues
  });

  const mutation = useMutation({
    mutationFn: (data: IUser) => {
      if (user?._id) {
        return apiService.Users.updateUser(user._id, data);
      }
      return apiService.Users.createUser(data);
    },
    onSuccess: () => {
      toast.info(user?._id ? 'User updated successfully' : 'User created successfully');
      onSubmit();
      reset();
      navigate(paths.users);
    },
    onError: (error: any) => {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
    },
  });

  const { data: users = [] } = useQuery<IUser[]>({ 
    queryKey: ['users', ], 
    queryFn: async () => {
      const response = await apiService.Users.getUsers({ page: 1, limit: 100,});
      return response.data;
    } 
  });

 
  const togglePasswordVisibility = (field: 'password' | 'repeatPassword') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const availableRoles = getAssignableRoles();

  const onSubmitForm = async (data: IUser) => {
    if (isRole.isSuperAdmin(currentUser?.role as Role)) {
      data.role ="admin"
    }
    mutation.mutate(data);
  };

  useEffect(() => {
    if (open) {
      const initialValues = user ? { ...defaulUsertValues, ...user,isUpdate:true } : { ...defaulUsertValues,isUpdate:false };
      reset(initialValues);
    }
  }, [user, open, reset]);

 


  const handleClose = () => {
    reset();
    onClose();
  };
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{user?._id ? 'Edit User' : 'Add New User'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmitForm)} noValidate>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Name"
              fullWidth
              required
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            
            <TextField
              label="Password"
              type={showPassword.password ? 'text' : 'password'}
              fullWidth
               autoComplete="new-password"
              required={!user?._id}
              {...register('password')}
               InputProps={{
                    sx: { borderRadius: 1.5 },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('password')}
                          edge="end"
                        >
                          {showPassword.password ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
              error={!!errors.password}
              helperText={errors.password?.message || (user?._id ? "Leave blank to keep current password" : "")}
            />
            
            <TextField
              label="Repeat Password"
              type={showPassword.repeatPassword ? 'text' : 'password'}
              fullWidth
              InputProps={{
                sx: { borderRadius: 1.5 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('repeatPassword')}
                      edge="end"
                    >
                      {showPassword.repeatPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              required={!user?._id}
              {...register('repeatPassword')}
              error={!!errors.repeatPassword}
              helperText={errors.repeatPassword?.message || (user?._id ? "Leave blank to keep current password" : "")}
            />
            {
              !isRole.isSuperAdmin(currentUser?.role as Role) && (
                <FormControl fullWidth error={!!errors.role}>
              <InputLabel>Role *</InputLabel>
              <Select
                label="Role *"
                required
                defaultValue={user?.role || ''}
                {...register('role')}
                style={{ textTransform: "capitalize" }}
              >
                {availableRoles.map((role) => (
                  <MenuItem 
                    key={role} 
                    value={role}
                    style={{ textTransform: "capitalize" }}
                  >
                    {role}
                  </MenuItem>
                ))}
              </Select>
              {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
            </FormControl>
              
              )
            }
           
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving...' : user?._id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};


export default UserForm;