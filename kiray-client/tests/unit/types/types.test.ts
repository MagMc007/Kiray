import { describe, it, expect } from 'vitest';
import type {
  User,
  UserRole,
  UserStatus,
  Listing,
  PropertyType,
  Amenity,
  Comment,
  Favorite,
  Report,
  AuditLog,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

describe('Type Reconciliation Pass (Step 4)', () => {
  it('instantiates valid User matching backend schema', () => {
    const user: User = {
      _id: '64b0d6f9e4b0f2b7c8a1d2e3',
      firebaseUid: 'fb_12345',
      role: 'landlord',
      status: 'active',
      displayName: 'Abebe Kebede',
      fullName: 'Abebe Kebede Tessema',
      phoneNumber: ['+251911223344'],
      profileCompleted: true,
      email: 'abebe@example.com',
      phone: '+251911223344',
      bio: 'Property owner in Bole',
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-01T10:00:00.000Z',
    };

    expect(user.role).toBe('landlord');
    expect(user.status).toBe('active');
    expect(user.displayName).toBe('Abebe Kebede');
  });

  it('validates UserRole and UserStatus enum values', () => {
    const roles: UserRole[] = ['landlord', 'rentee', 'admin'];
    const statuses: UserStatus[] = ['active', 'suspended', 'banned'];

    expect(roles).toHaveLength(3);
    expect(statuses).toHaveLength(3);
    expect(statuses).not.toContain('deactivated');
  });

  it('instantiates valid Listing matching backend schema', () => {
    const listing: Listing = {
      _id: '64b0d6f9e4b0f2b7c8a1d2e4',
      ownerId: '64b0d6f9e4b0f2b7c8a1d2e3',
      title: '2-Bedroom Luxury Condo in Bole Atlas',
      slug: '2-bedroom-luxury-condo-in-bole-atlas',
      description: 'Spacious 2-bedroom with backup generator and private balcony.',
      price: 35000,
      currency: 'ETB',
      propertyType: 'condo',
      bedrooms: 2,
      bathrooms: 2,
      area: 110,
      areaUnit: 'sqm',
      amenities: ['wifi', 'parking', 'backup_generator', 'security', 'elevator'],
      location: {
        type: 'Point',
        coordinates: [38.7891, 9.0123],
      },
      address: {
        street: 'Bole Atlas St.',
        city: 'Addis Ababa',
        neighborhood: 'Bole',
      },
      images: [
        {
          url: 'https://res.cloudinary.com/kiray/image/upload/sample.jpg',
          publicId: 'kiray/listings/sample',
          order: 0,
        },
      ],
      status: 'open',
      viewCount: 12,
      saveCount: 3,
      contactClickCount: 1,
      averageRating: 4.5,
      totalComments: 2,
      isVerified: true,
      isFeatured: false,
      isDeleted: false,
      createdAt: '2026-09-02T12:00:00.000Z',
      updatedAt: '2026-09-02T12:00:00.000Z',
    };

    expect(listing.price).toBe(35000);
    expect(listing.propertyType).toBe('condo');
    expect(listing.address.neighborhood).toBe('Bole');
  });

  it('validates Comment, Favorite, Report and AuditLog shapes', () => {
    const comment: Comment = {
      _id: 'c1',
      listingId: 'l1',
      authorId: 'u1',
      rating: 5,
      text: 'Great place and verified host!',
      verifiedRentee: true,
      createdAt: '2026-09-03T10:00:00.000Z',
    };

    const favorite: Favorite = {
      _id: 'f1',
      userId: 'u1',
      listingId: 'l1',
      createdAt: '2026-09-03T10:00:00.000Z',
    };

    const report: Report = {
      _id: 'r1',
      listingId: 'l1',
      reporterId: 'u1',
      reason: 'Incorrect price details',
      status: 'pending',
      createdAt: '2026-09-03T10:00:00.000Z',
    };

    const auditLog: AuditLog = {
      _id: 'a1',
      adminId: 'admin_1',
      action: 'listing.verify',
      targetType: 'Listing',
      targetId: 'l1',
      createdAt: '2026-09-03T10:00:00.000Z',
    };

    expect(comment.rating).toBe(5);
    expect(favorite.userId).toBe('u1');
    expect(report.status).toBe('pending');
    expect(auditLog.targetType).toBe('Listing');
  });

  it('validates ApiResponse and PaginatedResponse generic wrappers', () => {
    const res: ApiResponse<{ count: number }> = {
      success: true,
      message: 'Success',
      data: { count: 42 },
    };

    const paginated: PaginatedResponse<string> = {
      results: ['item1', 'item2'],
      meta: {
        page: 1,
        limit: 10,
        total: 2,
      },
    };

    expect(res.data.count).toBe(42);
    expect(paginated.results).toHaveLength(2);
  });
});
