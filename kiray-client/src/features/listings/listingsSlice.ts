import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FilterState } from '@/types/listing';

export type ViewMode = 'grid' | 'split' | 'map';

export interface ListingsState {
  viewMode: ViewMode;
  selectedListingId: string | null;
  isFilterModalOpen: boolean;
  draftFilters: FilterState;
}

export const initialFilterState: FilterState = {
  keyword: '',
  city: 'Addis Ababa',
  neighborhood: '',
  radiusKm: 10,
  minPrice: 0,
  maxPrice: 80000,
  propertyType: '',
  bedrooms: 'all',
  bathrooms: 'all',
  minArea: 0,
  maxArea: 1000,
  amenities: [],
  status: 'all',
  sortBy: 'newest',
  onlySaved: false,
};

const initialState: ListingsState = {
  viewMode: 'grid',
  selectedListingId: null,
  isFilterModalOpen: false,
  draftFilters: initialFilterState,
};

export const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
    },
    setSelectedListingId: (state, action: PayloadAction<string | null>) => {
      state.selectedListingId = action.payload;
    },
    setFilterModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isFilterModalOpen = action.payload;
    },
    setDraftFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.draftFilters = { ...state.draftFilters, ...action.payload };
    },
    resetDraftFilters: (state) => {
      state.draftFilters = initialFilterState;
    },
  },
});

export const {
  setViewMode,
  setSelectedListingId,
  setFilterModalOpen,
  setDraftFilters,
  resetDraftFilters,
} = listingsSlice.actions;

export default listingsSlice.reducer;
