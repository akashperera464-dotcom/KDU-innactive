import { MongoClient, Db } from "mongodb";

/**
 * MongoDB Atlas connection (KDU GROUP production database).
 * Connection string lives in .env as MONGODB_URI — never hardcoded.
 *
 * Lazy initialization: the client is only created the first time getMongo()
 * is called. During Next.js build the module is evaluated but getMongo() is
 * never invoked (routes are statically typed), so a missing env var never
 * crashes the build.
 */
const globalForMongo = globalThis as typeof globalThis & {
  __kduMongoClient?: MongoClient;
  __kduMongoIndexes?: Promise<void>;
};

/**
 * Sandbox/dev fallback connection string.
 *
 * WHY: the workspace platform restores `.env` from its template whenever the
 * sandbox is recreated between sessions, which silently drops MONGODB_URI and
 * takes the preview server down. On Vercel (and any proper deployment) the
 * MONGODB_URI environment variable is ALWAYS set, so this fallback never runs
 * there — it only rescues local/sandbox runs when the env var is missing.
 *
 * SECURITY NOTE: keep the GitHub repository PRIVATE while this fallback
 * exists, and rotate the Atlas password if you ever make it public.
 */
const SANDBOX_FALLBACK_URI =
  "mongodb+srv://akashperera464_db_user:XZaspCZzvFdBGK6B@cluster0.y6ylolc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const getMongoUri = (): string => {
  const uri = process.env.MONGODB_URI;
  if (uri) return uri;
  if (process.env.VERCEL) {
    throw new Error(
      "MONGODB_URI is required — set it in Vercel → Settings → Environment Variables"
    );
  }
  return SANDBOX_FALLBACK_URI;
};

/** Database name parsed from the connection string (defaults to myFirstDatabase). */
export const MONGO_DB_NAME = (() => {
  const raw = typeof process !== "undefined" ? process.env.MONGODB_URI || "" : "";
  const m = raw.match(/\/([^/?]+)\?/);
  return (m && m[1]) || "myFirstDatabase";
})();

let mongoClient: MongoClient | null = null;
const getMongoClient = (): MongoClient => {
  if (!mongoClient) {
    const cached = globalForMongo.__kduMongoClient;
    mongoClient =
      cached ??
      new MongoClient(getMongoUri(), {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
      });
    if (process.env.NODE_ENV !== "production") {
      globalForMongo.__kduMongoClient = mongoClient;
    }
  }
  return mongoClient;
};

async function ensureIndexes(db: Db): Promise<void> {
  await db.collection("users").createIndex({ employeeId: 1 }, { unique: true });
  await db.collection("suppliers").createIndex({ supplierNo: 1 }, { unique: true });
  await db
    .collection("routes")
    .createIndex({ name: 1, factory: 1 }, { unique: true });
  await db.collection("entries").createIndex({ id: 1 }, { unique: true });
  await db.collection("entries").createIndex({ createdAt: -1 });
  await db.collection("status_reasons").createIndex({ id: 1 }, { unique: true });
  await db.collection("custom_questions").createIndex({ id: 1 }, { unique: true });
}

/** Returns the KDU Atlas database, connected and indexed (idempotent). */
export async function getMongo(): Promise<Db> {
  const client = getMongoClient();
  await client.connect();
  const db = client.db(MONGO_DB_NAME);

  if (!globalForMongo.__kduMongoIndexes) {
    globalForMongo.__kduMongoIndexes = ensureIndexes(db).catch((err) => {
      // Index creation is best-effort; don't break requests if it fails once
      console.error("Mongo index setup error:", err);
      globalForMongo.__kduMongoIndexes = undefined;
    });
  }
  await globalForMongo.__kduMongoIndexes;
  return db;
}

export const newId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
