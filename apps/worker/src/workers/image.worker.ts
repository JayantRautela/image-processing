import { prisma } from "@repo/db";
import { logger } from "@repo/logger";
import { workerRedis } from "@repo/redis";
import { Worker, Job } from "bullmq";
import { generateThumbnail } from "../processors/image.processor";
import { getObject, putObject } from "@repo/aws";

type ProcessImage = {
  imageId: string;
};

const BUCKET = process.env.AWS_S3_BUCKET_NAME!;

export const imageWorker = new Worker<ProcessImage>(
  "image-processing",
  async (job: Job<ProcessImage>) => {
    switch (job.name) {
      case "process-image": {
        logger.info(
          {
            imageId: job.data.imageId,
          },
          "Processing image",
        );

        const image = await prisma.image.findUnique({
          where: {
            id: job.data.imageId,
          },
        });

        if (!image) {
          throw new Error("Image not found");
        }

        await prisma.image.update({
          where: {
            id: job.data.imageId,
          },
          data: {
            state: "PROCESSING",
          },
        });

        const originalBuffer = await getObject({
          bucket: BUCKET,
          key: image.fileKey,
        });

        const thumbnail = await generateThumbnail(originalBuffer);

        const thumbnailKey = `uploads/thumbnails/${image.id}.jpeg`;

        await putObject({
          bucket: BUCKET,
          key: `uploads/thumbnails/${image.id}.webp`,
          image: thumbnail.buffer,
          contentType: "image/jpeg",
        });

        await prisma.image.update({
          where: {
            id: job.data.imageId,
          },
          data: {
            state: "READY",
            thumbnailKey: thumbnailKey,
          },
        });
      }

      default:
        throw new Error(`Unknown job: ${job.name}`);
    }
  },
  {
    connection: workerRedis,
  },
);

imageWorker.on("failed", async (job, error) => {
  if (!job) return;

  const maxAttempts = job.opts.attempts ?? 1;

  const errorMessage =
    error instanceof Error ? error.message : "Unknown processing error";

  if (job.attemptsMade === maxAttempts) {
    await prisma.image.update({
      where: {
        id: job.data.imageId,
      },
      data: {
        state: "FAILED",
        processingError: errorMessage,
      },
    });
  }
});
