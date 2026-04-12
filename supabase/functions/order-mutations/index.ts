import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGIN = Deno.env.get("FRONTEND_URL") || "https://aah-teal.vercel.app";
const ALLOWED_ORDER_STATUSES = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
];

// In-memory rate limiter (per user)
const userRequests = new Map<string, number[]>();
function isUserRateLimited(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30;

  if (!userRequests.has(userId)) {
    userRequests.set(userId, [now]);
    return false;
  }

  const timestamps = userRequests.get(userId)!.filter(time => now - time < windowMs);
  timestamps.push(now);
  userRequests.set(userId, timestamps);

  return timestamps.length > maxRequests;
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const isAllowed =
    origin === ALLOWED_ORIGIN ||
    origin.endsWith(".vercel.app") ||
    origin === "http://localhost:5173";
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create anon client for token verification
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    // Create service role client for admin queries
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Check user role via admin client (bypasses RLS)
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const userRole = profile?.role || "user";

    // Rate limit: 30 requests per minute per user
    if (isUserRateLimited(user.id)) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    const { action, data } = await req.json();

    switch (action) {
      case "create-order": {
        // Any authenticated user can create an order
        if (!data) {
          return new Response(JSON.stringify({ error: "Order data required" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }

        // Generate server-side order number: AA-YYYYMMDD-NNNN
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const dateStr = `${year}${month}${day}`;

        // Get the next sequence number for today
        const { count } = await adminClient
          .from("orders")
          .select("*", { count: "exact", head: true })
          .like("order_number", `AA-${dateStr}-%`);

        const nextNum = String((count || 0) + 1).padStart(4, '0');
        const orderNumber = `AA-${dateStr}-${nextNum}`;

        // Create order with server-generated number
        const orderData = {
          ...data,
          user_id: user.id,
          order_number: orderNumber,
          payment_status: data.payment_status || 'pending',
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Only allow specific fields
        const allowedFields = [
          'order_number', 'user_id', 'payment_status', 'status',
          'total_amount', 'shipping_address', 'billing_address',
          'shipping_cost', 'tax_amount', 'coupon_code',
          'notes', 'created_at', 'updated_at'
        ];

        const safeOrderData: any = {};
        for (const field of allowedFields) {
          if (field in orderData) {
            safeOrderData[field] = orderData[field];
          }
        }

        const { data: order, error } = await adminClient
          .from("orders")
          .insert([safeOrderData])
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, data: order }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201,
        });
      }

      case "update-status": {
        // Only admins and sellers can update order status
        if (userRole !== "admin" && userRole !== "seller") {
          return new Response(
            JSON.stringify({ error: "Forbidden: Admin or seller access required" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 403,
            }
          );
        }

        const { orderId, status, trackingNumber } = data;

        if (!orderId || !status) {
          return new Response(JSON.stringify({ error: "Order ID and status required" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }

        // Validate status against allowlist
        if (!ALLOWED_ORDER_STATUSES.includes(status)) {
          return new Response(
            JSON.stringify({
              error: `Invalid status. Allowed: ${ALLOWED_ORDER_STATUSES.join(', ')}`,
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }

        const updateData: any = {
          status,
          updated_at: new Date().toISOString(),
        };

        if (trackingNumber) {
          updateData.tracking_number = trackingNumber;
        }

        const { data: order, error } = await adminClient
          .from("orders")
          .update(updateData)
          .eq("id", orderId)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, data: order }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
    }

  } catch (error) {
    console.error("Order mutation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
