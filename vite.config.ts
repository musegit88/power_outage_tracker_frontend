import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import fs from "fs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/routes",
    }),
    react(),
    tailwindcss(),
    VitePWA({
      includeAssets: ["favicon.svg", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: false,
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    https:
      process.env.NODE_ENV === "development"
        ? {
            key: fs.readFileSync(
              path.resolve(__dirname, "./certs/localhost-key.pem"),
            ),
            cert: fs.readFileSync(
              path.resolve(__dirname, "./certs/localhost.pem"),
            ),
          }
        : undefined,
  },
  build: {
    rolldownOptions: {
      output: {
        minify: {
          compress: {
            dropConsole: true,
          },
        },
      },
    },
  },
});
