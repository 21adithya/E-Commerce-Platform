import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient, setStoredToken, getStoredToken } from '../../services/api';
import { ShippingAddress, User } from '../../types/marketplace';

const USER_STORAGE_KEY = 'amazona_auth_user';

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: loadStoredUser(),
  token: getStoredToken(),
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<{ user: User; token: string }>(
        '/auth/login',
        credentials
      );
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Login failed.');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    payload: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await apiClient.post<{ user: User; token: string }>(
        '/auth/register',
        payload
      );
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Registration failed.');
    }
  }
);

export const switchDemoRole = createAsyncThunk(
  'auth/demoSwitch',
  async (role: 'customer' | 'admin', { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<{ user: User; token: string }>(
        '/auth/demo-switch',
        { role }
      );
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Role switch failed.');
    }
  }
);

export const updateShippingAddress = createAsyncThunk(
  'auth/updateAddress',
  async (address: ShippingAddress, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.put<{ user: User }>('/auth/address', address);
      return data.user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to save shipping address.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      setStoredToken(null);
      localStorage.removeItem(USER_STORAGE_KEY);
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handleAuthSuccess = (
      state: AuthState,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.loading = false;
      state.error = null;
      state.user = action.payload.user;
      state.token = action.payload.token;
      setStoredToken(action.payload.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(action.payload.user));
    };

    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, handleAuthSuccess)
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, handleAuthSuccess)
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(switchDemoRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(switchDemoRole.fulfilled, handleAuthSuccess)
      .addCase(switchDemoRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateShippingAddress.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(action.payload));
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
