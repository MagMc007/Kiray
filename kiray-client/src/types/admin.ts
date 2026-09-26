import type { User, UserRole, UserStatus } from './user';
import type { Listing, ListingStatus, PopulatedListing, PropertyType } from './listing';
import type { Report } from './report';
import type { AuditLog } from './auditLog';
import type { PaginatedMeta } from './api';

export interface AdminUserMetrics {
  total: number;
  active: number;
  suspended: number;
  banned: number;
  byRole: {
    landlord: number;
    rentee: number;
    admin: number;
  };
}

export interface AdminListingPropertyTypeMetric {
  propertyType: string;
  count: number;
  active: number;
}

export interface AdminListingMetrics {
  total: number;
  active: number;
  flagged: number;
  byPropertyType?: AdminListingPropertyTypeMetric[];
}

export interface AdminReportMetrics {
  pending: number;
}

export interface AdminDashboardMetrics {
  users: AdminUserMetrics;
  listings: AdminListingMetrics;
  reports: AdminReportMetrics;
}

export type ActivityAnalyticsPeriod = '24h' | '7d' | '30d' | '90d' | '6m' | '1y';

export interface ActivityDataPoint {
  date: string;
  count: number;
}

export interface UserSignupDataPoint extends ActivityDataPoint {
  landlords?: number;
  seekers?: number;
  rentees?: number;
}

export interface ActivityAnalytics {
  period: ActivityAnalyticsPeriod;
  startDate: string;
  endDate: string;
  userSignups: UserSignupDataPoint[];
  listingCreations: ActivityDataPoint[];
}

export interface AdminUserListParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: UserStatus;
  isDeleted?: boolean;
  search?: string;
  q?: string;
  sort?: 'newest' | 'oldest' | 'displayName_asc' | 'displayName_desc';
}

export interface AdminUserDetailStats {
  totalListings: number;
  activeListings: number;
  deletedListings: number;
  reportsSubmitted: number;
}

export interface AdminUserDetail {
  user: User;
  stats: AdminUserDetailStats;
}

export interface AdminPaginatedUsers {
  users: User[];
  meta: PaginatedMeta;
}

export interface AdminUserExportData {
  exportDate: string | Date;
  user: User;
  listings: Listing[];
  reportsSubmitted: Report[];
  auditHistory: AuditLog[];
}

export interface UpdateUserStatusPayload {
  id: string;
  status: UserStatus;
  reason?: string;
}

export interface UpdateUserRolePayload {
  id: string;
  role: UserRole;
}

export interface AdminListingListParams {
  page?: number;
  limit?: number;
  status?: ListingStatus;
  propertyType?: PropertyType;
  isFlagged?: boolean;
  isVerified?: boolean;
  isFeatured?: boolean;
  isDeleted?: boolean;
  search?: string;
  q?: string;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
}

export interface AdminPaginatedListings {
  listings: PopulatedListing[];
  meta: PaginatedMeta;
}

export interface AdminListingReportItem {
  _id: string;
  listingId: string;
  reporterId?: { _id: string; displayName?: string; email?: string } | string;
  reason: string;
  details?: string;
  status: string;
  createdAt: string;
}

export interface AdminListingDetail {
  listing: PopulatedListing;
  reports: AdminListingReportItem[];
}

export interface AdminListingOverridePayload {
  id: string;
  body: Partial<Listing>;
}

export interface AdminListingStatusPayload {
  id: string;
  status: ListingStatus;
}

export interface AdminListingVerifyPayload {
  id: string;
  isVerified?: boolean;
}

export interface AdminListingFeaturePayload {
  id: string;
  isFeatured?: boolean;
}

export interface AdminListingDeactivatePayload {
  id: string;
  reason?: string;
}

