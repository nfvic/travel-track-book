
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
  const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return new Response(
      JSON.stringify({ error: "Stripe secrets are not set" }),
      { status: 500, headers: corsHeaders }
    );
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(
      JSON.stringify({ error: "Missing Stripe signature" }),
      { status: 400, headers: corsHeaders }
    );
  }
  const rawBody = await req.text();
  let event;
  let stripe;
  try {
    stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Stripe webhook validation failed", details: err?.message }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Example handling for checkout.session.completed
  if (event.type === "checkout.session.completed") {
    // Optionally: mark order as paid here (requires DB access)
    // For brevity, just respond with success.
  }

  return new Response(
    JSON.stringify({ received: true }),
    { status: 200, headers: corsHeaders }
  );
});
