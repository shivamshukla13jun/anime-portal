// src/redux/userLoginSlice.js
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { IRolePermission, Role } from '@/types';
// import apiService from '@/service/apiService'; // Commented out to avoid circular dependency

export interface IUser {
  _id: string;
  email: string;
  name: string;
  role: Role;
}

export interface UserState {
  user: IUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  themeMode?: 'light' | 'dark';
  primaryColor?: string;
  error: string | null;
  permission: IRolePermission[]; // Add permissions field
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  themeMode: 'light',
  primaryColor: '#dd5d2c',
  error: null,
  permission: [],
};

// Async thunk to fetch the current user/session from the API.
export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      // Temporarily commented out to avoid circular dependency
      // const response = await apiService.AuthService.currentUser();
      // Expecting the API to return the user object in response.data
      // return response.data as IUser;
      
      // For now, return null to avoid errors
      return null;
    } catch (err) {
      return rejectWithValue(null);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    setThemeColor: (state, action) => {
      state.primaryColor = action.payload;
    },
    toggleThemeMode: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
    },
    loginSuccess: (state, action: PayloadAction<UserState>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
    },
    logout: (state) => {
      // assign initialState to state
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<IUser | null>) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload as IUser;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, setThemeColor, toggleThemeMode } = userSlice.actions;
export default userSlice.reducer;
