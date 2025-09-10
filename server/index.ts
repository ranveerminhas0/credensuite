import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import dotenv from "dotenv";

dotenv.config(); // Works locally with .env, and Railway injects vars automatically

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  log(`Error: ${status} - ${message}`);
  res.status(status).json({ message });
});

// Start server
const port = parseInt(process.env.PORT || '5000', 10);
const server = createServer(app);

server.listen(port, "0.0.0.0", () => {
  log(`🚀 Creden Suite Backend serving on 0.0.0.0:${port}`);
  log(`Health check available at: http://0.0.0.0:${port}/health`);
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
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log('SIGINT received, shutting down gracefully');
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
});
