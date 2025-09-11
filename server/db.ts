import { MongoClient, Db, Collection, Document } from "mongodb";

let client: MongoClient | undefined;
let db: Db | undefined;

export async function getDb(): Promise<Db> {
  if (db) return db;
  const uri = process.env.MONGODB_URI || "";
  if (!uri) {
    throw new Error("Missing MONGODB_URI. Set it in backend .env");
  }
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();

  // Prefer explicit DB name via env, else derive from URI path, else fallback
  const explicitDb = process.env.MONGODB_DB;
  let derivedDb: string | undefined;
  try {
    const match = uri.match(/\/([^\/?]+)(?:\?|$)/);
    if (match && match[1] && !match[1].includes("@")) {
      derivedDb = match[1];
    }
  } catch {}
  const fallback = "credensuite";
  const dbName = explicitDb || derivedDb || (client.options as any)?.dbName || fallback;
  console.log(`[Mongo] Connected. Using database: ${dbName}`);
  db = client.db(dbName);
  return db;
}

export async function getCollection<T extends Document>(name: string): Promise<Collection<T>> {
  const database = await getDb();
  return database.collection<T>(name);
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = undefined;
    db = undefined;
  }
}
