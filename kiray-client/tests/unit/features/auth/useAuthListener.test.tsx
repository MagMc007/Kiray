import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { AuthListenerBootstrap } from '@/features/auth/useAuthListener';
import * as firebaseModule from '@/features/auth/firebase';
import type { User as FirebaseUser } from 'firebase/auth';

describe('useAuthListener', () => {
  let authCallback: ((user: FirebaseUser | null) => void) | null = null;

  beforeEach(() => {
    vi.restoreAllMocks();
    authCallback = null;
    vi.spyOn(firebaseModule, 'subscribeToAuthState').mockImplementation((cb) => {
      authCallback = cb;
      return () => {};
    });
  });

  it('subscribes on mount and cleans up on unmount', () => {
    const unsubscribeMock = vi.fn();
    vi.spyOn(firebaseModule, 'subscribeToAuthState').mockReturnValue(unsubscribeMock);

    const store = makeStore();
    const { unmount } = render(
      <Provider store={store}>
        <AuthListenerBootstrap />
      </Provider>
    );

    expect(firebaseModule.subscribeToAuthState).toHaveBeenCalled();
    unmount();
    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it('sets unauthenticated state when user is null', async () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <AuthListenerBootstrap />
      </Provider>
    );

    if (authCallback) {
      authCallback(null);
    }

    await waitFor(() => {
      const state = store.getState().auth;
      expect(state.status).toBe('unauthenticated');
      expect(state.currentUser).toBeNull();
      expect(state.firebaseUid).toBeNull();
    });
  });

  it('dispatches credentials when Firebase user signs in', async () => {
    const mockFirebaseUser = {
      uid: 'fb_test_123',
      getIdToken: vi.fn().mockResolvedValue('mock_id_token_xyz'),
    } as unknown as FirebaseUser;

    const store = makeStore();
    render(
      <Provider store={store}>
        <AuthListenerBootstrap />
      </Provider>
    );

    if (authCallback) {
      await authCallback(mockFirebaseUser);
    }

    await waitFor(() => {
      const state = store.getState().auth;
      expect(state.firebaseUid).toBe('fb_test_123');
      expect(state.idToken).toBe('mock_id_token_xyz');
      expect(state.status).toBe('authenticated');
    });
  });
});
