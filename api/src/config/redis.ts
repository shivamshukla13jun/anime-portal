import { createClient } from 'redis';
import config from 'config';
const  { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD ,REDIS_UERNAME}=config

// Create a Redis client instance
const redisClient = createClient({
  username: REDIS_UERNAME,
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: Number(REDIS_PORT || 6379),
  },
});

// Listen for connection events
redisClient.on('connect', () => {
  console.log('✅ Redis client connected successfully');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

// Connect the client to the Redis server
// redisClient.connect().catch(console.error);

export default redisClient;
