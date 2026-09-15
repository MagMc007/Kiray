'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials, setCurrentUser, setStatus, logout } from './authSlice';
import { authApi } from './authApi';
import { baseApi } from '@/store/baseApi';
import { subscribeToAuthState, getCurrentIdToken } from './firebase';

/**
 * useAuthListener listens to Firebase onAuthStateChanged and synchronizes
 * the authenticated session with the Redux store and the Kiray backend.
 */
export function useAuthListener() {
  const dispatch = useAppDispatch();
  const isMountedRef = useRef(false);

  useEffect(() => {
    dispatch(setStatus('loading'));

    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          dispatch(
            setCredentials({
              firebaseUid: firebaseUser.uid,
              idToken,
            })
          );

          // Fetch current user from backend via RTK Query
          const resultAction = await dispatch(
            authApi.endpoints.getMe.initiate(undefined, {
              subscribe: false,
              forceRefetch: true,
            })
          );

          if (resultAction.data) {
            dispatch(setCurrentUser(resultAction.data));
          }
        } catch (err) {
          console.error('Error syncing auth state with backend:', err);
        } finally {
          dispatch(setStatus('authenticated'));
        }
      } else {
        dispatch(logout());
        dispatch(baseApi.util.resetApiState());
        dispatch(setStatus('unauthenticated'));
      }
    });

    isMountedRef.current = true;
    return () => {
      unsubscribe();
    };
  }, [dispatch]);
}

/**
 * AuthListenerBootstrap is a lightweight client component mounted in Providers
 * to activate the auth lifecycle on the client side.
 */
export function AuthListenerBootstrap() {
  useAuthListener();
  return null;
}
