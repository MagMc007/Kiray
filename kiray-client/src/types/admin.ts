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

export interface AdminListingMetrics {
  total: number;
  active: number;
  flagged: number;
}

export interface AdminReportMetrics {
  pending: number;
}

export interface AdminDashboardMetrics {
  users: AdminUserMetrics;
  listings: AdminListingMetrics;
  reports: AdminReportMetrics;
}

export type ActivityAnalyticsPeriod = '7d' | '30d' | '90d' | '1y';

export interface ActivityDataPoint {
  date: string;
  count: number;
}

export interface ActivityAnalytics {
  period: ActivityAnalyticsPeriod;
  startDate: string;
  endDate: string;
  userSignups: ActivityDataPoint[];
  listingCreations: ActivityDataPoint[];
}
