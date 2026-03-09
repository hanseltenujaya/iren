import mongoose from 'mongoose';

// Use a cached connection to avoid opening too many connections in serverless
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null };
}

const cached = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

async function dbConnect(): Promise<mongoose.Connection> {
  // Defer the env check to request time so the build succeeds without .env.local
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Please define the MONGODB_URI environment variable in .env.local');

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, { bufferCommands: false })
      .then((m) => m.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
