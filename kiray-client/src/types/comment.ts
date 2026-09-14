import type { UserRole } from './user';

export interface CommentAuthor {
  _id: string;
  displayName: string;
  fullName?: string | null;
  photoURL?: string | null;
  role?: UserRole;
}

export interface Comment {
  _id: string;
  listingId: string;
  authorId: string | CommentAuthor;
  rating: number; // 1 - 5
  text: string;
  verifiedRentee: boolean;
  isOwnerAnswer?: boolean;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CommentCreateInput {
  rating: number;
  text: string;
}

export interface CommentUpdateInput {
  rating?: number;
  text?: string;
}
