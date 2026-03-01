import mongoose from "mongoose"

const MONGODB_URI =
  process.env.MONGODB_URI?.trim() ||
  (process.env.NODE_ENV !== "production" ? "mongodb://127.0.0.1:27017/clinvetia" : undefined)

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongooseCache: MongooseCache | undefined
}

export async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set (and no development fallback is available)")
  }

  if (!global.mongooseCache) {
    global.mongooseCache = { conn: null, promise: null }
  }

  if (global.mongooseCache.conn) {
    return global.mongooseCache.conn
  }

  if (!global.mongooseCache.promise) {
    global.mongooseCache.promise = mongoose.connect(MONGODB_URI).catch((error) => {
      global.mongooseCache = { conn: null, promise: null }
      throw error
    })
  }

  global.mongooseCache.conn = await global.mongooseCache.promise
  return global.mongooseCache.conn
}
