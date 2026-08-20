import { Queue } from "bullmq";
import { workerRedis } from "@repo/redis"; 

export const imageQueue = new Queue("image-processing", { 
  connection: workerRedis,
});
