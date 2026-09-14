import type { Listing } from './listing';

export interface Favorite {
  _id: string;
  userId: string;
  listingId: string | Listing;
  createdAt: string;
  updatedAt?: string;
}
