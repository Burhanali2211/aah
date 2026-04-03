import React, { createContext, useContext, useReducer, ReactNode, useCallback, useEffect, useRef } from 'react';
import { Product, ProductContextType, Category, Review } from '../types';
import { supabase, db } from '../lib/supabase';
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
  | { type: 'SET_LATEST_LOADING'; loading: boolean };

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  bestSellers: [],
  latestProducts: [],
  categories: [],
  loading: false,
  featuredLoading: false,
  bestSellersLoading: false,
  latestLoading: false,
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
};

function productReducer(state: ProductState, action: ProductAction): ProductState {
  switch (action.type) {
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
  const { showError } = useNotification();
  const initFetched = useRef(false);

  const mapDbProduct = (dbProduct: any): Product => {
    const images = Array.isArray(dbProduct.images) ? dbProduct.images : (dbProduct.image_url ? [dbProduct.image_url] : []);
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      slug: dbProduct.slug,
      description: dbProduct.description || '',
      shortDescription: dbProduct.short_description,
      price: dbProduct.price,
      originalPrice: dbProduct.original_price,
      categoryId: dbProduct.category_id,
      images,
      stock: dbProduct.stock ?? 0,
      minStockLevel: dbProduct.min_stock_level,
      sku: dbProduct.sku,
      weight: dbProduct.weight,
      dimensions: dbProduct.dimensions,
      rating: dbProduct.rating || 0,
      reviewCount: dbProduct.review_count || 0,
      reviews: [],
      sellerId: dbProduct.seller_id,
      sellerName: dbProduct.seller_name || 'Aligarh Attar House',
      tags: dbProduct.tags || [],
      specifications: dbProduct.specifications || {},
      featured: dbProduct.is_featured || false,
      showOnHomepage: dbProduct.show_on_homepage || false,
      isActive: dbProduct.is_active,
      metaTitle: dbProduct.meta_title,
      metaDescription: dbProduct.meta_description,
      createdAt: dbProduct.created_at ? new Date(dbProduct.created_at) : new Date(0),
      updatedAt: dbProduct.updated_at ? new Date(dbProduct.updated_at) : undefined,
    };
  };

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
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const data = await db.getCategories();
      dispatch({ type: 'SET_CATEGORIES', categories: data.map(mapDbCategory) });
    } catch (error) {
      showError('Failed to load categories');
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [showError]);

  const fetchProducts = useCallback(async (page: number = 1, limit: number = 20, filters?: any) => {
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const response = await db.getProducts({ page, limit, ...filters });
      dispatch({ type: 'SET_PRODUCTS', products: response.data.map(mapDbProduct), pagination: response.pagination });
    } catch (error) {
      showError('Failed to load products');
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [showError]);

  const fetchFeaturedProducts = useCallback(async (limit: number = 8) => {
    dispatch({ type: 'SET_FEATURED_LOADING', loading: true });
    try {
      const data = await db.getFeaturedProducts(limit);
      dispatch({ type: 'SET_FEATURED', products: data.map(mapDbProduct) });
    } catch (error) {
      showError('Failed to load featured products');
      dispatch({ type: 'SET_FEATURED_LOADING', loading: false });
    }
  }, [showError]);

  const fetchBestSellers = useCallback(async (limit: number = 8) => {
    dispatch({ type: 'SET_BEST_SELLERS_LOADING', loading: true });
    try {
      const response = await db.getProducts({ bestSellers: true, limit });
      dispatch({ type: 'SET_BEST_SELLERS', products: response.data.map(mapDbProduct) });
    } catch (error) {
      showError('Failed to load best sellers');
      dispatch({ type: 'SET_BEST_SELLERS_LOADING', loading: false });
    }
  }, [showError]);

  const fetchLatestProducts = useCallback(async (limit: number = 8) => {
    dispatch({ type: 'SET_LATEST_LOADING', loading: true });
    try {
      const data = await db.getLatestProducts(limit);
      dispatch({ type: 'SET_LATEST', products: data.map(mapDbProduct) });
    } catch (error) {
      showError('Failed to load latest products');
      dispatch({ type: 'SET_LATEST_LOADING', loading: false });
    }
  }, [showError]);

  const addProduct = useCallback(async (product: Partial<Product>) => {
    try {
      const { data, error } = await supabase.from('products').insert([{
        name: product.name, slug: product.slug, description: product.description,
        short_description: product.shortDescription, price: product.price,
        original_price: product.originalPrice, category_id: product.categoryId,
        images: product.images, stock: product.stock, min_stock_level: product.minStockLevel,
        sku: product.sku, weight: product.weight, dimensions: product.dimensions,
        tags: product.tags, specifications: product.specifications,
        is_featured: product.featured, show_on_homepage: product.showOnHomepage ?? true,
        is_active: product.isActive ?? true, meta_title: product.metaTitle,
        meta_description: product.metaDescription, seller_id: product.sellerId
      }]).select().single();
      if (error) throw error;
      await Promise.all([fetchProducts(), fetchFeaturedProducts(), fetchLatestProducts()]);
      return mapDbProduct(data);
    } catch (error) {
      showError('Failed to create product');
      throw error;
    }
  }, [showError, fetchProducts, fetchFeaturedProducts, fetchLatestProducts]);

  const updateProduct = useCallback(async (product: Partial<Product> & { id: string }) => {
    try {
      const { data, error } = await supabase.from('products').update({
        name: product.name, slug: product.slug, description: product.description,
        short_description: product.shortDescription, price: product.price,
        original_price: product.originalPrice, category_id: product.categoryId,
        images: product.images, stock: product.stock, min_stock_level: product.minStockLevel,
        sku: product.sku, weight: product.weight, dimensions: product.dimensions,
        tags: product.tags, specifications: product.specifications,
        is_featured: product.featured, show_on_homepage: product.showOnHomepage,
        is_active: product.isActive, meta_title: product.metaTitle,
        meta_description: product.metaDescription
      }).eq('id', product.id).select().single();
      if (error) throw error;
      await Promise.all([fetchProducts(), fetchFeaturedProducts(), fetchLatestProducts()]);
      return mapDbProduct(data);
    } catch (error) {
      showError('Failed to update product');
      throw error;
    }
  }, [showError, fetchProducts, fetchFeaturedProducts, fetchLatestProducts]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await Promise.allSettled([
        supabase.from('cart_items').delete().eq('product_id', id),
        supabase.from('wishlist_items').delete().eq('product_id', id),
        supabase.from('order_items').delete().eq('product_id', id),
        supabase.from('reviews').delete().eq('product_id', id),
      ]);
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      await Promise.all([fetchProducts(), fetchFeaturedProducts(), fetchLatestProducts()]);
    } catch (error) {
      showError('Failed to delete product');
      throw error;
    }
  }, [showError, fetchProducts, fetchFeaturedProducts, fetchLatestProducts]);

  useEffect(() => {
    if (initFetched.current) return;
    initFetched.current = true;
    (async () => {
      await fetchCategories();
      await fetchProducts(1, 20);
      await Promise.all([
        fetchFeaturedProducts(8),
        fetchLatestProducts(8),
        fetchBestSellers(8)
      ]);
    })();
    return () => { initFetched.current = false; };
  }, [fetchCategories, fetchProducts, fetchFeaturedProducts, fetchLatestProducts, fetchBestSellers]);

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
      const data = await db.getProduct(id);
      return data ? mapDbProduct(data) : null;
    },
    searchProducts: async (query) => {
      dispatch({ type: 'SET_LOADING', loading: true });
      const response = await db.getProducts({ search: query, limit: 50 });
      dispatch({ type: 'SET_PRODUCTS', products: response.data.map(mapDbProduct), pagination: response.pagination });
    },
    filterByCategory: async (categoryId) => {
      dispatch({ type: 'SET_LOADING', loading: true });
      const response = await db.getProducts({ categoryId, limit: 50 });
      dispatch({ type: 'SET_PRODUCTS', products: response.data.map(mapDbProduct), pagination: response.pagination });
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
