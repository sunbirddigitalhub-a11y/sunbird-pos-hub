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
  name: "list_sales",
  title: "List recent sales",
  description:
    "List recent sales for the signed-in user's business (respects RLS). Optionally filter by date range (ISO 8601).",
  inputSchema: {
    limit: z.number().int().min(1).max(200).optional().describe("Max rows to return (default 50)."),
    since: z.string().datetime().optional().describe("Only include sales created at or after this timestamp."),
    until: z.string().datetime().optional().describe("Only include sales created before this timestamp."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, since, until }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    let q = sb.from("sales").select("*").order("created_at", { ascending: false }).limit(limit ?? 50);
    if (since) q = q.gte("created_at", since);
    if (until) q = q.lt("created_at", until);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { sales: data ?? [] },
    };
  },
});
