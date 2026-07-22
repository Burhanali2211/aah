import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGIN = Deno.env.get("FRONTEND_URL") || "https://aah-teal.vercel.app";

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

// Whitelist of fields that can be updated (prevents mass-assignment attacks)
const ALLOWED_WRITE_FIELDS = [
  'name', 'slug', 'description', 'short_description',
  'price', 'original_price', 'category_id',
  'images', 'stock', 'sku', 'weight', 'dimensions',
  'tags', 'specifications', 'rating', 'review_count',
  'is_featured', 'show_on_homepage', 'is_active',
  'meta_title', 'meta_description',
  'scent_notes', 'longevity', 'sillage', 'fragrance_family',
  'gender_profile', 'occasion', 'season', 'perfumer_story',
  'origin', 'grade', 'packaging_options', 'shelf_life',
  'certifications', 'usage_tips', 'culinary_uses', 'health_benefits',
];

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

    // Helper to filter update payload to allowed fields only
    const sanitizeUpdate = (obj: any) => {
      const result: any = {};
      for (const field of ALLOWED_WRITE_FIELDS) {
        if (field in obj) result[field] = obj[field];
      }
      result.updated_at = new Date().toISOString();
      return result;
    };

    switch (action) {
      case "create-product": {
        // Only admins and sellers can create
        if (userRole !== "admin" && userRole !== "seller") {
          return new Response(JSON.stringify({ error: "Forbidden: Seller or admin access required" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403,
          });
        }

        const productData = sanitizeUpdate(data);
        if (userRole === "seller") {
          productData.seller_id = user.id;
        }
        productData.created_at = new Date().toISOString();

        const { data: product, error } = await adminClient
          .from("products")
          .insert([productData])
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, data: product }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201,
        });
      }

      case "update-product": {
        const { id, ...updateData } = data;
        if (!id) {
          return new Response(JSON.stringify({ error: "Product ID required" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }

        // Check ownership if seller
        if (userRole === "seller") {
          const { data: product } = await adminClient
            .from("products")
            .select("seller_id")
            .eq("id", id)
            .single();

          if (product?.seller_id !== user.id) {
            return new Response(JSON.stringify({ error: "Forbidden: Cannot update other seller's products" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 403,
            });
          }
        }

        const sanitized = sanitizeUpdate(updateData);
        const { data: product, error } = await adminClient
          .from("products")
          .update(sanitized)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, data: product }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "delete-product": {
        const { productId } = data;
        if (!productId) {
          return new Response(JSON.stringify({ error: "Product ID required" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }

        // Only admins can delete
        if (userRole !== "admin") {
          return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403,
          });
        }

        const { error } = await adminClient
          .from("products")
          .delete()
          .eq("id", productId);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, message: "Product deleted" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "bulk-update": {
        // Only admins can bulk update
        if (userRole !== "admin") {
          return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403,
          });
        }

        const { productIds, updates } = data;
        const sanitized = sanitizeUpdate(updates);

        const { error } = await adminClient
          .from("products")
          .update(sanitized)
          .in("id", productIds);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, message: "Products updated" }), {
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
    console.error("Product mutation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
