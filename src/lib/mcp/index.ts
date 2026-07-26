import { auth, defineMcp } from "@lovable.dev/mcp-js";
import whoamiTool from "./tools/whoami";
import listProductsTool from "./tools/list-products";
import listSalesTool from "./tools/list-sales";
import listCustomersTool from "./tools/list-customers";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "sunbird-pos-mcp",
  title: "SunbirdPOSHub MCP",
  version: "0.1.0",
  instructions:
    "Tools for SunbirdPOSHub. Use `whoami` to verify connectivity, and `list_products`, `list_sales`, `list_customers` to read the signed-in user's business data (scoped by RLS).",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoamiTool, listProductsTool, listSalesTool, listCustomersTool],
});
