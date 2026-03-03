import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is master_admin
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller } } = await supabaseAdmin.auth.getUser(token);
    if (!caller) throw new Error("Unauthorized");

    const { data: callerRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .single();
    if (callerRole?.role !== "master_admin") throw new Error("Only Master Admin can manage users");

    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const { email, password, full_name, phone, role } = body;

      // Check limits
      if (role === "master_admin") {
        const { count } = await supabaseAdmin.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "master_admin");
        if ((count || 0) >= 2) throw new Error("Maximum 2 Master Admin accounts allowed");
      }
      if (role === "supervisor") {
        const { count } = await supabaseAdmin.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "supervisor");
        if ((count || 0) >= 10) throw new Error("Maximum 10 Supervisor accounts allowed");
      }

      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, phone },
      });
      if (createErr) throw createErr;

      // Update profile phone if provided
      if (phone) {
        await supabaseAdmin.from("profiles").update({ phone }).eq("user_id", newUser.user.id);
      }

      // Set the correct role (trigger creates 'staff' by default)
      if (role !== "staff") {
        await supabaseAdmin.from("user_roles").update({ role }).eq("user_id", newUser.user.id);
      }

      // Audit log
      await supabaseAdmin.from("audit_logs").insert({
        action: "create_user",
        table_name: "profiles",
        performed_by: caller.id,
        record_id: newUser.user.id,
        details: { email, role, full_name },
      });

      return new Response(JSON.stringify({ success: true, user_id: newUser.user.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const { user_id } = body;
      if (user_id === caller.id) throw new Error("Cannot delete yourself");

      const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (error) throw error;

      await supabaseAdmin.from("audit_logs").insert({
        action: "delete_user",
        table_name: "profiles",
        performed_by: caller.id,
        record_id: user_id,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reset_password") {
      const { email } = body;
      const { error } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
      });
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unknown action: " + action);
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
