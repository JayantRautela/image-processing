import Redis from "ioredis";
import { logger } from "@repo/logger";

export const apiRedis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});

apiRedis.on("connect", () => {
  logger.info("Redis connected");
});

apiRedis.on("error", (error) => {
  logger.error({ error: error }, "Redis error");
});
