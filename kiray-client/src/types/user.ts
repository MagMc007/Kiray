export type UserRole = 'landlord' | 'rentee' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'banned';

export interface UserSocials {
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
}

export interface User {
  _id: string;
  firebaseUid: string;
  role: UserRole;
  status: UserStatus;
  displayName: string;
  fullName?: string | null;
  phoneNumber?: string[];
  profileCompleted: boolean;
  email: string;
  phone?: string;
  whatsapp?: string;
  photoURL?: string | null;
  bio?: string;
  socials?: UserSocials;
  responseTime?: number | null;
  totalListings?: number;
  activeListings?: number;
  isVerified?: boolean;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserPublicProfile {
  _id: string;
  displayName: string;
  fullName?: string | null;
  role: UserRole;
  photoURL?: string | null;
  bio?: string;
  phone?: string;
  whatsapp?: string;
  socials?: UserSocials;
  responseTime?: number | null;
  totalListings?: number;
  activeListings?: number;
  isVerified?: boolean;
  createdAt: string;
}
