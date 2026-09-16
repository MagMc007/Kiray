import type { User } from './user';
import type { Comment } from './comment';

export type PropertyType =
  | 'apartment'
  | 'house'
  | 'studio'
  | 'room'
  | 'villa'
  | 'condo'
  | 'other';

export type Amenity =
  | 'wifi'
  | 'parking'
  | 'ac'
  | 'heating'
  | 'furnished'
  | 'unfurnished'
  | 'washer'
  | 'dryer'
  | 'balcony'
  | 'garden'
  | 'pool'
  | 'gym'
  | 'pet_friendly'
  | 'security'
  | 'elevator'
  | 'water_included'
  | 'electricity_included'
  | 'gas_included'
  | 'backup_generator';

export interface ListingImage {
  url: string;
  publicId: string;
  order: number;
  originalName?: string;
}

export interface ListingLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface ListingAddress {
  street: string;
  city: string;
  neighborhood?: string;
  postalCode?: string;
}

export type ListingStatus = 'open' | 'rented' | 'unavailable';

export interface Listing {
  _id: string;
  ownerId: string | User;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  area?: number;
  areaUnit: 'sqm' | 'sqft';
  amenities: Amenity[];
  location: ListingLocation;
  address: ListingAddress;
  images: ListingImage[];
  status: ListingStatus;
  availableFrom?: string | null;
  availableUntil?: string | null;
  viewCount: number;
  saveCount: number;
  contactClickCount: number;
  averageRating: number;
  totalComments: number;
  isFlagged?: boolean;
  flagReason?: string | null;
  flagCount?: number;
  deactivationReason?: string | null;
  deactivationMessage?: string | null;
  isVerified?: boolean;
  isFeatured?: boolean;
  deactivatedByAdmin?: boolean;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PopulatedListing extends Omit<Listing, 'ownerId'> {
  ownerId: User;
  comments?: Comment[];
}

export interface FilterState {
  keyword: string;
  city: string;
  neighborhood: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: string; // 'all' | '1' | '2' | '3' | '4+'
  bedrooms_min?: number;
  bedrooms_max?: number;
  bathrooms: string; // 'all' | '1' | '2' | '3+'
  minArea: number;
  maxArea: number;
  radiusKm: number;
  status: 'all' | 'open' | 'rented' | 'unavailable';
  amenities: Amenity[];
  sortBy: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular';
  onlySaved?: boolean;
}

export interface ListingSearchParams {
  q?: string;
  city?: string;
  neighborhood?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bedrooms_min?: number;
  bedrooms_max?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  amenities?: string; // Comma-separated
  status?: ListingStatus;
  sort?: string;
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
  radius?: number; // In meters for API
}

export interface PaginatedListings {
  results: Listing[];
  data: Listing[];
  meta: import('./api').PaginatedMeta;
}

