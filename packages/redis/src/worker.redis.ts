import Redis from "ioredis";

export const workerRedis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});