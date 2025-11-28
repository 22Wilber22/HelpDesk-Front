// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://helpdesk-9r41.onrender.com",
        changeOrigin: true,
        secure: false,
        // 👇 esto quita el /api antes de mandarlo al servidor
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
