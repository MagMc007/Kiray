import { describe, it, expect } from 'vitest';
import listingsReducer, {
  setViewMode,
  setSelectedListingId,
  setFilterModalOpen,
  setDraftFilters,
  resetDraftFilters,
  initialFilterState,
  type ListingsState,
} from '@/features/listings/listingsSlice';

describe('listingsSlice', () => {
  const initialState: ListingsState = {
    viewMode: 'grid',
    selectedListingId: null,
    isFilterModalOpen: false,
    draftFilters: initialFilterState,
  };

  it('handles setViewMode', () => {
    const nextState = listingsReducer(initialState, setViewMode('split'));
    expect(nextState.viewMode).toBe('split');

    const mapState = listingsReducer(nextState, setViewMode('map'));
    expect(mapState.viewMode).toBe('map');
  });

  it('handles setSelectedListingId', () => {
    const nextState = listingsReducer(initialState, setSelectedListingId('listing_123'));
    expect(nextState.selectedListingId).toBe('listing_123');

    const clearedState = listingsReducer(nextState, setSelectedListingId(null));
    expect(clearedState.selectedListingId).toBeNull();
  });

  it('handles setFilterModalOpen', () => {
    const openedState = listingsReducer(initialState, setFilterModalOpen(true));
    expect(openedState.isFilterModalOpen).toBe(true);

    const closedState = listingsReducer(openedState, setFilterModalOpen(false));
    expect(closedState.isFilterModalOpen).toBe(false);
  });

  it('handles setDraftFilters', () => {
    const nextState = listingsReducer(
      initialState,
      setDraftFilters({
        keyword: 'luxury',
        neighborhood: 'Bole',
        minPrice: 15000,
        bedrooms: '2',
      })
    );

    expect(nextState.draftFilters.keyword).toBe('luxury');
    expect(nextState.draftFilters.neighborhood).toBe('Bole');
    expect(nextState.draftFilters.minPrice).toBe(15000);
    expect(nextState.draftFilters.bedrooms).toBe('2');
    // Unchanged properties should remain default
    expect(nextState.draftFilters.city).toBe('Addis Ababa');
  });

  it('handles resetDraftFilters', () => {
    const dirtyState: ListingsState = {
      ...initialState,
      draftFilters: {
        ...initialFilterState,
        keyword: 'condo',
        neighborhood: 'Kazanchis',
        maxPrice: 50000,
      },
    };

    const resetState = listingsReducer(dirtyState, resetDraftFilters());
    expect(resetState.draftFilters).toEqual(initialFilterState);
  });
});
