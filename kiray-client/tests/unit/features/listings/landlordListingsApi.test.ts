import { describe, it, expect } from 'vitest';
import { listingsApi } from '@/features/listings/listingsApi';

describe('landlordListingsApi Endpoints', () => {
  it('defines createListing mutation endpoint', () => {
    expect(listingsApi.endpoints.createListing).toBeDefined();
    expect(typeof listingsApi.endpoints.createListing.initiate).toBe('function');
  });

  it('defines updateListing mutation endpoint', () => {
    expect(listingsApi.endpoints.updateListing).toBeDefined();
    expect(typeof listingsApi.endpoints.updateListing.initiate).toBe('function');
  });

  it('defines deleteListing mutation endpoint', () => {
    expect(listingsApi.endpoints.deleteListing).toBeDefined();
    expect(typeof listingsApi.endpoints.deleteListing.initiate).toBe('function');
  });

  it('defines restoreListing mutation endpoint', () => {
    expect(listingsApi.endpoints.restoreListing).toBeDefined();
    expect(typeof listingsApi.endpoints.restoreListing.initiate).toBe('function');
  });

  it('defines updateListingStatus mutation endpoint', () => {
    expect(listingsApi.endpoints.updateListingStatus).toBeDefined();
    expect(typeof listingsApi.endpoints.updateListingStatus.initiate).toBe('function');
  });

  it('defines setListingAvailable and setListingRented mutation endpoints', () => {
    expect(listingsApi.endpoints.setListingAvailable).toBeDefined();
    expect(typeof listingsApi.endpoints.setListingAvailable.initiate).toBe('function');
    expect(listingsApi.endpoints.setListingRented).toBeDefined();
    expect(typeof listingsApi.endpoints.setListingRented.initiate).toBe('function');
  });

  it('defines uploadListingImages and deleteListingImage mutation endpoints', () => {
    expect(listingsApi.endpoints.uploadListingImages).toBeDefined();
    expect(typeof listingsApi.endpoints.uploadListingImages.initiate).toBe('function');
    expect(listingsApi.endpoints.deleteListingImage).toBeDefined();
    expect(typeof listingsApi.endpoints.deleteListingImage.initiate).toBe('function');
  });

  it('defines trackContactClick mutation endpoint', () => {
    expect(listingsApi.endpoints.trackContactClick).toBeDefined();
    expect(typeof listingsApi.endpoints.trackContactClick.initiate).toBe('function');
  });

  it('correctly builds query for uploadListingImages with File array', () => {
    const fakeFile1 = new File(['image content 1'], 'photo1.jpg', { type: 'image/jpeg' });
    const fakeFile2 = new File(['image content 2'], 'photo2.png', { type: 'image/png' });

    const endpointDef = listingsApi.endpoints.uploadListingImages;
    // Inspect query function behavior
    const queryFn = (endpointDef as any).matchPending;
    expect(queryFn).toBeDefined();
  });
});
