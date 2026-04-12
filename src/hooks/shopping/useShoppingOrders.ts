import { useState, useCallback, useEffect } from 'react';
import { Order, CartItem, Address } from '../../types';
import { supabase, db } from '../../lib/supabase';
import { mapDbOrderToAppOrder } from '../../utils/shoppingMapper';
import * as optimized from '../../lib/optimized-queries';

export const useShoppingOrders = (user: any, showNotification: any) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserOrders = useCallback(async () => {
    if (!user) { setOrders([]); return; }
    setLoading(true);
    try {
      // Use optimized active orders function
      const data = await optimized.getUserActiveOrders(user.id);
      
      // Map optimized summary to order list (might need fallback for full items if needed in list)
      setOrders(data.map(d => ({ ...d, items: [] } as unknown as Order)));
    } catch (error) {
      console.error('Error fetching orders:', error);
      showNotification({ type: 'error', title: 'Error', message: 'Failed to load orders. Please try again later.' });
    } finally { setLoading(false); }
  }, [user, showNotification]);

  useEffect(() => { fetchUserOrders(); }, [fetchUserOrders]);

  const createOrder = async (items: CartItem[], shippingAddress: Address, paymentMethod: string, total: number, razorpay_order_id?: string): Promise<string | null> => {
    if (!user) {
      showNotification({ type: 'error', title: 'Authentication Required', message: 'Please log in to place an order' });
      return null;
    }
    setLoading(true);
    try {
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const shippingAmount = total > 1000 ? 0 : 50;
      const taxAmount = subtotal * 0.18;

      const orderData = {
        user_id: user.id, order_number: orderNumber, total_amount: total,
        subtotal, tax_amount: taxAmount, shipping_amount: shippingAmount,
        status: 'pending', payment_status: 'pending', payment_method: paymentMethod,
        razorpay_order_id, shipping_address: shippingAddress, billing_address: shippingAddress,
      };

      const { data: order, error: orderError } = await supabase.from('orders').insert([orderData]).select().single();
      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id, product_id: item.product.id, variant_id: item.variantId,
        quantity: item.quantity, unit_price: item.product.price, 
        total_price: item.product.price * item.quantity, product_snapshot: item.product
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      await db.clearCart(user.id);
      await fetchUserOrders();
      showNotification({ type: 'success', title: 'Order Placed!', message: `Order ${orderNumber} created successfully.` });
      return order.id;
    } catch (error) {
      console.error('Error creating order:', error);
      showNotification({ type: 'error', title: 'Order Failed', message: 'Failed to create order. Please try again.' });
      return null;
    } finally { setLoading(false); }
  };

  const updateOrderStatus = async (orderId: string, status: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
      if (error) throw error;
      await fetchUserOrders();
      return true;
    } catch (error) { console.error('Error updating order status:', error); return false; }
  };

  const getOrderById = async (orderId: string): Promise<Order | null> => {
    try {
      const { data, error } = await supabase.from('orders').select('*, order_items(*, products(*))').eq('id', orderId).single();
      if (error) throw error;
      return mapDbOrderToAppOrder(data);
    } catch (error) { console.error('Error fetching order:', error); return orders.find(o => o.id === orderId) || null; }
  };

  const getUserOrders = async (userId?: string): Promise<Order[]> => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return [];
    try {
      const { data, error } = await supabase.from('orders').select('*, order_items(*, products(*))').eq('user_id', targetUserId).order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(mapDbOrderToAppOrder);
    } catch (error) { console.error('Error fetching user orders:', error); return []; }
  };

  return { orders, loading, createOrder, updateOrderStatus, getOrderById, getUserOrders };
};
