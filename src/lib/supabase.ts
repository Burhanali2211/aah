import { createClient } from '@supabase/supabase-js';
import { queryWithRetry, fetchWithRetry } from './retryFetch';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Public-safe product fields (excludes internal/pricing fields like seller_id, min_stock_level, cost_price, etc.)
const PRODUCT_PUBLIC_FIELDS = [
  'id', 'name', 'slug', 'description', 'short_description',
  'price', 'original_price', 'category_id',
  'images', 'stock', 'sku', 'weight', 'dimensions',
  'tags', 'specifications', 'rating', 'review_count',
  'is_featured', 'show_on_homepage', 'is_active',
  'meta_title', 'meta_description',
  'scent_notes', 'longevity', 'sillage', 'fragrance_family',
  'gender_profile', 'occasion', 'season', 'perfumer_story',
  'origin', 'grade', 'packaging_options', 'shelf_life',
  'certifications', 'usage_tips', 'culinary_uses', 'health_benefits',
  'created_at', 'updated_at'
].join(', ');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Single shared client — never call createClient() anywhere else in the app.
const getSupabaseConfig = () => {
  const config = {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: 'sb-aligarh-auth-token',
    },
    global: {
      fetch: (...args: any[]) => {
        const [url, config] = args;
        return fetch(url, { ...config, cache: 'no-store' });
      }
    }
  };

  // If we are on a refresh and the recovery flag was set in main.tsx, 
  // we must purge the token BEFORE createClient is called to prevent the internal lock hang.
  if (typeof window !== 'undefined') {
    const entries = performance.getEntriesByType("navigation");
    const isRefresh = entries.length > 0 && (entries[0] as PerformanceNavigationTiming).type === 'reload';
    if (isRefresh && sessionStorage.getItem('sb_recovery_active')) {
      console.warn('[SUPABASE] Recovery mode active. Purging session token to prevent hang.');
      localStorage.removeItem('sb-aligarh-auth-token');
    }
  }

  return config;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, getSupabaseConfig());


// Helper functions for common operations
export const db = {
  // Products
  async getProducts(params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    featured?: boolean;
    bestSellers?: boolean;
    latest?: boolean;
    showOnHomepage?: boolean;
    sellerId?: string;
  }) {
    return fetchWithRetry(async () => {
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const offset = (page - 1) * limit;

      // Use count only for paginated list pages, not homepage sections
      const needsCount = !params?.featured && !params?.bestSellers && !params?.latest && !params?.showOnHomepage;

      let query = supabase
        .from('products')
        .select(PRODUCT_PUBLIC_FIELDS, needsCount ? { count: 'exact' } : undefined);

      if (params?.categoryId) query = query.eq('category_id', params.categoryId);
      if (params?.featured)    query = query.eq('is_featured', true);
      if (params?.showOnHomepage) query = query.eq('show_on_homepage', true);
      if (params?.sellerId)    query = query.eq('seller_id', params.sellerId);

      if (params?.search) {
        query = query.ilike('name', `%${params.search}%`);
      }

      // bestSellers: order by rating desc, then review_count desc
      if (params?.bestSellers) {
        query = query.order('rating', { ascending: false });
      } else if (params?.latest) {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      };
    }, { maxAttempts: 3 });
  },

  async getProduct(id: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) return null;

    // Full select for detail page — needs description, specifications etc.
    return queryWithRetry(async () => await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single(), { maxAttempts: 3 });
  },

  async getFeaturedProducts(limit = 8) {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_PUBLIC_FIELDS)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getLatestProducts(limit = 8) {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_PUBLIC_FIELDS)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getHomepageProducts(limit = 4) {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_PUBLIC_FIELDS)
      .eq('show_on_homepage', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Categories
  async getCategories() {
    return queryWithRetry(async () => await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true }), { maxAttempts: 3 });
  },

  async getCategory(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Public Settings
  async getPublicSettings() {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('is_public', true);
    
    if (error) throw error;
    return data;
  },

  async getSocialMedia() {
    const { data, error } = await supabase
      .from('social_media_accounts')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getContactInfo() {
    const { data, error } = await supabase
      .from('contact_information')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getFooterLinks() {
    const { data, error } = await supabase
      .from('footer_links')
      .select('*')
      .eq('is_active', true)
      .order('section_name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getBusinessHours() {
    const { data, error } = await supabase
      .from('business_hours')
      .select('*')
      .order('day_of_week', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Combined public settings
  async getAllPublicSettings() {
    try {
      const [settings, social, contact, footer, hours] = await Promise.all([
        this.getPublicSettings(),
        this.getSocialMedia(),
        this.getContactInfo(),
        this.getFooterLinks(),
        this.getBusinessHours(),
      ]);

      return {
        siteSettings: settings,
        socialMedia: social,
        contactInfo: contact,
        footerLinks: footer,
        businessHours: hours,
      };
    } catch (error) {
      console.error('Error fetching public settings:', error);
      throw error;
    }
  },

  // Cart
  async getCart(userId: string) {
    return queryWithRetry(async () => await supabase
        .from('cart_items')
        .select(`*, products(${PRODUCT_PUBLIC_FIELDS})`)
        .eq('user_id', userId), { maxAttempts: 3 });
  },

  async addToCart(userId: string, productId: string, quantity: number) {
    const { data, error } = await supabase
      .from('cart_items')
      .insert([{ user_id: userId, product_id: productId, quantity }])
      .select();
    
    if (error) throw error;
    return data;
  },

  async updateCartItem(cartItemId: string, quantity: number) {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .select();
    
    if (error) throw error;
    return data;
  },

  async removeFromCart(cartItemId: string) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);
    
    if (error) throw error;
  },

  async clearCart(userId: string) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  // Orders
  async getOrders(userId: string) {
    return queryWithRetry(async () => await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }), { maxAttempts: 3 });
  },

  async getOrder(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createOrder(orderData: any) {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async createOrderItems(items: any[]) {
    const { data, error } = await supabase
      .from('order_items')
      .insert(items)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Addresses
  async getAddresses(userId: string) {
    return queryWithRetry(async () => await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId), { maxAttempts: 3 });
  },

  async createAddress(addressData: any) {
    const { data, error } = await supabase
      .from('addresses')
      .insert([addressData])
      .select();
    
    if (error) throw error;
    return data;
  },

  async updateAddress(addressId: string, addressData: any) {
    const { data, error } = await supabase
      .from('addresses')
      .update(addressData)
      .eq('id', addressId)
      .select();
    
    if (error) throw error;
    return data;
  },

  async deleteAddress(addressId: string) {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId);
    
    if (error) throw error;
  },

  async setDefaultAddress(userId: string, addressId: string) {
    // Step 1: find the current default so we can restore it if step 2 fails
    const { data: currentDefault } = await supabase
      .from('addresses')
      .select('id')
      .eq('user_id', userId)
      .eq('is_default', true)
      .maybeSingle();

    // Step 2: clear all defaults
    const { error: resetError } = await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);

    if (resetError) throw resetError;

    // Step 3: set the new default — restore previous on failure
    const { data, error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .select();

    if (error) {
      // Restore the previous default to avoid leaving user with no default address
      if (currentDefault?.id) {
        await supabase
          .from('addresses')
          .update({ is_default: true })
          .eq('id', currentDefault.id);
      }
      throw error;
    }
    return data;
  },
};

export default supabase;
