import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import {
  CartItem, CartContextType,
  Product, WishlistItem, WishlistContextType,
  Order, OrderContextType, OrderItem,
  Address, AddressContextType
} from '../types';
import { supabase, db } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

// Merged context type combining Cart + Wishlist + Order + Address
// Note: We don't extend directly due to conflicting property names (addItem, removeItem)
// Instead, we pick the properties we need from each
export interface ShoppingContextType extends CartContextType, OrderContextType, AddressContextType {
  // Wishlist properties (prefixed to avoid conflicts with Cart)
  wishedItems: WishlistItem[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
}

const ShoppingContext = createContext<ShoppingContextType | undefined>(undefined);

export const useShopping = () => {
  const context = useContext(ShoppingContext);
  if (!context) throw new Error('useShopping must be used within a ShoppingProvider');
  return context;
};

// Backward compatibility hooks
export const useCart = () => {
  const context = useShopping();
  return {
    items: context.items,
    loading: context.loading,
    total: context.total,
    itemCount: context.itemCount,
    addItem: context.addItem,
    updateQuantity: context.updateQuantity,
    removeItem: context.removeItem,
    removeFromCart: context.removeFromCart,
    clearCart: context.clearCart
  };
};

export const useWishlist = () => {
  const context = useShopping();
  return {
    items: context.wishedItems,
    addItem: context.addToWishlist,
    removeItem: context.removeFromWishlist,
    isInWishlist: context.isInWishlist,
    clearWishlist: context.clearWishlist,
    loading: context.loading
  };
};

export const useOrders = () => {
  const context = useShopping();
  return {
    orders: context.orders,
    loading: context.loading,
    createOrder: context.createOrder,
    updateOrderStatus: context.updateOrderStatus,
    getOrderById: context.getOrderById,
    getUserOrders: context.getUserOrders
  };
};

export const useAddresses = () => {
  const context = useShopping();
  return {
    addresses: context.addresses,
    addAddress: context.addAddress,
    updateAddress: context.updateAddress,
    deleteAddress: context.deleteAddress,
    setDefaultAddress: context.setDefaultAddress,
    fetchAddresses: context.fetchAddresses,
    loading: context.loading
  };
};

interface ShoppingProviderProps {
  children: ReactNode;
}

export const ShoppingProvider: React.FC<ShoppingProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [guestCart, setGuestCart] = useState<CartItem[]>([]);

  // Wishlist state
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Loading state
  const [loading, setLoading] = useState(false);

  // ==================== CART OPERATIONS ====================

  const mapDbCartItemToAppCartItem = (dbItem: any): CartItem => ({
    id: dbItem.id,
    product: {
      id: dbItem.products.id,
      name: dbItem.products.name,
      price: dbItem.products.price,
      images: dbItem.products.images || [],
      description: dbItem.products.description,
      categoryId: dbItem.products.category_id,
      sellerId: dbItem.products.seller_id,
      stock: dbItem.products.stock,
      rating: dbItem.products.rating || 0,
      reviewCount: dbItem.products.review_count || 0,
      featured: dbItem.products.is_featured || false,
      showOnHomepage: dbItem.products.show_on_homepage || false,
      reviews: [],
      tags: dbItem.products.tags || [],
      sellerName: dbItem.products.seller_name || 'Aligarh Attars',
      createdAt: new Date(dbItem.products.created_at)
    },
    productId: dbItem.product_id,
    variantId: dbItem.variant_id,
    quantity: dbItem.quantity,
    unitPrice: dbItem.unit_price,
    totalPrice: dbItem.total_price,
    createdAt: new Date(dbItem.created_at),
    updatedAt: dbItem.updated_at ? new Date(dbItem.updated_at) : undefined,
  });

  const loadGuestCart = useCallback(() => {
    try {
      const savedCart = localStorage.getItem('guestCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setGuestCart(parsedCart);
        return parsedCart;
      }
    } catch (error) {
      console.error('Error loading guest cart:', error);
    }
    return [];
  }, []);

