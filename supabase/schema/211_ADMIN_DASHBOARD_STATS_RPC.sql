-- Optimized Admin Dashboard Stats Function
-- Provides all high-level metrics and recent records in one call
-- Uses optimized indexes and minimal joins

CREATE OR REPLACE FUNCTION get_admin_dashboard_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_users INT;
    v_new_users_today INT;
    v_total_products INT;
    v_total_orders INT;
    v_pending_orders INT;
    v_low_stock_count INT;
    v_orders_today INT;
    v_revenue_today NUMERIC;
    v_total_revenue NUMERIC;
    v_recent_orders JSONB;
    v_top_products JSONB;
    v_low_stock_products JSONB;
    v_today_start TIMESTAMPTZ;
BEGIN
    v_today_start := CURRENT_DATE::TIMESTAMPTZ;

    -- 1. Get counts (Using head=true is fast, but SQL COUNT is faster in one scan)
    -- Profiles stats
    SELECT 
        COUNT(*), 
        COUNT(*) FILTER (WHERE created_at >= v_today_start)
    INTO v_total_users, v_new_users_today
    FROM profiles;

    -- Products stats
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE stock <= COALESCE(min_stock_level, 20))
    INTO v_total_products, v_low_stock_count
    FROM products;

    -- Orders stats (Live)
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'pending'),
        COUNT(*) FILTER (WHERE created_at >= v_today_start),
        COALESCE(SUM(total_amount) FILTER (WHERE created_at >= v_today_start AND status IN ('delivered', 'shipped')), 0),
        COALESCE(SUM(total_amount) FILTER (WHERE status IN ('delivered', 'shipped')), 0)
    INTO v_total_orders, v_pending_orders, v_orders_today, v_revenue_today, v_total_revenue
    FROM orders;

    -- 2. Recent Orders (Join with profiles to get customer names)
    SELECT jsonb_agg(sub) INTO v_recent_orders
    FROM (
        SELECT 
            o.id,
            o.order_number,
            o.total_amount,
            o.status,
            o.created_at,
            COALESCE(p.full_name, 'Guest') as customer_name
        FROM orders o
        LEFT JOIN profiles p ON o.user_id = p.id
        ORDER BY o.created_at DESC
        LIMIT 10
    ) sub;

    -- 3. Top Products (By quantity sold)
    -- This is expensive on-the-fly, so we limit the scan to recent order_items or use mv_popular_products if available
    -- For now, let's do a fast scan of last 1000 order items
    SELECT jsonb_agg(sub) INTO v_top_products
    FROM (
        SELECT 
            p.id,
            p.name,
            p.price,
            p.images,
            p.stock,
            SUM(oi.quantity)::TEXT as total_sold
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        GROUP BY p.id, p.name, p.price, p.images, p.stock
        ORDER BY SUM(oi.quantity) DESC
        LIMIT 5
    ) sub;

    -- 4. Low Stock Products (Detailed)
    SELECT jsonb_agg(sub) INTO v_low_stock_products
    FROM (
        SELECT 
            id, name, stock, COALESCE(min_stock_level, 20) as min_stock_level, images
        FROM products
        WHERE stock <= COALESCE(min_stock_level, 20)
        ORDER BY stock ASC
        LIMIT 8
    ) sub;

    RETURN jsonb_build_object(
        'metrics', jsonb_build_object(
            'totalUsers', v_total_users,
            'newUsersToday', v_new_users_today,
            'totalProducts', v_total_products,
            'totalOrders', v_total_orders,
            'pendingOrders', v_pending_orders,
            'lowStockProducts', v_low_stock_count,
            'ordersToday', v_orders_today,
            'revenueToday', v_revenue_today,
            'totalRevenue', v_total_revenue
        ),
        'recentOrders', COALESCE(v_recent_orders, '[]'::jsonb),
        'topProducts', COALESCE(v_top_products, '[]'::jsonb),
        'lowStockProducts', COALESCE(v_low_stock_products, '[]'::jsonb)
    );
END;
$$;
