import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

export default defineTool({
  name: "list_customers",
  title: "List customers",
  description: "List customers in the signed-in user's business (respects RLS).",
  inputSchema: {
    limit: z.number().int().min(1).max(200).optional().describe("Max rows to return (default 50)."),
    search: z.string().trim().min(1).optional().describe("Optional name/phone/email search."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, search }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    let q = sb.from("customers").select("*").order("created_at", { ascending: false }).limit(limit ?? 50);
    if (search) q = q.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { customers: data ?? [] },
    };
  },
});