  const saveGuestCart = useCallback((cartItems: CartItem[]) => {
    try {
      localStorage.setItem('guestCart', JSON.stringify(cartItems));
      setGuestCart(cartItems);
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      if (user) {
        const data = await db.getCart(user.id);
        setCartItems(data.map(mapDbCartItemToAppCartItem));
      } else {
        const guestItems = loadGuestCart();
        setCartItems(guestItems);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      showNotification({ type: 'error', title: 'Error', message: 'Failed to load cart' });
      setCartItems([]);
    }
  }, [user, loadGuestCart, showNotification]);

  const mergeGuestCartWithUserCart = useCallback(async () => {
    if (user && guestCart.length > 0) {
      try {
        for (const item of guestCart) {
          await db.addToCart(user.id, item.product.id, item.quantity);
        }
        localStorage.removeItem('guestCart');
        setGuestCart([]);
        await fetchCart();
      } catch (error) {
        console.error('Error merging cart:', error);
      }
    }
  }, [user, guestCart, fetchCart]);

  useEffect(() => {
    if (user) {
      mergeGuestCartWithUserCart();
    } else {
      loadGuestCart();
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = useCallback(async (product: Product, quantity: number = 1, variantId?: string) => {
    try {
      if (user) {
        const existingItem = cartItems.find(
          item => item.product.id === product.id && item.variantId === variantId
        );
        if (existingItem && existingItem.id) {
          await db.updateCartItem(existingItem.id, existingItem.quantity + quantity);
        } else {
          await db.addToCart(user.id, product.id, quantity);
        }
        await fetchCart();
      } else {
        const existingItemIndex = guestCart.findIndex(
          item => item.product.id === product.id && item.variantId === variantId
        );

        let updatedCart: CartItem[];
        if (existingItemIndex >= 0) {
          updatedCart = guestCart.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          const newItem: CartItem = {
            id: `guest-${Date.now()}`,
            product,
            productId: product.id,
            quantity,
            variantId,
          };
          updatedCart = [...guestCart, newItem];
        }

        saveGuestCart(updatedCart);
        setCartItems(updatedCart);
      }
      showNotification({ type: 'success', title: 'Added to Cart', message: `${product.name} added to cart.` });
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification({ type: 'error', title: 'Error', message: 'Failed to add to cart' });
    }
  }, [user, cartItems, guestCart, fetchCart, saveGuestCart, showNotification]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      if (user) {
        if (!itemId.startsWith('guest-')) {
          await db.updateCartItem(itemId, quantity);
          await fetchCart();
        }
      } else {
        const updatedCart = guestCart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
        saveGuestCart(updatedCart);
        setCartItems(updatedCart);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      showNotification({ type: 'error', title: 'Error', message: 'Failed to update quantity' });
    }
  }, [user, guestCart, fetchCart, saveGuestCart, showNotification]);

  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      if (user && !itemId.startsWith('guest-')) {
        await db.removeFromCart(itemId);
        await fetchCart();
      } else {
        const updatedCart = guestCart.filter(item => item.id !== itemId);
        saveGuestCart(updatedCart);
        setCartItems(updatedCart);
      }
      showNotification({ type: 'info', title: 'Removed', message: 'Item removed from cart.' });
    } catch (error) {
      console.error('Error removing from cart:', error);
      showNotification({ type: 'error', title: 'Error', message: 'Failed to remove from cart' });
    }
  }, [user, guestCart, fetchCart, saveGuestCart, showNotification]);

  const clearCart = useCallback(async () => {
    try {
      if (user) {
        await db.clearCart(user.id);
      }
      localStorage.removeItem('guestCart');
      setCartItems([]);
      setGuestCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      showNotification({ type: 'error', title: 'Error', message: 'Failed to clear cart' });
    }
  }, [user, showNotification]);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = useCallback(async (product: Product, quantity: number = 1, variantId?: string) => {
    await addToCart(product, quantity, variantId);
  }, [addToCart]);

  const removeItem = useCallback(async (productId: string, variantId?: string) => {
    const itemToRemove = cartItems.find(item =>
      item.product.id === productId &&
      (variantId ? item.variantId === variantId : !item.variantId)
    );
    if (itemToRemove && itemToRemove.id) {
      await removeFromCart(itemToRemove.id);
    }
  }, [cartItems, removeFromCart]);

  const updateItemQuantity = useCallback(async (productId: string, quantity: number, variantId?: string) => {
    const itemToUpdate = cartItems.find(item =>
      item.product.id === productId &&
      (variantId ? item.variantId === variantId : !item.variantId)
    );
    if (itemToUpdate && itemToUpdate.id) {
      await updateQuantity(itemToUpdate.id, quantity);
    }
  }, [cartItems, updateQuantity]);

  // ==================== WISHLIST OPERATIONS ====================

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*, products(*)')
        .eq('user_id', user.id);

      if (error) throw error;

