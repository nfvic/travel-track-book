
/**
 * Supabase Edge Function: stripe-webhook
 * Listens for Stripe events and updates order statuses accordingly.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle Stripe preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!stripeSecret || !webhookSecret) {
    return new Response(
      JSON.stringify({ error: "Stripe secrets not configured." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseService = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const sig = req.headers.get("Stripe-Signature");
  const bodyBuf = await req.arrayBuffer();
  const bodyText = new TextDecoder().decode(bodyBuf);

  let event;
  try {
    const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });
    event = stripe.webhooks.constructEvent(
      bodyText,
      sig!,
      webhookSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return new Response(
      JSON.stringify({ error: "Invalid Stripe signature" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }

  // Process completed checkout sessions
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const stripe_session_id = session.id;

    // Mark order as paid in Supabase
    const supaAdmin = createClient(
      supabaseUrl,
      supabaseService,
      { auth: { persistSession: false } }
    );
    const { error } = await supaAdmin
      .from("orders")
      .update({ status: "paid" })
      .eq("stripe_session_id", stripe_session_id);

    if (error) {
      console.error("Failed to update order status:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    console.log(`Order marked as paid for session: ${stripe_session_id}`);
  }

  // You can add further handlers for other Stripe events like payment_intent_failed, etc.

  return new Response(
    JSON.stringify({ received: true }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
});
