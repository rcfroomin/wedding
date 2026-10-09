import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";

export default defineConfig({
  output: "server",

  adapter: vercel({
    webAnalytics: {
      enabled: true, // set to false when using @vercel/analytics@1.4.0
    },
  }),

  integrations: [
    react(),
  ],
});