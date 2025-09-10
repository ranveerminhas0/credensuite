import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  // Ensure process.env has VITE_ public values by parsing .env files
  const rootDir = path.resolve(import.meta.dirname, "..");
  const clientDir = path.resolve(rootDir, "client");
  const possibleEnvFiles = [
    path.resolve(rootDir, ".env"),
    path.resolve(clientDir, ".env"),
  ];
  const manualEnv: Record<string, string> = {};
  for (const envPath of possibleEnvFiles) {
    try {
      if (fs.existsSync(envPath)) {
        const content = await fs.promises.readFile(envPath, "utf-8");
        for (const line of content.split(/\r?\n/)) {
          if (!line || line.trim().startsWith("#")) continue;
          const idx = line.indexOf("=");
          if (idx === -1) continue;
          const key = line.slice(0, idx).trim().replace(/^\uFEFF/, "");
          const value = line.slice(idx + 1).trim();
          if (key.startsWith("VITE_")) {
            manualEnv[key] = value;
            if (process.env[key] === undefined) {
              process.env[key] = value;
            }
          }
        }
      }
    } catch {}
  }

  const userConfig =
    typeof (viteConfig as any) === "function"
      ? await (viteConfig as any)({ mode: process.env.NODE_ENV || "development", command: "serve" })
      : (viteConfig as any);

  const vite = await createViteServer({
    ...userConfig,
    configFile: false,
    envDir: path.resolve(import.meta.dirname, ".."),
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      // Inject runtime public config for client (safe VITE_ values only)
      const pick = (k: string) => process.env[k] ?? manualEnv[k] ?? "";
      const publicConfig = JSON.stringify({
        VITE_FIREBASE_API_KEY: pick("VITE_FIREBASE_API_KEY"),
        VITE_FIREBASE_AUTH_DOMAIN: pick("VITE_FIREBASE_AUTH_DOMAIN"),
        VITE_FIREBASE_PROJECT_ID: pick("VITE_FIREBASE_PROJECT_ID"),
        VITE_FIREBASE_STORAGE_BUCKET: pick("VITE_FIREBASE_STORAGE_BUCKET"),
        VITE_FIREBASE_SENDER_ID: pick("VITE_FIREBASE_SENDER_ID"),
        VITE_FIREBASE_APP_ID: pick("VITE_FIREBASE_APP_ID"),
      });
      template = template.replace(
        "__PUBLIC_CONFIG__",
        publicConfig,
      );
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
