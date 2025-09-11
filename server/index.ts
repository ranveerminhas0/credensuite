import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import { registerRoutes } from "./routes";

dotenv.config(); // Works locally with .env, and Railway injects vars automatically

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS configuration to allow Vercel frontend and local dev
const allowedOrigins: string[] = [
  "https://credensuite.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

// Explicitly handle preflight for API routes
app.options("/api/*", cors());

// Simple logging function
function log(message: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Health check endpoint - MUST be first and simple
app.get('/health', (req, res) => {
  log('Health check requested');
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    service: "Creden Suite Backend"
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: "🎉 Creden Suite Backend is Live! 🚀",
    status: "success",
    timestamp: new Date().toISOString(),
    frontend: "Visit your frontend URL to access the full application",
    api: "API endpoints are available at /api/*"
  });
});

// Register API routes and start server
let httpServer = createServer(app);
registerRoutes(app).then((srv) => {
  httpServer = srv;
  const port = parseInt(process.env.PORT || '5000', 10);
  httpServer.listen(port, "0.0.0.0", () => {
    log(`🚀 Creden Suite Backend serving on 0.0.0.0:${port}`);
    log(`Health check available at: http://0.0.0.0:${port}/health`);
  });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  log(`Error: ${status} - ${message}`);
  res.status(status).json({ message });
});

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`);
  console.error(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection: ${reason}`);
  console.error('Promise:', promise, 'Reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log('SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    log('Server closed');
    process.exit(0);
  });
});
