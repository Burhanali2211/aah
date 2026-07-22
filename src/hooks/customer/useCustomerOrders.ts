import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { mapDbOrderToAppOrder } from '@/utils/shoppingMapper';

export const useCustomerOrders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customer', 'orders', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data: ordersData, error: ordErr } = await supabase
        .from('orders')
        .select(`
          id, 
          order_number, 
          status, 
          payment_status, 
          payment_method, 
          total_amount, 
          created_at, 
          shipping_address,
          order_items (
            id,
            products (
              name,
              images
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordErr) throw ordErr;

      return (ordersData || []).map(mapDbOrderToAppOrder);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
