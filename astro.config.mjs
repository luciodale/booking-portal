import path from "node:path";
import { fileURLToPath } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import clerk from "@clerk/astro";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  output: "server",
  integrations: [
    react(),
    clerk({
      publishableKey:
        "pk_test_ZXF1aXBwZWQtc2hyZXctMTUuY2xlcmsuYWNjb3VudHMuZGV2JA",
      signInUrl: "/sign-in",
      signUpUrl: "/sign-up",
      signInFallbackRedirectUrl: "/",
      signUpFallbackRedirectUrl: "/",
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    ssr: {
      external: ["node:async_hooks"],
    },
  },
  adapter: cloudflare({ imageService: "cloudflare" }),
});
