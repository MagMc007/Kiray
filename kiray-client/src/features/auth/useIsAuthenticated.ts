'use client';

import { useContext, useState, useEffect } from 'react';
import { ReactReduxContext } from 'react-redux';

/**
 * Safely resolves authentication status from Redux store if available,
 * or from an optional explicit prop. Never throws even if called outside a Redux Provider.
 */
export function useIsAuthenticated(explicitProp?: boolean): boolean {
  const reduxContext = useContext(ReactReduxContext);

  const [isAuth, setIsAuth] = useState<boolean>(() => {
    if (explicitProp !== undefined) return explicitProp;
    if (!reduxContext?.store) return false;
    try {
      const state = reduxContext.store.getState() as any;
      return state?.auth?.status === 'authenticated';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (explicitProp !== undefined) {
      setIsAuth(explicitProp);
      return;
    }
    if (!reduxContext?.store) return;

    const update = () => {
      try {
        const state = reduxContext.store.getState() as any;
        setIsAuth(state?.auth?.status === 'authenticated');
      } catch {
        setIsAuth(false);
      }
    };

    update();
    return reduxContext.store.subscribe(update);
  }, [explicitProp, reduxContext]);

  return explicitProp !== undefined ? explicitProp : isAuth;
}
