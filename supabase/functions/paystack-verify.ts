
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

// Audit log helper
async function logAudit(
  supabase: any,
  event: string,
  status: string,
  details: Record<string, unknown>,
  user_id?: string
) {
  try {
    await supabase.from("audit_logs").insert([
      {
        event,
        status,
        user_id,
        reference: (details.reference ?? undefined) as string | undefined,
        booking_id: (details.booking_id ?? undefined) as string | undefined,
        order_id: (details.order_id ?? undefined) as string | undefined,
        payload: details,
      },
    ]);
  } catch (err) {
    console.error("[AUDIT LOG FAIL]", event, status, err);
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 1. Parse JWT from Authorization header
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  const jwt = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!jwt) {
    return respond(401, "Missing or malformed Authorization header", {});
  }

  // 2. Use Supabase client to verify JWT and extract user_id
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return respond(500, "Missing Supabase server config", {
      SUPABASE_URL: !!SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY,
    });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  let user_id: string | undefined;
  try {
    const { data: userData, error } = await supabase.auth.getUser(jwt);
    if (error || !userData?.user?.id) {
      return respond(401, "Invalid Supabase JWT", { error, userData });
    }
    user_id = userData.user.id;
  } catch (err) {
    return respond(401, "JWT validation failed", { error: err.toString() });
  }

  // 3. Parse input JSON, but NEVER use user_id from body
  let input;
  try {
    input = await req.json();
  } catch (err) {
    return respond(400, "Invalid JSON body", { error: err.toString() });
  }
  // Only allow referencing non-user fields
  const { reference, bus_id, route_id, amount, currency, user_email } = input;

  if (!reference || !bus_id || !amount || !currency) {
    return respond(400, "Missing required fields", { reference, bus_id, amount, currency });
  }

  // AUDIT: start verification attempt
  await logAudit(supabase, "paystack_verify", "start", { reference, bus_id, amount, currency, route_id, user_email }, user_id);

  const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!PAYSTACK_SECRET_KEY) {
    await logAudit(supabase, "paystack_verify", "fail", { step: "missing-paystack-key", reference }, user_id);
    return respond(500, "Missing PAYSTACK_SECRET_KEY", {});
  }

  // 4. Verify transaction with Paystack
  let paystack;
  try {
    const resp = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });
    paystack = await resp.json();
  } catch (err) {
    await logAudit(supabase, "paystack_verify", "fail", { step: "paystack-network", error: err.toString(), reference }, user_id);
    return respond(502, "Failed to reach Paystack", { error: err.toString() });
  }

  if (!paystack.status || paystack.data?.status !== "success") {
    await logAudit(supabase, "paystack_verify", "fail", { step: "paystack-result", paystack, reference }, user_id);
    return respond(402, "Transaction not successful", { paystack });
  }

  // 5. Insert booking
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert([{ bus_id, user_id, status: "paid" }])
    .select()
    .single();

  if (bookingError || !booking) {
    await logAudit(supabase, "paystack_verify", "fail", { step: "create-booking", bookingError, reference }, user_id);
    return respond(500, "Failed to create booking", { bookingError, booking });
  }

  // 6. Upsert order, securely tied to authenticated user_id
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .upsert(
      [{
        user_id,
        bus_id,
        route_id: route_id ?? null,
        booking_id: booking.id,
        paystack_reference: reference,
        amount,
        currency,
        status: "paid",
      }],
      { onConflict: "paystack_reference" }
    )
    .select()
    .single();

  if (orderError || !order) {
    await logAudit(supabase, "paystack_verify", "fail", { step: "upsert-order", orderError, booking_id: booking.id, reference }, user_id);
    return respond(500, "Failed to create order", { orderError, order });
  }

  // AUDIT: success
  await logAudit(supabase, "paystack_verify", "success", {
    reference,
    bus_id,
    amount,
    currency,
    route_id,
    user_email,
    booking_id: booking.id,
    order_id: order.id,
    paystack: { status: paystack.status, data_status: paystack.data?.status },
  }, user_id);

  // ✅ All good
  console.log("[SUCCESS] Booking and order created (JWT-secure)", {
    booking_id: booking.id,
    order_id: order.id,
    user_id,
  });

  return respond(200, "Payment verified. Booking and order created.", {
    booking,
    order,
    user_id,
  });
});

function respond(status: number, message: string, details: Record<string, unknown>) {
  console.log(`[RESPOND ${status}] ${message}`, details);
  return new Response(JSON.stringify({ ok: status === 200, message, ...details }), {
    status,
    headers: corsHeaders,
  });
}
