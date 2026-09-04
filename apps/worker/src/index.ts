import { logger } from "@repo/logger";
import { emailWorker } from "./workers/email.worker";
import { imageWorker } from "./workers/image.worker";

logger.info("Worker started");

emailWorker.on("completed", (job) => {
  logger.info(
    {
      jobId: job.id,
      jobName: job.name,
    },
    "Email job completed",
  );
});

emailWorker.on("failed", (job, error) => {
  logger.error(
    {
      jobId: job?.id,
      jobName: job?.name,
      error,
    },
    "Email job failed",
  );
});

emailWorker.on("error", (error) => {
  logger.error({ error }, "Email worker error");
});

imageWorker.on("completed", (job) => {
  logger.info(
    {
      jobId: job.id,
      jobName: job.name,
    },
    "Image job completed",
  );
});

imageWorker.on("failed", (job, error) => {
  logger.error(
    {
      jobId: job?.id,
      jobName: job?.name,
      error,
    },
    "Image job failed",
  );
});

imageWorker.on("error", (error) => {
  logger.error({ error }, "Image worker error");
});

process.on("SIGTERM", async () => {
  logger.info("Shutting down worker...");
  await imageWorker.close();
  await emailWorker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("Shutting down worker...");
  await imageWorker.close();
  await emailWorker.close();
  process.exit(0);
});
