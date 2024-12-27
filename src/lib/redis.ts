// app/lib/redis.ts
import { createClient } from 'redis'

export const redisClient = createClient({
  url: process.env.voting_REDIS_URL, // e.g. "rediss://:password@host:port"
})

redisClient.on('error', (err) => console.error('Redis Client Error', err))

// Optionally connect on import (or do a lazy connect in your server actions).
redisClient.connect().catch(console.error)
