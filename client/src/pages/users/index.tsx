import React, { useState, useEffect } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton,
  Typography, Chip,
  TablePagination
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Cancel as CancelIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import apiService from '@/service/apiService';
import UserForm from './UserForm';
import { IUser } from '@/types';
import { useQuery } from '@tanstack/react-query';
import VerticalMenu from '@/components/VerticalMenu';
interface IsuerResponse {
  data: IUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}


const Users: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);


const {isPending,data,refetch} = useQuery<IsuerResponse>({
  queryKey: ['users', currentPage, limit],
  queryFn: () => apiService.Users.getUsers({ page: currentPage, limit }),
 
});

  const handleEdit = (user: IUser) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleFormClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };
  
  const handleFormSubmit = async () => {
     refetch();
    handleFormClose();
  };

  const handleToggleActivate = async (user: IUser) => {
    try {
    user?._id &&   await apiService.Users.ActivateUser(user._id, !user.isActive);
      refetch();
    } catch (error) {
      console.warn('Error activating user:', error);
    }
  };


  return (
  <Box className="view-load" sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5"></Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Add User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{fontWeight:'bold'}}>Name</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Email</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Role</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Status</TableCell>
              <TableCell sx={{fontWeight:'bold'}}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data?.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell style={{textTransform: 'capitalize'}}>
                  {user.role}
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? 'Active' : 'In Active'}
                    color={user.isActive ? 'success' : 'error'}
                  />
                </TableCell>
                <TableCell>
                <VerticalMenu 
                  actions={[
                    {
                      label:"Edit",
                      onClick:() => handleEdit(user),
                      icon:<EditIcon/>
                    },
                    {
                      label:`${user.isActive ? 'Deactivate':'Activate'}`,
                      onClick:() => handleToggleActivate(user),
                      icon:user.isActive ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" /> 
                    }
                  ]}/>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data?.pagination?.total || 0}
          page={currentPage - 1}
          onPageChange={(event, newPage) => setCurrentPage(newPage + 1)}
          rowsPerPage={limit}
          rowsPerPageOptions={[10, 25, 50]}
          onRowsPerPageChange={(event) => setLimit(Number(event.target.value))}
        />
      </TableContainer>

      <UserForm
        open={open}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        user={selectedUser}
      />
    </Box>
  );
};

export default Users;