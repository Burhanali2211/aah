import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { Product, ProductContextType, Category, Review } from '../types';
import { supabase, db } from '../lib/supabase';
import { useNotification } from './NotificationContext';

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Keys were used by cache, removed now.

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ── State initialised from cache immediately — zero loading flash ──
  const [products, setProducts]           = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers]     = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [categories, setCategories]       = useState<Category[]>([]);
  const [loading, setLoading]             = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [bestSellersLoading, setBestSellersLoading] = useState(true);
  const [latestLoading, setLatestLoading] = useState(true);
  const [pagination, setPagination]       = useState<PaginationState>({ page: 1, limit: 20, total: 0, pages: 0 });
  const { showError } = useNotification();

  // Track whether initial homepage fetch has been kicked off
  const initFetched = useRef(false);

  const mapDbProductToAppProduct = useCallback((dbProduct: any): Product => {
    const images = Array.isArray(dbProduct.images) ? dbProduct.images
      : dbProduct.image_url ? [dbProduct.image_url]
      : [];
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
  }, []);

  const mapDbCategoryToAppCategory = useCallback((dbCategory: any): Category => ({
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
  }), []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await db.getCategories();
      const mapped = data.map(mapDbCategoryToAppCategory);
      setCategories(mapped);
    } catch (error) {
      showError('Failed to load categories', error instanceof Error ? error.message : undefined);
    } finally {
      setLoading(false);
    }
  }, [showError, mapDbCategoryToAppCategory]);

  const fetchProducts = useCallback(async (page: number = 1, limit: number = 20, filters?: any) => {
    setLoading(true);
    try {
      const response = await db.getProducts({ page, limit, ...filters });
      const mapped = response.data.map(mapDbProductToAppProduct);
      setProducts(mapped);
      setPagination(response.pagination);
    } catch (error) {
      showError('Failed to load products', error instanceof Error ? error.message : undefined);
    } finally {
      setLoading(false);
    }
  }, [showError, mapDbProductToAppProduct]);

  const fetchFeaturedProducts = useCallback(async (limit: number = 8) => {
    setFeaturedLoading(true);
    try {
      const data = await db.getFeaturedProducts(limit);
      const mapped = data.map(mapDbProductToAppProduct);
      setFeaturedProducts(mapped);
    } catch (error) {
      showError('Failed to load featured products', error instanceof Error ? error.message : undefined);
    } finally {
      setFeaturedLoading(false);
    }
  }, [showError, mapDbProductToAppProduct]);

  const fetchBestSellers = useCallback(async (limit: number = 8) => {
    setBestSellersLoading(true);
    try {
      const response = await db.getProducts({ bestSellers: true, limit });
      const mapped = response.data.map(mapDbProductToAppProduct);
      setBestSellers(mapped);
    } catch (error) {
      showError('Failed to load best sellers', error instanceof Error ? error.message : undefined);
    } finally {
      setBestSellersLoading(false);
    }
  }, [showError, mapDbProductToAppProduct]);

  const fetchLatestProducts = useCallback(async (limit: number = 8) => {
    setLatestLoading(true);
    try {
      const data = await db.getLatestProducts(limit);
      const mapped = data.map(mapDbProductToAppProduct);
      setLatestProducts(mapped);
    } catch (error) {
      showError('Failed to load latest products', error instanceof Error ? error.message : undefined);
    } finally {
      setLatestLoading(false);
    }
  }, [showError, mapDbProductToAppProduct]);

  const fetchReviewsForProduct = useCallback(async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(full_name, avatar_url)')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      showError('Failed to load reviews', error instanceof Error ? error.message : undefined);
      return [];
    }
  }, [showError]);

  const addProduct = useCallback(async (product: Partial<Product>) => {
    try {
      const payload = {
        name: product.name,
        slug: product.slug,
        description: product.description,
        short_description: product.shortDescription,
        price: product.price,
        original_price: product.originalPrice,
        category_id: product.categoryId,
        images: product.images,
        stock: product.stock,
        min_stock_level: product.minStockLevel,
        sku: product.sku,
        weight: product.weight,
        dimensions: product.dimensions,
        tags: product.tags,
        specifications: product.specifications,
        is_featured: product.featured,
        show_on_homepage: product.showOnHomepage ?? true,
        is_active: product.isActive ?? true,
        meta_title: product.metaTitle,
        meta_description: product.metaDescription,
        seller_id: product.sellerId
      };

      console.log('[ProductContext] Creating new product:', payload);
      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single();
        
      if (error) {
        console.error('[ProductContext] Error creating product:', error);
        throw error;
      };
      
      console.log('[ProductContext] Product created successfully:', data);
      
      // Refetch all to ensure consistency across homepage/catalog
      await Promise.all([
        fetchProducts(1, 20, undefined),
        fetchFeaturedProducts(8),
        fetchLatestProducts(8),
        fetchBestSellers(8)
      ]);
      
      return mapDbProductToAppProduct(data);
    } catch (error) {
      showError('Failed to create product', error instanceof Error ? error.message : undefined);
      throw error;
    }
  }, [showError, fetchProducts, fetchFeaturedProducts, fetchLatestProducts, fetchBestSellers, mapDbProductToAppProduct]);

  const submitReview = useCallback(async (review: Omit<Review, 'id' | 'createdAt' | 'profiles'>) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{ product_id: review.productId, user_id: review.userId, rating: review.rating, comment: review.comment, title: review.title }]);
      if (error) throw error;
    } catch (error) {
      showError('Failed to submit review', error instanceof Error ? error.message : undefined);
      throw error;
    }
  }, [showError]);

  const getProductById = useCallback(async (id: string) => {
    try {
      const data = await db.getProduct(id);
      return data ? mapDbProductToAppProduct(data) : null;
    } catch (error) {
      showError('Failed to load product', error instanceof Error ? error.message : undefined);
      return null;
    }
  }, [showError, mapDbProductToAppProduct]);

  const searchProducts = useCallback(async (query: string) => {
    try {
      setLoading(true);
      const response = await db.getProducts({ search: query, limit: 50 });
      setProducts(response.data.map(mapDbProductToAppProduct));
      setPagination(response.pagination);
    } catch (error) {
      showError('Search failed', error instanceof Error ? error.message : undefined);
    } finally {
      setLoading(false);
    }
  }, [showError, mapDbProductToAppProduct]);

  const filterByCategory = useCallback(async (categoryId: string) => {
    try {
      setLoading(true);
      const response = await db.getProducts({ categoryId, limit: 50 });
      setProducts(response.data.map(mapDbProductToAppProduct));
      setPagination(response.pagination);
    } catch (error) {
      showError('Filter failed', error instanceof Error ? error.message : undefined);
    } finally {
      setLoading(false);
    }
  }, [showError, mapDbProductToAppProduct]);

  const createProduct = useCallback(async (data: Partial<Product>) => addProduct(data), [addProduct]);

  const updateProduct = useCallback(async (product: Partial<Product> & { id: string }) => {
    try {
      const payload: any = {};
      if (product.name !== undefined) payload.name = product.name;
      if (product.slug !== undefined) payload.slug = product.slug;
      if (product.description !== undefined) payload.description = product.description;
      if (product.shortDescription !== undefined) payload.short_description = product.shortDescription;
      if (product.price !== undefined) payload.price = product.price;
      if (product.originalPrice !== undefined) payload.original_price = product.originalPrice;
      if (product.categoryId !== undefined) payload.category_id = product.categoryId;
      if (product.images !== undefined) payload.images = product.images;
      if (product.stock !== undefined) payload.stock = product.stock;
      if (product.minStockLevel !== undefined) payload.min_stock_level = product.minStockLevel;
      if (product.sku !== undefined) payload.sku = product.sku;
      if (product.weight !== undefined) payload.weight = product.weight;
      if (product.dimensions !== undefined) payload.dimensions = product.dimensions;
      if (product.tags !== undefined) payload.tags = product.tags;
      if (product.specifications !== undefined) payload.specifications = product.specifications;
      if (product.featured !== undefined) payload.is_featured = product.featured;
      if (product.showOnHomepage !== undefined) payload.show_on_homepage = product.showOnHomepage;
      if (product.isActive !== undefined) payload.is_active = product.isActive;
      if (product.metaTitle !== undefined) payload.meta_title = product.metaTitle;
      if (product.metaDescription !== undefined) payload.meta_description = product.metaDescription;

      console.log(`[ProductContext] Updating product ${product.id}`, payload);
      
      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', product.id)
        .select()
        .single();
        
      if (error) {
        console.error('[ProductContext] Error updating product:', error);
        throw error;
      }
      
      console.log('[ProductContext] Product updated successfully:', data);
      
      // Refetch all to ensure consistency across homepage/catalog
      await Promise.all([
        fetchProducts(pagination?.page || 1, 20, undefined),
        fetchFeaturedProducts(8),
        fetchLatestProducts(8),
        fetchBestSellers(8)
      ]);
      
      return mapDbProductToAppProduct(data);
    } catch (error) {
      showError('Failed to update product', error instanceof Error ? error.message : undefined);
      throw error;
    }
  }, [showError, fetchProducts, fetchFeaturedProducts, fetchLatestProducts, fetchBestSellers, pagination, mapDbProductToAppProduct]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      // Remove FK references before deleting the product to avoid integrity constraint violations
      await Promise.allSettled([
        supabase.from('cart_items').delete().eq('product_id', id),
        supabase.from('wishlist_items').delete().eq('product_id', id),
        supabase.from('order_items').delete().eq('product_id', id),
        supabase.from('reviews').delete().eq('product_id', id),
      ]);

      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      
      // Refetch all to ensure consistency across homepage/catalog
      await Promise.all([
        fetchProducts(pagination?.page || 1, 20, undefined),
        fetchFeaturedProducts(8),
        fetchLatestProducts(8),
        fetchBestSellers(8)
      ]);
    } catch (error) {
      showError('Failed to delete product', error instanceof Error ? error.message : undefined);
      throw error;
    }
  }, [showError, fetchProducts, fetchFeaturedProducts, fetchLatestProducts, fetchBestSellers, pagination]);

  const createCategory = useCallback(async (data: Partial<Category>) => {
    try {
      const { data: category, error } = await supabase
        .from('categories')
        .insert([{ name: data.name, slug: data.slug, description: data.description, image_url: data.imageUrl, parent_id: data.parentId, is_active: data.isActive, sort_order: data.sortOrder }])
        .select()
        .single();
      if (error) throw error;
      await fetchCategories();
      return mapDbCategoryToAppCategory(category);
    } catch (error) {
      showError('Failed to create category', error instanceof Error ? error.message : undefined);
      throw error;
    }
  }, [showError, fetchCategories, mapDbCategoryToAppCategory]);

  const updateCategory = useCallback(async (id: string, data: Partial<Category>) => {
    try {
      const { data: category, error } = await supabase
        .from('categories')
        .update({ name: data.name, slug: data.slug, description: data.description, image_url: data.imageUrl, parent_id: data.parentId, is_active: data.isActive, sort_order: data.sortOrder })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await fetchCategories();
      return mapDbCategoryToAppCategory(category);
    } catch (error) {
      showError('Failed to update category', error instanceof Error ? error.message : undefined);
      throw error;
    }
  }, [showError, fetchCategories, mapDbCategoryToAppCategory]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      await fetchCategories();
    } catch (error) {
      showError('Failed to delete category', error instanceof Error ? error.message : undefined);
      throw error;
    }
  }, [showError, fetchCategories]);

  const nextPage     = useCallback(() => { if (pagination?.page < pagination?.pages) fetchProducts(pagination.page + 1); }, [pagination, fetchProducts]);
  const previousPage = useCallback(() => { if (pagination?.page > 1) fetchProducts(pagination.page - 1); }, [pagination, fetchProducts]);
  const goToPage     = useCallback((page: number) => { if (page >= 1 && page <= pagination?.pages) fetchProducts(page); }, [pagination, fetchProducts]);

  // ── Initial data load — fire once, sequenced to avoid auth lock contention ──
  // All 5 Supabase calls used to fire simultaneously via Promise.all, causing
  // them to compete for the GoTrue auth token lock and triggering the
  // "Lock was not released within 5000ms" warning.
  //
  // Fix: categories + products first (needed for immediate render), then the
  // remaining sections staggered with a small delay so the lock is free.
  useEffect(() => {
    if (initFetched.current) return;
    initFetched.current = true;

    // Phase 1: critical data — show UI immediately
    Promise.all([
      fetchCategories(),
      fetchProducts(1, 20, undefined),
      fetchFeaturedProducts(8),
    ]).then(() => {
      // Phase 2: below-the-fold sections — fetch after lock is free
      fetchLatestProducts(8);
      fetchBestSellers(8);
    });

    return () => { initFetched.current = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value: ProductContextType = {
    products, featuredProducts, bestSellers, latestProducts, categories,
    loading, featuredLoading, bestSellersLoading, latestLoading, pagination,
    fetchProducts, fetchFeaturedProducts, fetchBestSellers, fetchLatestProducts,
    fetchReviewsForProduct, fetchCategories,
    addProduct, submitReview, getProductById, searchProducts, filterByCategory,
    createProduct, updateProduct, deleteProduct,
    createCategory, updateCategory, deleteCategory,
    nextPage, previousPage, goToPage
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
