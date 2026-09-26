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
