import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not defined. Add it to your .env.local file."
  );
}

/**
 * Cached connection object stored on the Node.js global namespace.
 * This prevents connection storming in serverless environments (Vercel/Lambda)
 * where functions spin up and tear down rapidly. Without this cache, every
 * function invocation would open a new database connection, exhausting the
 * MongoDB Atlas connection pool under traffic.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var __mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.__mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.__mongooseCache) {
  global.__mongooseCache = cache;
}

export async function connectDB(): Promise<Mongoose> {
  // Return existing connection immediately if available
  if (cache.conn) {
    return cache.conn;
  }

  // If a connection is in progress, wait for it
  if (!cache.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,       // Max concurrent connections
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cache.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB connected successfully");
      return mongoose;
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}

export default connectDB;
