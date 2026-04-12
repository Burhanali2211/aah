import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface EdgeFunctionResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Call an Edge Function with automatic Bearer token attachment.
 * Reads current session and attaches Authorization header if authenticated.
 */
async function callFunction<T = any>(
  functionName: string,
  payload: Record<string, any>
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const result: EdgeFunctionResponse<T> = await response.json();

  if (!response.ok || result.error) {
    throw new Error(result.error || 'Request failed');
  }

  return result.data as T;
}

/**
 * Product mutations API — create, update, delete products.
 * Requires admin or seller role.
 */
export const productApi = {
  async create(data: any) {
    return callFunction('product-mutations', {
      action: 'create-product',
      data,
    });
  },

  async update(data: any) {
    return callFunction('product-mutations', {
      action: 'update-product',
      data,
    });
  },

  async delete(productId: string) {
    return callFunction('product-mutations', {
      action: 'delete-product',
      data: { productId },
    });
  },

  async bulkUpdate(productIds: string[], updates: any) {
    return callFunction('product-mutations', {
      action: 'bulk-update',
      data: { productIds, updates },
    });
  },
};

/**
 * Order mutations API — create orders, update status, track shipments.
 * Create: any authenticated user. Update status: admin/seller only.
 */
export const orderApi = {
  async createOrder(orderData: any) {
    return callFunction('order-mutations', {
      action: 'create-order',
      data: orderData,
    });
  },

  async updateStatus(orderId: string, status: string, trackingNumber?: string) {
    return callFunction('order-mutations', {
      action: 'update-status',
      data: { orderId, status, trackingNumber },
    });
  },
};

export default {
  productApi,
  orderApi,
};
