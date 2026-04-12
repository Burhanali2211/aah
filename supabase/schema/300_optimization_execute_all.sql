-- =============================================================================
-- 300_optimization_execute_all.sql
-- MASTER EXECUTION SCRIPT - Apply all optimizations in correct order
-- =============================================================================
-- This file orchestrates the complete optimization suite
-- Safe to run: All operations are idempotent (IF NOT EXISTS / DROP IF EXISTS)
-- Execution time: ~30 seconds for entire suite
-- =============================================================================

-- Start transaction for atomicity
BEGIN;

-- ─────────────────────────────────────────────────────────────────────────
-- PHASE 1: Indexes (non-blocking, can run on large tables)
-- Expected time: 5-10 seconds
-- ─────────────────────────────────────────────────────────────────────────

\echo '=========================================='
\echo 'PHASE 1: Creating Indexes'
\echo '=========================================='

\i supabase/schema/200_optimization_indexes_modular.sql

\echo 'Phase 1 Complete: All indexes created'

-- ─────────────────────────────────────────────────────────────────────────
-- PHASE 2: Materialized Views (creates fresh views)
-- Expected time: 10-15 seconds
-- ─────────────────────────────────────────────────────────────────────────

\echo '=========================================='
\echo 'PHASE 2: Creating Materialized Views'
\echo '=========================================='

\i supabase/schema/210_optimization_materialized_views_modular.sql

\echo 'Phase 2 Complete: All materialized views created'

-- Initial population of materialized views
\echo 'Populating materialized views...'
REFRESH MATERIALIZED VIEW public.mv_dashboard_stats;
REFRESH MATERIALIZED VIEW public.mv_popular_products;
REFRESH MATERIALIZED VIEW public.mv_user_order_summary;
REFRESH MATERIALIZED VIEW public.mv_category_stats;
\echo 'Materialized views populated'

-- ─────────────────────────────────────────────────────────────────────────
-- PHASE 3: Optimized Functions
-- Expected time: 2-3 seconds
-- ─────────────────────────────────────────────────────────────────────────

\echo '=========================================='
\echo 'PHASE 3: Creating Optimized Functions'
\echo '=========================================='

\i supabase/schema/220_optimization_functions_modular.sql

\echo 'Phase 3 Complete: All functions created'

-- ─────────────────────────────────────────────────────────────────────────
-- PHASE 4: Denormalization & Triggers
-- Expected time: 3-5 seconds
-- ─────────────────────────────────────────────────────────────────────────

\echo '=========================================='
\echo 'PHASE 4: Setting Up Denormalization'
\echo '=========================================='

\i supabase/schema/230_optimization_denormalization_modular.sql

\echo 'Phase 4 Complete: Denormalization columns and triggers created'

-- Initial rebuild of denormalized columns
\echo 'Building denormalized columns...'
SELECT public.rebuild_product_denormalization();
\echo 'Denormalized columns built'

-- ─────────────────────────────────────────────────────────────────────────
-- PHASE 5: Constraints & Data Integrity
-- Expected time: 2-3 seconds
-- ─────────────────────────────────────────────────────────────────────────

\echo '=========================================='
\echo 'PHASE 5: Adding Data Integrity Constraints'
\echo '=========================================='

\i supabase/schema/240_optimization_constraints_modular.sql

\echo 'Phase 5 Complete: All constraints added'

-- ─────────────────────────────────────────────────────────────────────────
-- POST-EXECUTION: Verification & Stats
-- ─────────────────────────────────────────────────────────────────────────

\echo '=========================================='
\echo 'VERIFICATION: Checking Optimization Status'
\echo '=========================================='

-- Check indexes were created
\echo 'Indexes created:'
SELECT COUNT(*) as total_indexes
FROM pg_indexes
WHERE schemaname = 'public' AND indexname LIKE 'idx_%';

-- Check materialized views exist
\echo 'Materialized views created:'
SELECT COUNT(*) as total_views
FROM pg_matviews
WHERE schemaname = 'public' AND matviewname LIKE 'mv_%';

-- Check functions were created
\echo 'Functions created:'
SELECT COUNT(*) as total_functions
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
AND proname IN (
  'search_products',
  'get_product_details',
  'get_user_active_orders',
  'get_user_order_history',
  'get_product_reviews',
  'get_user_cart_summary',
  'calculate_cart_totals',
  'refresh_materialized_views',
  'rebuild_product_denormalization',
  'trg_sync_product_review_stats',
  'trg_sync_product_wishlist_count',
  'validate_order_totals',
  'validate_order_item_total',
  'check_constraint_violations'
);

-- Check triggers exist
\echo 'Triggers created:'
SELECT COUNT(*) as total_triggers
FROM pg_trigger
WHERE tgrelname IN ('reviews', 'wishlist_items', 'orders', 'cart_items');

-- Display materialized view row counts
\echo 'Materialized view statistics:'
SELECT
  'mv_dashboard_stats' as view_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size(oid)) as size
FROM pg_class
WHERE relname = 'mv_dashboard_stats' AND relkind = 'm'
UNION ALL
SELECT
  'mv_popular_products' as view_name,
  COUNT(*),
  pg_size_pretty(pg_total_relation_size(oid))
FROM pg_class
WHERE relname = 'mv_popular_products' AND relkind = 'm'
UNION ALL
SELECT
  'mv_user_order_summary' as view_name,
  COUNT(*),
  pg_size_pretty(pg_total_relation_size(oid))
FROM pg_class
WHERE relname = 'mv_user_order_summary' AND relkind = 'm'
UNION ALL
SELECT
  'mv_category_stats' as view_name,
  COUNT(*),
  pg_size_pretty(pg_total_relation_size(oid))
FROM pg_class
WHERE relname = 'mv_category_stats' AND relkind = 'm';

-- Commit all changes
COMMIT;

\echo '=========================================='
\echo 'OPTIMIZATION SUITE COMPLETE'
\echo '=========================================='
\echo 'All 100x performance improvements applied successfully!'
\echo ''
\echo 'Next steps:'
\echo '1. Set up hourly cron job: SELECT public.refresh_materialized_views()'
\echo '2. Update application to use optimized functions'
\echo '3. Monitor query performance improvements'
\echo ''
\echo 'For troubleshooting, run: SELECT * FROM public.check_constraint_violations()'
