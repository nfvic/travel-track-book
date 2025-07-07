
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

Deno.serve(async (req) => {
  // Log request for diagnostic purposes
  try {
    console.log("Edge Function: get-ticket invoked", { method: req.method, headers: Object.fromEntries(req.headers.entries()) });

    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.50.0");

    let booking_id;
    try {
      const body = await req.json();
      booking_id = body.booking_id;
    } catch (err) {
      console.log("ERROR parsing body", err?.message || err);
      return new Response(JSON.stringify({ error: "Malformed body" }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (!booking_id) {
      console.log("Missing booking_id in request");
      return new Response(JSON.stringify({ error: "booking_id is required." }), {
        status: 400,
        headers: corsHeaders
      });
    }
    // This uses anon key and RLS so user must be signed in & own the booking
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("Missing Bearer token in header");
      return new Response(JSON.stringify({ error: "Missing Bearer token" }), {
        status: 401,
        headers: corsHeaders,
      });
    }
    const jwt = authHeader.replace("Bearer ", "");
    const supabase = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: `Bearer ${jwt}` } }
    });

    // Make sure the user owns the booking (enforced by RLS)
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        "id, created_at, status, bus:buses(id, name, plate_number), order:orders(amount, status, currency, stripe_session_id, paystack_reference)"
      )
      .eq("id", booking_id)
      .maybeSingle();

    if (bookingError) {
      console.log("Supabase bookings error:", bookingError.message);
      return new Response(JSON.stringify({ error: bookingError.message }), {
        status: 500,
        headers: corsHeaders
      });
    }
    if (!booking) {
      console.log("No booking found w/ id", booking_id);
      return new Response(JSON.stringify({ error: "Ticket not found" }), {
        status: 404,
        headers: corsHeaders
      });
    }

    console.log("Returning ticket booking for get-ticket:", booking);
    return new Response(JSON.stringify({ ticket: booking }), {
      headers: corsHeaders,
      status: 200
    });

  } catch (err) {
    console.log("Unhandled error in get-ticket:", err?.message || err);
    return new Response(JSON.stringify({ error: err?.message || err }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
