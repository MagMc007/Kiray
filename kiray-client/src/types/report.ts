import type { Listing } from './listing';
import type { User } from './user';

export type ReportStatus = 'pending' | 'dismissed' | 'actioned';

export interface Report {
  _id: string;
  listingId: string | Listing;
  reporterId: string | User;
  reason: string;
  notes?: string | null;
  status: ReportStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface ReportCreateInput {
  reason: string;
  notes?: string;
}
