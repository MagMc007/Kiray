import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/user';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  firebaseUid: string | null;
  currentUser: User | null;
  idToken: string | null;
  status: AuthStatus;
  error: string | null;
}

const initialState: AuthState = {
  firebaseUid: null,
  currentUser: null,
  idToken: null,
  status: 'idle',
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        firebaseUid: string;
        idToken: string;
      }>
    ) => {
      state.firebaseUid = action.payload.firebaseUid;
      state.idToken = action.payload.idToken;
      state.status = 'authenticated';
      state.error = null;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    setStatus: (state, action: PayloadAction<AuthStatus>) => {
      state.status = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) {
        state.status = 'unauthenticated';
      }
    },
    logout: (state) => {
      state.firebaseUid = null;
      state.currentUser = null;
      state.idToken = null;
      state.status = 'unauthenticated';
      state.error = null;
    },
    resetAuth: () => initialState,
  },
});

export const {
  setCredentials,
  setCurrentUser,
  setStatus,
  setError,
  logout,
  resetAuth,
} = authSlice.actions;

export default authSlice.reducer;
