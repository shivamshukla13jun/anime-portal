import apiService from "@/service/apiService";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginSuccess, logout } from "../slices/UserSlice";
export const UserLogout = createAsyncThunk(
  'user/logout',
  async (_, {dispatch, rejectWithValue }) => {
    try {
      await apiService.AuthService.logout();
      dispatch(logout()); // Dispatch the logout action to clear user state
      // Optionally, you can also clear any other related state or perform additional cleanup here
      return true; // Indicate successful logout
    } catch (error) {
      return rejectWithValue(error);
    }
} 
);

