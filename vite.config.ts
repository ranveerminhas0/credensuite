import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import fs from "fs";

export default defineConfig(async ({ mode }) => {
  const envDir = path.resolve(import.meta.dirname, "client");
  const env = loadEnv(mode, envDir, "");
  // Manual parse of .env into a plain object (no prefix filtering)
  const manualEnv: Record<string, string> = {};
  const envPath = path.resolve(envDir, ".env");
  console.log("[Vite Config] envPath:", envPath, "exists:", fs.existsSync(envPath));
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split(/\r?\n/)) {
      if (!line || line.trim().startsWith("#")) continue;
      const idx = line.indexOf("=");
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim().replace(/^\uFEFF/, "");
      const value = line.slice(idx + 1).trim();
      manualEnv[key] = value;
    }
  }
  
  // Debug: log what we loaded
  console.log("[Vite Config] Loading env from:", envDir);
  console.log("[Vite Config] Mode:", mode);
  console.log("[Vite Config] Firebase env keys found:", {
    VITE_FIREBASE_API_KEY: !!(env.VITE_FIREBASE_API_KEY || manualEnv.VITE_FIREBASE_API_KEY),
    VITE_FIREBASE_AUTH_DOMAIN: !!(env.VITE_FIREBASE_AUTH_DOMAIN || manualEnv.VITE_FIREBASE_AUTH_DOMAIN),
    VITE_FIREBASE_PROJECT_ID: !!(env.VITE_FIREBASE_PROJECT_ID || manualEnv.VITE_FIREBASE_PROJECT_ID),
    VITE_FIREBASE_STORAGE_BUCKET: !!(env.VITE_FIREBASE_STORAGE_BUCKET || manualEnv.VITE_FIREBASE_STORAGE_BUCKET),
    VITE_FIREBASE_SENDER_ID: !!(env.VITE_FIREBASE_SENDER_ID || manualEnv.VITE_FIREBASE_SENDER_ID),
    VITE_FIREBASE_APP_ID: !!(env.VITE_FIREBASE_APP_ID || manualEnv.VITE_FIREBASE_APP_ID),
  });

  const plugins = [react(), runtimeErrorOverlay()];
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    const m = await import("@replit/vite-plugin-cartographer");
    plugins.push(m.cartographer());
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    envDir: envDir,
    define: {
      "import.meta.env.VITE_FIREBASE_API_KEY": JSON.stringify(env.VITE_FIREBASE_API_KEY || manualEnv.VITE_FIREBASE_API_KEY || ""),
      "import.meta.env.VITE_FIREBASE_AUTH_DOMAIN": JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN || manualEnv.VITE_FIREBASE_AUTH_DOMAIN || ""),
      "import.meta.env.VITE_FIREBASE_PROJECT_ID": JSON.stringify(env.VITE_FIREBASE_PROJECT_ID || manualEnv.VITE_FIREBASE_PROJECT_ID || ""),
      "import.meta.env.VITE_FIREBASE_STORAGE_BUCKET": JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET || manualEnv.VITE_FIREBASE_STORAGE_BUCKET || ""),
      "import.meta.env.VITE_FIREBASE_SENDER_ID": JSON.stringify(env.VITE_FIREBASE_SENDER_ID || manualEnv.VITE_FIREBASE_SENDER_ID || ""),
      "import.meta.env.VITE_FIREBASE_APP_ID": JSON.stringify(env.VITE_FIREBASE_APP_ID || manualEnv.VITE_FIREBASE_APP_ID || ""),
    },
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
