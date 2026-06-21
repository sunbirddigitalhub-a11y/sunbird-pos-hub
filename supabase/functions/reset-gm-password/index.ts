import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async () => {
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data, error } = await admin.auth.admin.updateUserById(
    "4cb0e46e-82c1-4d10-8d7d-8d13d50006a1",
    { password: "3414@1234" }
  );
  return new Response(JSON.stringify({ ok: !error, error: error?.message, email: data?.user?.email }), {
    headers: { "Content-Type": "application/json" },
  });
});
