import Redis from "ioredis";
import { logger } from "@repo/logger";

export const redis = new Redis(process.env.REDIS_URL!);

redis.on("connect", () => {
  logger.info("Redis connected");
});

redis.on("error", (error) => {
  logger.error({ error: error }, "Redis error");
});
