import { Queue } from "bullmq";
import { workerRedis } from "@repo/redis";

export const emailQueue = new Queue("email-processing", {
  connection: workerRedis,
});
