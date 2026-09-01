import { generatePresignedUploadUrl } from "@repo/aws";
import { prisma } from "@repo/db";
import { logger } from "@repo/logger";
import { v4 as uuid } from "uuid";

interface ImageProps {
  originalName: string;
  mimeType: "image/jpeg" | "image/jpg" | "image/png" | "image/webp";
  size: bigint;
  width: number;
  height: number;
}

export const uploadService = async (data: ImageProps, userId: string) => {
  const extension = data.mimeType.split("/")[1];
  const key = `uploads/raw/${uuid()}.${extension}`;

  const image = await prisma.image.create({
    data: {
      originalName: data.originalName,
      fileKey: key,
      userId: userId,
      size: data.size,
      height: data.height,
      width: data.width,
      mimeType: data.mimeType,
    },
  });

  if (!process.env.AWS_S3_BUCKET_NAME) {
    logger.error("No AWS Bucket Name provided");
    throw new Error("AWS_S3_BUCKET_NAME is not configured");
  }

  try {
    const presignedUrl = await generatePresignedUploadUrl({
      bucket: process.env.AWS_S3_BUCKET_NAME,
      key,
      contentType: data.mimeType,
    });

    return {
      imageId: image.id,
      presignedUrl,
    };
  } catch (error) {
    await prisma.image.delete({
      where: {
        id: image.id,
      },
    });

    throw error;
  }
};
