import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.owxchbftqhydphjplprp:Burhan@2211@aws-1-ap-south-1.pooler.supabase.com:6543/postgres",
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Pre-execution cleanup for conflicting functions
    console.log('Cleaning up conflicting functions...');
    await client.query("DROP FUNCTION IF EXISTS search_products CASCADE;");
    await client.query("DROP FUNCTION IF EXISTS get_product_details CASCADE;");
    await client.query("DROP FUNCTION IF EXISTS refresh_materialized_views CASCADE;");
    await client.query("DROP FUNCTION IF EXISTS get_user_dashboard_stats CASCADE;");
    await client.query("DROP FUNCTION IF EXISTS get_user_active_orders CASCADE;");
    await client.query("DROP FUNCTION IF EXISTS get_admin_dashboard_summary CASCADE;");
    await client.query("DROP FUNCTION IF EXISTS get_admin_analytics CASCADE;");
    
    const files = [
      'supabase/schema/201_OPTIMIZATION_COMPLETE.sql',
      'supabase/schema/210_DASHBOARD_STATS_RPC.sql',
      'supabase/schema/211_ADMIN_DASHBOARD_STATS_RPC.sql',
      'supabase/schema/212_ADMIN_ANALYTICS_RPC.sql'
    ];
    
    for (const file of files) {
      console.log(`Executing ${file}...`);
      const sql = fs.readFileSync(file, 'utf8');
      await client.query(sql);
    }
    
    console.log('Successfully executed all optimization scripts');
  } catch (err) {
    console.error('Error executing optimization:', err);
  } finally {
    await client.end();
  }
}

main();
