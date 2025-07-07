
/**
 * Supabase Edge Function: create-payment
 * - Creates a Stripe Checkout Session for a one-off payment
 * - Stores an order record linked to a booking or bus/route
 * - Uses Stripe test secret by default (placeholder, must update for live)
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "sk_test_...";
  if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === "sk_test_...") {
    return new Response(
      JSON.stringify({ error: "Stripe key not set: provide STRIPE_SECRET_KEY in function secrets." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabaseService = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  // Parse body
  const { amount: _amount, currency, bus_id, route_id, booking_id } = await req.json();

  // Validate required params
  if (!currency) {
    return new Response(JSON.stringify({ error: "currency is required" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
    });
  }

  // Use user JWT for auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing Bearer token" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401
    });
  }
  const jwt = authHeader.replace("Bearer ", "");

  // User client for extracting user info
  const supaUser = createClient(supabaseUrl, supabaseAnon);
  const { data: userData } = await supaUser.auth.getUser(jwt);
  const user = userData?.user;
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
    });
  }

  // 1. Determine price (route-driven)
  let price_cents: number | null = null;
  if (route_id) {
    // Fetch price from routes table securely
    const { data: route, error } = await createClient(
      supabaseUrl,
      supabaseService,
      { auth: { persistSession: false } }
    )
      .from("routes")
      .select("price_cents")
      .eq("id", route_id)
      .maybeSingle();

    if (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch route price: " + error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
      });
    }
    if (!route || typeof route.price_cents !== "number") {
      return new Response(JSON.stringify({ error: "Route not found or missing price" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404,
      });
    }

    price_cents = route.price_cents;
  } else if (_amount) {
    // Fallback for cases where route pricing isn't required
    price_cents = _amount;
  } else {
    return new Response(JSON.stringify({ error: "Either route_id or amount required" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
    });
  }

  // 2. Create / locate Stripe customer
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
  let customerId = null;

  // Try to reuse by email
  if (user.email) {
    const result = await stripe.customers.list({ email: user.email, limit: 1 });
    if (result.data.length > 0) customerId = result.data[0].id;
  }

  // 3. Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer: customerId ?? undefined,
    customer_email: customerId ? undefined : user.email,
    line_items: [
      {
        price_data: {
          currency,
          product_data: { name: "Bus/Route Booking" },
          unit_amount: price_cents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      user_id: user.id,
      bus_id: bus_id ?? "",
      route_id: route_id ?? "",
      booking_id: booking_id ?? "",
    },
    success_url: `${req.headers.get("origin")}/payment-success`,
    cancel_url: `${req.headers.get("origin")}/payment-canceled`,
  });

  // 4. Insert pending order into Supabase (service role)
  const supaAdmin = createClient(supabaseUrl, supabaseService, { auth: { persistSession: false } });
  const { error: orderError } = await supaAdmin
    .from("orders")
    .upsert(
      [{
        user_id: user.id,
        bus_id,
        route_id,
        booking_id,
        stripe_session_id: session.id,
        amount: price_cents,
        currency,
        status: "pending",
      }],
      { onConflict: "stripe_session_id" }
    );
  if (orderError) {
    return new Response(JSON.stringify({ error: "Failed to insert order: " + orderError.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }

  return new Response(
    JSON.stringify({ url: session.url, session_id: session.id }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
});
