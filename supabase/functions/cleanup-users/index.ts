import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Users to delete (non-grandmaster)
    const userIdsToDelete = [
      "66c062f9-eb2e-4e4a-9cb9-691bd9885597",
      "7e47499d-626b-4ad6-ac74-895cee943ad2",
      "72975c5d-eae3-4823-974d-adcdf369d09f",
    ];

    const businessIdsToDelete = [
      "97bc4d35-325d-468c-8432-a4ec7cb0552a",
      "ab47b1c6-df8b-4708-b314-6b7091bc231b",
      "c49e8ccd-e02e-40ac-a2e4-26051bda2bf0",
    ];

    const results: string[] = [];

    // Delete business data for each business
    for (const bizId of businessIdsToDelete) {
      await supabaseAdmin.from("sale_items").delete().eq("business_id", bizId);
      await supabaseAdmin.from("payment_history").delete().eq("business_id", bizId);
      await supabaseAdmin.from("sales").delete().eq("business_id", bizId);
      await supabaseAdmin.from("inventory").delete().eq("business_id", bizId);
      await supabaseAdmin.from("products").delete().eq("business_id", bizId);
      await supabaseAdmin.from("customers").delete().eq("business_id", bizId);
      await supabaseAdmin.from("expenses").delete().eq("business_id", bizId);
      await supabaseAdmin.from("z_reports").delete().eq("business_id", bizId);
      await supabaseAdmin.from("settings").delete().eq("business_id", bizId);
      await supabaseAdmin.from("subscriptions").delete().eq("business_id", bizId);
      results.push(`Cleaned business data for ${bizId}`);
    }

    // Delete user-level records
    for (const uid of userIdsToDelete) {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", uid);
      await supabaseAdmin.from("profiles").delete().eq("user_id", uid);
      await supabaseAdmin.from("referrals").delete().eq("referrer_user_id", uid);
      results.push(`Deleted profile/roles for ${uid}`);
    }

    // Delete businesses
    for (const bizId of businessIdsToDelete) {
      await supabaseAdmin.from("businesses").delete().eq("id", bizId);
      results.push(`Deleted business ${bizId}`);
    }

    // Delete auth users
    for (const uid of userIdsToDelete) {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(uid);
      if (error) results.push(`Auth delete error for ${uid}: ${error.message}`);
      else results.push(`Deleted auth user ${uid}`);
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
