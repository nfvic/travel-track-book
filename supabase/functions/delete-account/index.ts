
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Missing Supabase project config." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }

  const auth = req.headers.get("authorization") || "";
  const userJwt = auth.replace(/^Bearer /, "").trim();
  if (!userJwt) {
    return new Response(
      JSON.stringify({ error: "Missing access token." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
    );
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  let userId: string | null = null;
  try {
    const { data, error } = await admin.auth.getUser(userJwt);
    if (error || !data?.user?.id) throw error || new Error("Invalid token.");
    userId = data.user.id;
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Could not verify user." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
    );
  }

  try {
    // FIX: Use snake_case for should_soft_delete to match Go API struct
    const { error } = await admin.auth.admin.deleteUser(userId, { should_soft_delete: false });
    if (error) {
      console.error("Error deleting user in edge function:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Failed to delete user." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: "Unexpected server error." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
