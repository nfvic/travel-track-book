
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Fetch Paystack secret
  const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!PAYSTACK_SECRET_KEY) {
    return new Response(
      JSON.stringify({ error: "Paystack secret key not set" }),
      { status: 500, headers: corsHeaders }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Malformed body" }), {
      status: 400,
      headers: corsHeaders
    });
  }

  const reference = body.reference;
  if (!reference) {
    return new Response(JSON.stringify({ error: "Missing reference" }), {
      status: 400,
      headers: corsHeaders
    });
  }

  // Verify with Paystack
  const resp = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        Accept: "application/json"
      }
    }
  );
  const data = await resp.json();

  // Basic error check
  if (!data.status || !data.data) {
    return new Response(
      JSON.stringify({ error: "Could not verify transaction", details: data }),
      { status: 500, headers: corsHeaders }
    );
  }

  // Optionally: update DB status here (omitted for brevity)
  // Respond with verification result
  return new Response(JSON.stringify({ success: true, paystack: data }), {
    status: 200,
    headers: corsHeaders
  });
});
