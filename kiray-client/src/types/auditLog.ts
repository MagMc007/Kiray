import type { User } from './user';

export type AuditTargetType = 'User' | 'Listing' | 'Comment' | 'Report' | 'System';

export interface AuditLog {
  _id: string;
  adminId: string | User;
  action: string;
  targetType: AuditTargetType;
  targetId?: unknown;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  createdAt: string;
  updatedAt?: string;
}
