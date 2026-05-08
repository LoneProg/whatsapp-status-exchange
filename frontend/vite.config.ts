import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to the backend during development
      "/api": {
        target: "https://obliged-vale-areshaze-c181b564.koyeb.app",
        changeOrigin: true,
      },
    },
  },
});
