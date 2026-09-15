import { describe, it, expect } from 'vitest';
import authReducer, {
  setCredentials,
  setCurrentUser,
  setStatus,
  setError,
  logout,
  resetAuth,
  type AuthState,
} from '@/features/auth/authSlice';
import type { User } from '@/types/user';

const mockUser: User = {
  _id: 'user_123',
  firebaseUid: 'fb_123',
  role: 'rentee',
  status: 'active',
  displayName: 'Abebe Kebede',
  email: 'abebe@example.com',
  profileCompleted: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('authSlice', () => {
  const initialState: AuthState = {
    firebaseUid: null,
    currentUser: null,
    idToken: null,
    status: 'idle',
    error: null,
  };

  it('returns initial state on default action', () => {
    expect(authReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('handles setCredentials', () => {
    const nextState = authReducer(
      initialState,
      setCredentials({ firebaseUid: 'fb_123', idToken: 'token_abc' })
    );

    expect(nextState.firebaseUid).toBe('fb_123');
    expect(nextState.idToken).toBe('token_abc');
    expect(nextState.status).toBe('authenticated');
    expect(nextState.error).toBeNull();
  });

  it('handles setCurrentUser', () => {
    const nextState = authReducer(initialState, setCurrentUser(mockUser));
    expect(nextState.currentUser).toEqual(mockUser);
  });

  it('handles setStatus', () => {
    const nextState = authReducer(initialState, setStatus('loading'));
    expect(nextState.status).toBe('loading');
  });

  it('handles setError and flips status to unauthenticated', () => {
    const nextState = authReducer(initialState, setError('Invalid credentials'));
    expect(nextState.error).toBe('Invalid credentials');
    expect(nextState.status).toBe('unauthenticated');
  });

  it('handles logout by clearing tokens and resetting user', () => {
    const authenticatedState: AuthState = {
      firebaseUid: 'fb_123',
      currentUser: mockUser,
      idToken: 'token_abc',
      status: 'authenticated',
      error: null,
    };

    const nextState = authReducer(authenticatedState, logout());
    expect(nextState.firebaseUid).toBeNull();
    expect(nextState.currentUser).toBeNull();
    expect(nextState.idToken).toBeNull();
    expect(nextState.status).toBe('unauthenticated');
  });

  it('handles resetAuth back to initial state', () => {
    const modifiedState: AuthState = {
      firebaseUid: 'fb_123',
      currentUser: mockUser,
      idToken: 'token_abc',
      status: 'authenticated',
      error: 'some error',
    };

    const nextState = authReducer(modifiedState, resetAuth());
    expect(nextState).toEqual(initialState);
  });
});
