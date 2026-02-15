import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  root: "public",
  plugins: [
    vue(),
    viteCompression(), // Genera archivos .gz
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "public/src"),
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router"],
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
