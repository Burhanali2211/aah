-- Optimized User Dashboard Stats Function
-- Provides all dashboard data in a single high-performance query
-- Uses indexes on orders(user_id) and other tables

CREATE OR REPLACE FUNCTION get_user_dashboard_stats(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_orders INT;
    v_pending_orders INT;
    v_delivered_orders INT;
    v_total_spent NUMERIC;
    v_wishlist_count INT;
    v_address_count INT;
    v_recent_orders JSONB;
BEGIN
    -- Query 1: Basic Stats from Orders (Fast indexed lookup)
    SELECT 
        COUNT(*), 
        COUNT(*) FILTER (WHERE status IN ('pending', 'processing', 'shipped')),
        COUNT(*) FILTER (WHERE status = 'delivered'),
        COALESCE(SUM(total_amount), 0)
    INTO v_total_orders, v_pending_orders, v_delivered_orders, v_total_spent
    FROM orders
    WHERE user_id = p_user_id;

    -- Query 2: Wishlist Count
    SELECT COUNT(*) INTO v_wishlist_count FROM wishlist_items WHERE user_id = p_user_id;
    
    -- Query 3: Address Count
    SELECT COUNT(*) INTO v_address_count FROM addresses WHERE user_id = p_user_id;

    -- Query 4: Recent Orders (Subquery to get item counts efficiently)
    SELECT jsonb_agg(sub) INTO v_recent_orders
    FROM (
        SELECT 
            o.id, 
            o.order_number as "orderNumber", 
            o.status, 
            o.total_amount as total, 
            o.created_at as "createdAt",
            (SELECT COUNT(*)::INTEGER FROM order_items WHERE order_id = o.id) as "itemCount"
        FROM orders o
        WHERE o.user_id = p_user_id
        ORDER BY o.created_at DESC
        LIMIT 3
    ) sub;

    RETURN jsonb_build_object(
        'totalOrders', v_total_orders,
        'pendingOrders', v_pending_orders,
        'deliveredOrders', v_delivered_orders,
        'totalSpent', v_total_spent,
        'wishlistCount', v_wishlist_count,
        'addressCount', v_address_count,
        'recentOrders', COALESCE(v_recent_orders, '[]'::jsonb)
    );
END;
$$;
