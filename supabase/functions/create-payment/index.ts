
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Make sure the PAYSTACK_SECRET_KEY is set in Supabase secrets.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email, amount, booking_id, callback_url } = body;

    if (!email || !amount || !booking_id) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET_KEY) {
      return new Response(JSON.stringify({ error: "Paystack secret key not set" }), {
        status: 500,
        headers: corsHeaders
      });
    }

    const headers = {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    // Paystack expects amount in kobo (or lowest currency unit), for NGN this is 100 x value
    // If you support other currencies, make sure to adjust appropriately
    const initResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers,
      body: JSON.stringify({
        email,
        amount: amount * 100, // Convert to kobo
        metadata: { booking_id },
        callback_url: callback_url || "https://your-app.com/payment-success"
      }),
    });

    const initData = await initResponse.json();

    if (!initData.status) {
      return new Response(JSON.stringify({ error: initData.message }), {
        status: 500,
        headers: corsHeaders
      });
    }

    return new Response(
      JSON.stringify({
        checkout_url: initData.data.authorization_url,
        reference: initData.data.reference
      }),
      { headers: corsHeaders }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error: " + (err?.message || err) }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
