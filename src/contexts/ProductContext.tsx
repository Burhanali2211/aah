import React, { createContext, useContext, useReducer, ReactNode, useCallback, useEffect, useRef } from 'react';
import { Product, ProductContextType, Category, Review } from '../types';
import { supabase, db } from '../lib/supabase';
import { transformProduct, transformCategory } from '../lib/dataTransform';
import * as optimized from '../lib/optimized-queries';
import { productApi } from '../lib/apiClient';
import { useNotification } from './NotificationContext';

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  bestSellers: Product[];
  latestProducts: Product[];
  categories: Category[];
  loading: boolean;
  featuredLoading: boolean;
  bestSellersLoading: boolean;
  latestLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

type ProductAction =
  | { type: 'SET_PRODUCTS'; products: Product[]; pagination: ProductState['pagination'] }
  | { type: 'SET_FEATURED'; products: Product[] }
  | { type: 'SET_BEST_SELLERS'; products: Product[] }
  | { type: 'SET_LATEST'; products: Product[] }
  | { type: 'SET_CATEGORIES'; categories: Category[] }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_FEATURED_LOADING'; loading: boolean }
  | { type: 'SET_BEST_SELLERS_LOADING'; loading: boolean }
  | { type: 'SET_LATEST_LOADING'; loading: boolean }
  | { type: 'INITIALIZE_START' }
  | { type: 'INITIALIZE_FINISH'; 
      products: Product[]; 
      featured: Product[]; 
      bestSellers: Product[]; 
      latest: Product[]; 
      categories: Category[]; 
      pagination: ProductState['pagination'] 
    };

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  bestSellers: [],
  latestProducts: [],
  categories: [],
  loading: true,
  featuredLoading: true,
  bestSellersLoading: true,
  latestLoading: true,
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
};

