import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../services/api';
import { Product } from '../../types/marketplace';

export interface CatalogFilters {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  minRating: number;
  sort: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'popular';
  page: number;
  limit: number;
}

interface CatalogState {
  products: Product[];
  categories: string[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  filters: CatalogFilters;
  loading: boolean;
  error: string | null;
}

const initialState: CatalogState = {
  products: [],
  categories: [
    'All',
    'Audio & Tech',
    'Home & Kitchen',
    'Fitness & Outdoors',
    'Workspace & Office',
    'Electronics',
  ],
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,
  filters: {
    search: '',
    category: 'All',
    minPrice: '',
    maxPrice: '',
    minRating: 0,
    sort: 'featured',
    page: 1,
    limit: 6,
  },
  loading: false,
  error: null,
};

export const fetchCatalogProducts = createAsyncThunk(
  'catalog/fetchProducts',
  async (overrideFilters: Partial<CatalogFilters> | undefined, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { catalog: CatalogState };
      const merged = { ...state.catalog.filters, ...overrideFilters };
      const params: Record<string, string | number> = {
        sort: merged.sort,
        page: merged.page,
        limit: merged.limit,
      };
      if (merged.search.trim()) params.search = merged.search.trim();
      if (merged.category && merged.category !== 'All') params.category = merged.category;
      if (merged.minPrice !== '') params.minPrice = merged.minPrice;
      if (merged.maxPrice !== '') params.maxPrice = merged.maxPrice;
      if (merged.minRating > 0) params.minRating = merged.minRating;

      const { data } = await apiClient.get<{
        products: Product[];
        totalItems: number;
        totalPages: number;
        currentPage: number;
        categories: string[];
      }>('/products', { params });

      return { ...data, appliedFilters: merged };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to load products.');
    }
  }
);

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setCatalogFilters(state, action: PayloadAction<Partial<CatalogFilters>>) {
      state.filters = {
        ...state.filters,
        ...action.payload,
        page: action.payload.page ?? 1,
      };
    },
    resetCatalogFilters(state) {
      state.filters = {
        search: '',
        category: 'All',
        minPrice: '',
        maxPrice: '',
        minRating: 0,
        sort: 'featured',
        page: 1,
        limit: 6,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCatalogProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.totalItems = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        if (action.payload.categories?.length) {
          state.categories = action.payload.categories;
        }
        state.filters = action.payload.appliedFilters;
      })
      .addCase(fetchCatalogProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCatalogFilters, resetCatalogFilters } = catalogSlice.actions;
export default catalogSlice.reducer;
