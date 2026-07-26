import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mcpPlugin(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "images/sunbird-logo.png"],
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: {
        name: "SunbirdPOSHub",
        short_name: "SunbirdPOS",
        description: "Smart POS for Modern Businesses",
        theme_color: "#2680EB",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/images/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/images/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/images/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