      const items = (data || []).map((item: any) => ({
        id: item.id,
        product: {
          id: item.products.id,
          name: item.products.name,
          slug: item.products.slug,
          description: item.products.description,
          shortDescription: item.products.short_description,
          price: Number(item.products.price),
          originalPrice: item.products.original_price ? Number(item.products.original_price) : undefined,
          images: item.products.images || [],
          stock: Number(item.products.stock),
          rating: Number(item.products.rating || 0),
          reviewCount: Number(item.products.review_count || 0),
          featured: item.products.is_featured,
          categoryId: item.products.category_id,
          sellerId: item.products.seller_id,
          sellerName: item.products.seller_name || 'Aligarh Attars',
          tags: item.products.tags || [],
          reviews: [],
          showOnHomepage: item.products.show_on_homepage || false,
          createdAt: new Date(item.products.created_at)
        },
        productId: item.product_id,
        createdAt: new Date(item.created_at)
      }));
      setWishlistItems(items);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch wishlist items.'
      });
    }
  }, [user, showNotification]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (product: Product) => {
    if (!user) {
      showNotification({
        type: 'info',
        title: 'Authentication Required',
        message: 'Please log in to add items to your wishlist.'
      });
      return;
    }

    const alreadyInWishlist = isInWishlist(product.id);

    if (alreadyInWishlist) {
      await removeFromWishlist(product.id);
    } else {
      try {
        const { error } = await supabase
          .from('wishlist_items')
          .insert([{ user_id: user.id, product_id: product.id }]);

        if (error) throw error;

        await fetchWishlist();
        showNotification({ type: 'success', title: 'Added to Wishlist', message: `${product.name} added to your wishlist.` });
      } catch (error: any) {
        console.error('Error adding to wishlist:', error);
        showNotification({ type: 'error', title: 'Error', message: 'Failed to add item to wishlist.' });
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      await fetchWishlist();
      showNotification({ type: 'info', title: 'Removed', message: 'Item removed from your wishlist.' });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showNotification({ type: 'error', title: 'Error', message: 'Failed to remove item.' });
    }
  };

  const isInWishlist = (productId: string) => wishlistItems.some(item => item.product.id === productId);

  const clearWishlist = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setWishlistItems([]);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      showNotification({ type: 'error', title: 'Error', message: 'Failed to clear wishlist.' });
    }
  };

  // ==================== ORDER OPERATIONS ====================

  const mapDbOrderToAppOrder = (dbOrder: any): Order => ({
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    userId: dbOrder.user_id,
    items: (dbOrder.order_items || []).map((item: any) => ({
      id: item.id,
      orderId: item.order_id,
      productId: item.product_id,
      variantId: item.variant_id,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
      productSnapshot: item.product_snapshot,
      createdAt: new Date(item.created_at),
      product: item.products ? {
        id: item.products.id,
        name: item.products.name,
        price: item.products.price,
        images: item.products.images || [],
      } : undefined
    })),
    total: dbOrder.total_amount,
    subtotal: dbOrder.subtotal,
    taxAmount: dbOrder.tax_amount,
    shippingAmount: dbOrder.shipping_amount,
    discountAmount: dbOrder.discount_amount,
    status: dbOrder.status,
    paymentStatus: dbOrder.payment_status,
    paymentMethod: dbOrder.payment_method,
    paymentId: dbOrder.payment_id,
    currency: dbOrder.currency || 'INR',
    shippingAddress: dbOrder.shipping_address,
    billingAddress: dbOrder.billing_address,
    notes: dbOrder.notes,
    trackingNumber: dbOrder.tracking_number,
    shippedAt: dbOrder.shipped_at ? new Date(dbOrder.shipped_at) : undefined,
    deliveredAt: dbOrder.delivered_at ? new Date(dbOrder.delivered_at) : undefined,
    createdAt: new Date(dbOrder.created_at),
    updatedAt: dbOrder.updated_at ? new Date(dbOrder.updated_at) : undefined,
  });

  const fetchUserOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data.map(mapDbOrderToAppOrder));
    } catch (error) {
      console.error('Error fetching orders:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load orders. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  }, [user, showNotification]);

  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  const createOrder = async (
    items: CartItem[],
    shippingAddress: Address,
    paymentMethod: string,
    total: number,
    razorpay_order_id?: string
  ): Promise<string | null> => {
    if (!user) {
      showNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in to place an order'
      });
      return null;
    }

    setLoading(true);
    try {
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const shippingAmount = total > 1000 ? 0 : 50;
      const taxAmount = subtotal * 0.18;

      const orderData = {
        user_id: user.id,
        order_number: orderNumber,
        total_amount: total,
        subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        status: 'pending',
        payment_status: 'pending',
        payment_method: paymentMethod,
        razorpay_order_id: razorpay_order_id,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        variant_id: item.variantId,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
        product_snapshot: item.product
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await db.clearCart(user.id);

      await fetchUserOrders();
      showNotification({
        type: 'success',
        title: 'Order Placed!',
        message: `Order ${orderNumber} created successfully.`
      });

      return order.id;
    } catch (error) {
      console.error('Error creating order:', error);
      showNotification({
        type: 'error',
        title: 'Order Failed',
        message: 'Failed to create order. Please try again.'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      await fetchUserOrders();
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  };

  const getOrderById = async (orderId: string): Promise<Order | null> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return mapDbOrderToAppOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      return orders.find(o => o.id === orderId) || null;
    }
  };

  const getUserOrders = async (userId?: string): Promise<Order[]> => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return [];

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(mapDbOrderToAppOrder);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  };

  // ==================== ADDRESS OPERATIONS ====================

  const mapDbAddressToAppAddress = (dbAddress: any): Address => ({
    id: dbAddress.id,
    userId: dbAddress.user_id,
    fullName: dbAddress.full_name,
    streetAddress: dbAddress.street_address,
    city: dbAddress.city,
    state: dbAddress.state,
    postalCode: dbAddress.postal_code,
    country: dbAddress.country,
    phone: dbAddress.phone,
    isDefault: dbAddress.is_default,
    type: dbAddress.type,
    createdAt: new Date(dbAddress.created_at),
    updatedAt: dbAddress.updated_at ? new Date(dbAddress.updated_at) : undefined,
  });

  const fetchAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      return;
    }

    setLoading(true);
    try {
      const data = await db.getAddresses(user.id);
      setAddresses(data.map(mapDbAddressToAppAddress));
    } catch (error) {
      console.error('Error fetching addresses:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch addresses'
      });
    } finally {
      setLoading(false);
    }
  }, [user, showNotification]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = async (address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      showNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in to add an address'
      });
      return;
    }

    try {
      const addressData = {
        user_id: user.id,
        full_name: address.fullName,
        street_address: address.streetAddress,
        city: address.city,
        state: address.state,
        postal_code: address.postalCode,
        country: address.country,
        phone: address.phone,
        is_default: address.isDefault || false,
        type: address.type || 'shipping'
      };

      await db.createAddress(addressData);
      await fetchAddresses();
      showNotification({
        type: 'success',
        title: 'Address Added',
        message: 'Your address has been added successfully'
      });
    } catch (error) {
      console.error('Error adding address:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add address'
      });
    }
  };

  const updateAddress = async (address: Address) => {
    if (!address.id) return;

    try {
      const addressData = {
        full_name: address.fullName,
        street_address: address.streetAddress,
        city: address.city,
        state: address.state,
        postal_code: address.postalCode,
        country: address.country,
        phone: address.phone,
        is_default: address.isDefault,
        type: address.type
      };

      await db.updateAddress(address.id, addressData);
      await fetchAddresses();
      showNotification({
        type: 'success',
        title: 'Address Updated',
        message: 'Your address has been updated successfully'
      });
    } catch (error) {
      console.error('Error updating address:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update address'
      });
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      await db.deleteAddress(addressId);
      await fetchAddresses();
      showNotification({
        type: 'success',
        title: 'Address Deleted',
        message: 'Your address has been deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete address'
      });
    }
  };

  const setDefaultAddress = async (addressId: string, type: 'shipping' | 'billing') => {
    if (!user) return;

    try {
      await db.setDefaultAddress(user.id, addressId);
      await fetchAddresses();
      showNotification({
        type: 'success',
        title: 'Default Address Set',
        message: `Default ${type} address has been updated`
      });
    } catch (error) {
      console.error('Error setting default address:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to set default address'
      });
    }
  };

  // ==================== MERGED CONTEXT VALUE ====================

  const value: ShoppingContextType = {
    // Cart
    items: cartItems,
    loading,
    total: subtotal,
    itemCount,
    addItem,
    updateQuantity: updateItemQuantity,
    removeItem,
    removeFromCart,
    clearCart,

    // Wishlist (with proper property names to avoid conflicts)
    wishedItems: wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,

    // Orders
    orders,
    createOrder,
    updateOrderStatus,
    getOrderById,
    getUserOrders,

    // Addresses
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    fetchAddresses
  };

  return (
    <ShoppingContext.Provider value={value}>
      {children}
    </ShoppingContext.Provider>
  );
};
