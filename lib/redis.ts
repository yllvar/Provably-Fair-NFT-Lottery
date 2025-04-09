import { Redis } from "@upstash/redis"

// Initialize Redis client with fallback
let redisClient: Redis | null = null

try {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (url && token) {
    redisClient = new Redis({
      url,
      token,
    })
  } else {
    console.warn("Redis credentials not available. Redis caching will not work.")
  }
} catch (error) {
  console.error("Redis initialization error:", error)
}

// Create a safer version of Redis that checks if Redis is initialized
export const redis = {
  get: async (key: string) => {
    if (!redisClient) return null
    try {
      return await redisClient.get(key)
    } catch (error) {
      console.error("Redis get error:", error)
      return null
    }
  },
  set: async (key: string, value: any, ...args: any[]) => {
    if (!redisClient) return null
    try {
      return await redisClient.set(key, value, ...args)
    } catch (error) {
      console.error("Redis set error:", error)
      return null
    }
  },
}
