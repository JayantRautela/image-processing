import { apiRedis } from "@repo/redis";

export const rateLimit = async (key: string, limit: number, window: number) => {
  const count = await apiRedis.incr(key);

  if (count === 1) {
    await apiRedis.expire(key, window);
  }

  return count <= limit;
};
