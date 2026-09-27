import { useGetMyListingsQuery } from '@/features/users/userApi';

export const MAX_LANDLORD_LISTINGS = 10;

export interface LandlordListingLimitInfo {
  totalListings: number;
  isLimitReached: boolean;
  remainingListings: number;
  maxLimit: number;
  isLoading: boolean;
}

export function useLandlordListingLimit(): LandlordListingLimitInfo {
  const { data, isLoading } = useGetMyListingsQuery();

  const totalListings = data?.meta?.total ?? data?.results?.length ?? 0;
  const isLimitReached = totalListings >= MAX_LANDLORD_LISTINGS;
  const remainingListings = Math.max(0, MAX_LANDLORD_LISTINGS - totalListings);

  return {
    totalListings,
    isLimitReached,
    remainingListings,
    maxLimit: MAX_LANDLORD_LISTINGS,
    isLoading,
  };
}
