-- Optimized Admin Analytics Function
-- Provides trends and top performance metrics over a specific period

CREATE OR REPLACE FUNCTION get_admin_analytics(p_days INT DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_start_date TIMESTAMPTZ;
    v_total_revenue NUMERIC;
    v_total_orders INT;
    v_avg_order_value NUMERIC;
    v_new_users INT;
    v_revenue_trend JSONB;
    v_top_products JSONB;
BEGIN
    v_start_date := NOW() - (p_days || ' days')::INTERVAL;

    -- 1. High-level metrics for the period
    SELECT 
        COALESCE(SUM(total_amount), 0),
        COUNT(*),
        COALESCE(AVG(total_amount), 0)
    INTO v_total_revenue, v_total_orders, v_avg_order_value
    FROM orders
    WHERE created_at >= v_start_date AND status IN ('delivered', 'shipped');

    SELECT COUNT(*) INTO v_new_users
    FROM profiles
    WHERE created_at >= v_start_date;

    -- 2. Revenue Trend (Daily aggregation)
    SELECT jsonb_agg(sub) INTO v_revenue_trend
    FROM (
        SELECT 
            DATE(created_at)::TEXT as date,
            COALESCE(SUM(total_amount), 0) as revenue,
            COUNT(*) as orders
        FROM orders
        WHERE created_at >= v_start_date AND status IN ('delivered', 'shipped')
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ) sub;

    -- 3. Top Products for the period
    SELECT jsonb_agg(sub) INTO v_top_products
    FROM (
        SELECT 
            p.id,
            p.name,
            p.images,
            SUM(oi.quantity * oi.unit_price) as revenue,
            COUNT(DISTINCT o.id) as orders
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at >= v_start_date AND o.status IN ('delivered', 'shipped')
        GROUP BY p.id, p.name, p.images
        ORDER BY revenue DESC
        LIMIT 10
    ) sub;

    RETURN jsonb_build_object(
        'metrics', jsonb_build_object(
            'totalRevenue', v_total_revenue,
            'totalOrders', v_total_orders,
            'avgOrderValue', v_avg_order_value,
            'newUsers', v_new_users,
            'pageViews', 0, -- Placeholders for potential future tracking
            'conversionRate', 0
        ),
        'revenueTrend', COALESCE(v_revenue_trend, '[]'::jsonb),
        'topProducts', COALESCE(v_top_products, '[]'::jsonb)
    );
END;
$$;
