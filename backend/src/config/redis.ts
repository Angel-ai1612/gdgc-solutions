import Redis from 'ioredis'
import dotenv from 'dotenv'
dotenv.config()

const redisUrl = process.env.REDIS_URL

// Only connect if URL is present, otherwise use null (fallback to memory)
export const redis = redisUrl 
  ? new Redis(redisUrl, { maxRetriesPerRequest: 1, connectTimeout: 5000 }) 
  : null

if (redis) {
  redis.on('connect', () => console.log('✅ Redis connected'))
  redis.on('error', (err) => console.error('❌ Redis error:', err.message))
} else {
  console.log('⚠️  Redis URL missing. App will use in-memory storage.')
}
