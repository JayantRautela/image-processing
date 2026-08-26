import { logger } from "@repo/logger";
import { emailWorker } from "./workers/email.worker";

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
  logger.error(
    { error },
    "Email worker error",
  );
});
