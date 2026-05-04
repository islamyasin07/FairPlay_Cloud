import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const getBackendUrl = () => {
  const isDocker = process.env.VITE_BACKEND_URL !== undefined;

  if (isDocker) {
    return process.env.VITE_BACKEND_URL;
  }

  const customBackend = process.env.BACKEND_URL;
  if (customBackend) {
    return customBackend;
  }

  return process.env.NODE_ENV === "production"
    ? "http://35.174.0.74:3001"
    : "http://localhost:3001";
};

const backendUrl = getBackendUrl();

console.log(`Backend configured at: ${backendUrl}`);

export default defineConfig({
  plugins: [react()],
  server: {
    middlewareMode: false,
    proxy: {
      "/api": {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy) => {
          proxy.on("error", () => {
            console.error(`Proxy error: Cannot reach backend at ${backendUrl}`);
            console.error(`   Make sure backend is running on ${backendUrl}`);
            console.error("   Or start with: docker-compose up");
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            if (process.env.DEBUG_PROXY) {
              console.log(`${req.method} ${req.url} -> ${proxyRes.statusCode}`);
            }
          });
        },

      '/api': {
        target: 'http://35.174.0.74:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    fs: {
      strict: false,
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  publicDir: "public",
});
