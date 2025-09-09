import type { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { getCollection } from "./db";
import { ObjectId } from "mongodb";

// Initialize Firebase Admin SDK once per process
function initializeFirebaseAdmin(): void {
  if (admin.apps.length > 0) return;

  // Prefer GOOGLE_APPLICATION_CREDENTIALS JSON string if provided, else read from file
  const envJson = process.env.FIREBASE_ADMIN_JSON;
  if (envJson) {
    const credentials = JSON.parse(envJson);
    admin.initializeApp({ credential: admin.credential.cert(credentials) });
    return;
  }

  // Default path: server/firebase-service-account.json
  const serviceAccountPath = path.resolve(
    import.meta.dirname,
    "firebase-service-account.json",
  );

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
      `Missing Firebase Admin credentials. Provide FIREBASE_ADMIN_JSON or create file at ${serviceAccountPath}`,
    );
  }

  const fileJson = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
  admin.initializeApp({ credential: admin.credential.cert(fileJson) });
}

initializeFirebaseAdmin();

async function isEmailAllowed(email: string): Promise<boolean> {
  // Prefer Mongo collection 'whitlist_ids' if available; fallback to env
  try {
    const col = await getCollection<{ _id?: ObjectId; email: string }>("whitlist_ids");
    const found = await col.findOne({ email: email.toLowerCase() });
    if (found) return true;
  } catch {}

  const fromEnv = process.env.ALLOWED_EMAILS?.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean) || [];
  if (fromEnv.length > 0) return fromEnv.includes(email.toLowerCase());
  // Default safe fallback
  return [
    "ranveerminhas34@gmail.com",
    "gouravminhas2k@gmail.com",
  ].includes(email.toLowerCase());
}

export async function verifyUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers["authorization"];
    const token = Array.isArray(authHeader)
      ? authHeader[0]?.split(" ")[1]
      : authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const email = (decoded.email || "").toLowerCase();

    if (!(await isEmailAllowed(email))) {
      // Special UI hint for client to display blinking red toast/modal
      return res.status(403).json({
        code: "ACCESS_DENIED",
        message: "ACCESS DENIED this is the private software contact developer for access",
      });
    }

    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}


