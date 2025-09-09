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
  const dbName = (client.options as any)?.dbName || "ngodb";
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