function productReducer(state: ProductState, action: ProductAction): ProductState {
  switch (action.type) {
    case 'INITIALIZE_START':
      return { 
        ...state, 
        loading: true, 
        featuredLoading: true, 
        bestSellersLoading: true, 
        latestLoading: true 
      };
    case 'INITIALIZE_FINISH':
      return {
        ...state,
        products: action.products,
        featuredProducts: action.featured,
        bestSellers: action.bestSellers,
        latestProducts: action.latest,
        categories: action.categories,
        pagination: action.pagination,
        loading: false,
        featuredLoading: false,
        bestSellersLoading: false,
        latestLoading: false
      };
    case 'SET_PRODUCTS': return { ...state, products: action.products, pagination: action.pagination, loading: false };
    case 'SET_FEATURED': return { ...state, featuredProducts: action.products, featuredLoading: false };
    case 'SET_BEST_SELLERS': return { ...state, bestSellers: action.products, bestSellersLoading: false };
    case 'SET_LATEST': return { ...state, latestProducts: action.products, latestLoading: false };
    case 'SET_CATEGORIES': return { ...state, categories: action.categories, loading: false };
    case 'SET_LOADING': return { ...state, loading: action.loading };
    case 'SET_FEATURED_LOADING': return { ...state, featuredLoading: action.loading };
    case 'SET_BEST_SELLERS_LOADING': return { ...state, bestSellersLoading: action.loading };
    case 'SET_LATEST_LOADING': return { ...state, latestLoading: action.loading };
    default: return state;
  }
}

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);
  const { showNotification } = useNotification();
  const initFetched = useRef(false);

  const mapDbProduct = (dbProduct: any): Product => transformProduct(dbProduct);

  const mapDbCategory = (dbCategory: any): Category => ({
    id: dbCategory.id,
    name: dbCategory.name,
    slug: dbCategory.slug,
    description: dbCategory.description,
    imageUrl: dbCategory.image_url || '',
    parentId: dbCategory.parent_id,
    isActive: dbCategory.is_active,
    sortOrder: dbCategory.sort_order,
    productCount: dbCategory.product_count || 0,
    createdAt: dbCategory.created_at ? new Date(dbCategory.created_at) : undefined,
    updatedAt: dbCategory.updated_at ? new Date(dbCategory.updated_at) : undefined,
  });

  const fetchCategories = useCallback(async () => {
    try {
      const data = await db.getCategories();
      if (data) {
        dispatch({ type: 'SET_CATEGORIES', categories: data.map(mapDbCategory) });
      }
    } catch (error) {
      showNotification({ type: 'error', title: 'Error', message: 'Failed to load categories' });
    }
  }, [showNotification]);

  const fetchProducts = useCallback(async (page: number = 1, limit: number = 20, filters?: any) => {
    try {
      const response = await db.getProducts({ page, limit, ...filters });
      if (response && response.data) {
        dispatch({ type: 'SET_PRODUCTS', products: response.data.map(mapDbProduct), pagination: response.pagination });
      }
    } catch (error) {
      showNotification({ type: 'error', title: 'Error', message: 'Failed to load products' });
    }
  }, [showNotification]);

  const fetchFeaturedProducts = useCallback(async (limit: number = 8) => {
    try {
      const data = await db.getFeaturedProducts(limit);
      if (data) {
        dispatch({ type: 'SET_FEATURED', products: data.map(mapDbProduct) });
      }
    } catch (error) {
      showNotification({ type: 'error', title: 'Error', message: 'Failed to load featured products' });
    }
  }, [showNotification]);

  const fetchBestSellers = useCallback(async (limit: number = 8) => {
    try {
      // Use optimized function which uses materialized view
      const data = await optimized.getPopularProducts(limit);
      if (data) {
        dispatch({ type: 'SET_BEST_SELLERS', products: data.map(mapDbProduct) });
      }
    } catch (error) {
      showNotification({ type: 'error', title: 'Error', message: 'Failed to load best sellers' });
    }
  }, [showNotification]);

  const fetchLatestProducts = useCallback(async (limit: number = 8) => {
    try {
      // Use materialized view for performance
      const data = await optimized.getPopularProducts(limit);
      if (data) {
        dispatch({ type: 'SET_LATEST', products: data.map(mapDbProduct) });
      }
    } catch (error) {
      showNotification({ type: 'error', title: 'Error', message: 'Failed to load latest products' });
    }
  }, [showNotification]);

  const addProduct = useCallback(async (product: Partial<Product>) => {
    try {
      const data = await productApi.create({
        name: product.name, slug: product.slug, description: product.description,
        short_description: product.shortDescription, price: product.price,
        original_price: product.originalPrice, category_id: product.categoryId,
        images: product.images, stock: product.stock, min_stock_level: product.minStockLevel,
        sku: product.sku, weight: product.weight, dimensions: product.dimensions,
        tags: product.tags, specifications: product.specifications,
        is_featured: product.featured, show_on_homepage: product.showOnHomepage ?? true,
        is_active: product.isActive ?? true, meta_title: product.metaTitle,
        meta_description: product.metaDescription, seller_id: product.sellerId
      });
      await Promise.all([fetchProducts(), fetchFeaturedProducts(), fetchLatestProducts()]);
      return mapDbProduct(data);
    } catch (error) {
      showNotification({ type: 'error', title: 'Error', message: 'Failed to create product' });
      throw error;
    }
  }, [showNotification, fetchProducts, fetchFeaturedProducts, fetchLatestProducts]);

  const updateProduct = useCallback(async (product: Partial<Product> & { id: string }) => {
    try {
      const data = await productApi.update({
        id: product.id,
        name: product.name, slug: product.slug, description: product.description,
        short_description: product.shortDescription, price: product.price,
        original_price: product.originalPrice, category_id: product.categoryId,
        images: product.images, stock: product.stock, min_stock_level: product.minStockLevel,
        sku: product.sku, weight: product.weight, dimensions: product.dimensions,
        tags: product.tags, specifications: product.specifications,
        is_featured: product.featured, show_on_homepage: product.showOnHomepage,
        is_active: product.isActive, meta_title: product.metaTitle,
        meta_description: product.metaDescription
      });
      await Promise.all([fetchProducts(), fetchFeaturedProducts(), fetchLatestProducts()]);
      return mapDbProduct(data);
    } catch (error) {
      showNotification({ type: 'error', title: 'Error', message: 'Failed to update product' });
      throw error;
    }
  }, [showNotification, fetchProducts, fetchFeaturedProducts, fetchLatestProducts]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await productApi.delete(id);
      await Promise.all([fetchProducts(), fetchFeaturedProducts(), fetchLatestProducts()]);
    } catch (error) {
      showNotification({ type: 'error', title: 'Error', message: 'Failed to delete product' });
      throw error;
    }
  }, [showNotification, fetchProducts, fetchFeaturedProducts, fetchLatestProducts]);

  useEffect(() => {
    if (initFetched.current) return;
    initFetched.current = true;

    let isMounted = true;
    const initializeProducts = async () => {
      console.log('[PRODUCTS] Starting initialization...');
      dispatch({ type: 'INITIALIZE_START' });

      // Set a hard timeout for product initialization (10 seconds)
      const timeoutId = setTimeout(() => {
        console.warn('[PRODUCTS] Initialization timeout (10s). Forcing UI state...');
        dispatch({ 
          type: 'INITIALIZE_FINISH',
          products: state.products,
          featured: state.featuredProducts,
          bestSellers: state.bestSellers,
          latest: state.latestProducts,
          categories: state.categories,
          pagination: state.pagination
        });
      }, 10000);

      try {
        console.log('[PRODUCTS] Fetching all data components...');
        const [catData, prodData, featData, lateData, bestData] = await Promise.all([
          db.getCategories().then(d => { console.log('[PRODUCTS] Received categories'); return d; }),
          db.getProducts({ page: 1, limit: 20 }).then(d => { console.log('[PRODUCTS] Received products'); return d; }),
          db.getFeaturedProducts(8).then(d => { console.log('[PRODUCTS] Received featured'); return d; }),
          db.getLatestProducts(8).then(d => { console.log('[PRODUCTS] Received latest'); return d; }),
          db.getProducts({ bestSellers: true, limit: 8 }).then(d => { console.log('[PRODUCTS] Received best-sellers'); return d; })
        ]);

        console.log('[PRODUCTS] Data fetching complete. Updating state...');
        clearTimeout(timeoutId);
        dispatch({
          type: 'INITIALIZE_FINISH',
          categories: (catData || []).map(mapDbCategory),
          products: (prodData?.data || []).map(mapDbProduct),
          featured: (featData || []).map(mapDbProduct),
          latest: (lateData || []).map(mapDbProduct),
          bestSellers: (bestData?.data || []).map(mapDbProduct),
          pagination: prodData?.pagination || { page: 1, limit: 20, total: 0, pages: 0 }
        });
      } catch (err) {
        console.error('[PRODUCTS] Critical initialization error:', err);
        clearTimeout(timeoutId);
        dispatch({ 
          type: 'INITIALIZE_FINISH',
          products: [], featured: [], latest: [], bestSellers: [], categories: [],
          pagination: { page: 1, limit: 20, total: 0, pages: 0 }
        });
      }
    };

    initializeProducts();

    return () => { isMounted = false; };
  }, []);

  const value: ProductContextType = {
    ...state,
    fetchProducts, fetchFeaturedProducts, fetchBestSellers, fetchLatestProducts,
    fetchReviewsForProduct: async (id) => {
      const { data } = await supabase.from('reviews').select('*, profiles(full_name, avatar_url)').eq('product_id', id).eq('is_approved', true).order('created_at', { ascending: false });
      return data || [];
    },
    fetchCategories,
    addProduct, createProduct: addProduct,
    submitReview: async (review) => {
      await supabase.from('reviews').insert([{ product_id: review.productId, user_id: review.userId, rating: review.rating, comment: review.comment, title: review.title }]);
    },
    getProductById: async (id) => {
      try {
        // Use optimized RPC for product details including joins
        const data = await optimized.getProductDetails(id);
        if (data) return mapDbProduct(data);
        
        // Fallback to local state
        return state.products.find(p => p.id === id) || null;
      } catch (error) {
        console.error('Error fetching product details:', error);
        return state.products.find(p => p.id === id) || null;
      }
    },
    searchProducts: async (query) => {
      dispatch({ type: 'SET_LOADING', loading: true });
      try {
        // Use optimized full-text search RPC
        const data = await optimized.searchProducts({ query, limit: 50 });
        dispatch({ 
          type: 'SET_PRODUCTS', 
          products: data.map(mapDbProduct), 
          pagination: { page: 1, limit: 50, total: data.length, pages: 1 } 
        });
      } catch (error) {
        showNotification({ type: 'error', title: 'Search Error', message: 'Failed to search products' });
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    },
    filterByCategory: async (categoryId) => {
      dispatch({ type: 'SET_LOADING', loading: true });
      try {
        const response = await db.getProducts({ categoryId, limit: 50 });
        dispatch({ type: 'SET_PRODUCTS', products: response.data.map(mapDbProduct), pagination: response.pagination });
      } catch (error) {
        showNotification({ type: 'error', title: 'Filter Error', message: 'Failed to filter by category' });
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    },
    updateProduct, deleteProduct,
    createCategory: async (data) => {
      const { data: category, error } = await supabase.from('categories').insert([data]).select().single();
      if (error) throw error;
      await fetchCategories();
      return mapDbCategory(category);
    },
    updateCategory: async (id, data) => {
      const { data: category, error } = await supabase.from('categories').update(data).eq('id', id).select().single();
      if (error) throw error;
      await fetchCategories();
      return mapDbCategory(category);
    },
    deleteCategory: async (id) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      await fetchCategories();
    },
    nextPage: () => { if (state.pagination.page < state.pagination.pages) fetchProducts(state.pagination.page + 1); },
    previousPage: () => { if (state.pagination.page > 1) fetchProducts(state.pagination.page - 1); },
    goToPage: (page) => { if (page >= 1 && page <= state.pagination.pages) fetchProducts(page); },
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};
