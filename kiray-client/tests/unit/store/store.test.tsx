import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { store, makeStore } from '@/store/store';
import {
  baseApi,
  TAG_TYPES,
  unwrapApiResponse,
  normalizeApiError,
} from '@/store/baseApi';
import { Providers } from '@/app/providers';
import { useAppSelector } from '@/store/hooks';

function TestConsumer() {
  const apiState = useAppSelector((state) => state.api);
  return (
    <div data-testid="consumer-output">
      API queries count: {Object.keys(apiState.queries).length}
    </div>
  );
}

describe('Redux Store & RTK Query (Step 3)', () => {
  it('registers baseApi reducer in the store', () => {
    const state = store.getState();
    expect(state).toHaveProperty('api');
    expect(state.api).toHaveProperty('queries');
    expect(state.api).toHaveProperty('mutations');
  });

  it('creates isolated store instances via makeStore', () => {
    const customStore = makeStore();
    expect(customStore.getState()).toHaveProperty('api');
    expect(customStore.dispatch).toBeDefined();
  });

  it('includes all required tagTypes in baseApi per plan.md', () => {
    const expectedTags = [
      'Listing',
      'ListingList',
      'Comment',
      'Favorite',
      'User',
      'AdminUser',
      'AdminListing',
      'Flag',
      'AuditLog',
      'SystemConfig',
    ];

    expect(TAG_TYPES).toEqual(expectedTags);
  });

  it('unwraps ApiResponse envelopes correctly', () => {
    const mockEnvelope = {
      success: true,
      message: 'Listings retrieved',
      data: [{ id: '1', title: 'Modern Condo' }],
    };

    const unwrapped = unwrapApiResponse(mockEnvelope);
    expect(unwrapped).toEqual([{ id: '1', title: 'Modern Condo' }]);
  });

  it('normalizes error responses correctly', () => {
    const normalized = normalizeApiError({
      status: 400,
      data: {
        success: false,
        error: 'Validation failed',
        details: ['Title is required'],
      },
    });

    expect(normalized).toEqual({
      status: 400,
      message: 'Validation failed',
      details: ['Title is required'],
    });
  });

  it('renders children with Providers wrapping Redux store', () => {
    render(
      <Providers>
        <TestConsumer />
      </Providers>,
    );

    expect(screen.getByTestId('consumer-output')).toHaveTextContent('API queries count: 0');
  });
});
