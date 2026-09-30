'use client';

import { useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import {
  useGetSavedListingsQuery,
  useSaveListingMutation,
  useUnsaveListingMutation,
} from './favoritesApi';
import type { Listing } from '@/types/listing';

export interface UseFavoritesResult {
  savedListings: Listing[];
  savedCount: number;
  isSaved: (listingId: string) => boolean;
  toggleFavorite: (listingId: string) => Promise<boolean>;
  isLoading: boolean;
  isMutating: boolean;
  refetchSaved: () => void;
}

export function useFavorites(): UseFavoritesResult {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const {
    data,
    isLoading: isQueryLoading,
    refetch: refetchSaved,
  } = useGetSavedListingsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [saveListing, { isLoading: isSaving }] = useSaveListingMutation();
  const [unsaveListing, { isLoading: isUnsaving }] = useUnsaveListingMutation();

  const savedListings = useMemo(() => data?.results || data?.data || [], [data]);

  const savedIdsSet = useMemo(() => {
    return new Set(savedListings.map((l) => l._id));
  }, [savedListings]);

  const isSaved = useCallback(
    (listingId: string): boolean => {
      if (!isAuthenticated || !listingId) return false;
      return savedIdsSet.has(listingId);
    },
    [isAuthenticated, savedIdsSet]
  );

  const toggleFavorite = useCallback(
    async (listingId: string): Promise<boolean> => {
      if (!isAuthenticated) {
        const redirectUrl = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : '/login';
        router.push(redirectUrl);
        return false;
      }

      if (!listingId) return false;

      if (savedIdsSet.has(listingId)) {
        await unsaveListing(listingId).unwrap();
        return false;
      } else {
        await saveListing(listingId).unwrap();
        return true;
      }
    },
    [isAuthenticated, pathname, router, savedIdsSet, saveListing, unsaveListing]
  );

  const savedCount = data?.meta?.total ?? savedListings.length;

  return {
    savedListings,
    savedCount,
    isSaved,
    toggleFavorite,
    isLoading: isAuthenticated ? isQueryLoading : false,
    isMutating: isSaving || isUnsaving,
    refetchSaved,
  };
}
