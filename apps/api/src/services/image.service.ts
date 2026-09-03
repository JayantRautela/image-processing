import { generatePresignedUploadUrl, objectExists } from "@repo/aws";
import { prisma } from "@repo/db";
import { imageQueue } from "@repo/queue";
import { v4 as uuid } from "uuid";

const BUCKET = process.env.AWS_S3_BUCKET_NAME!;

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

  try {
    const presignedUrl = await generatePresignedUploadUrl({
      bucket: BUCKET,
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

export const completeUploadService = async (
  userId: string,
  imageId: string,
) => {
  const image = await prisma.image.findFirst({
    where: {
      id: imageId,
      userId,
    },
  });

  if (!image) {
    throw new Error("Image not found");
  }

  const imageExists = await objectExists({
    bucket: BUCKET,
    key: image.fileKey,
  });

  if (!imageExists) {
    throw new Error("Image not found");
  }

  if (image.state !== "UPLOADING") {
    throw new Error("Image upload has already been completed");
  }

  await prisma.image.update({
    where: {
      id: imageId,
    },
    data: {
      state: "PROCESSING",
    },
  });

  await imageQueue.add(
    "process-image",
    {
      imageId: image.id,
    },
    {
      jobId: `process-image:${image.id}`,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  );
};

export const fetchAllImages = async (
  userId: string,
  cursor?: string,
  limit: number = 10,
) => {
  const images = await prisma.image.findMany({
    where: {
      userId: userId,
    },
    take: limit + 1,

    cursor: cursor
      ? {
          id: cursor,
        }
      : undefined,

    skip: cursor ? 1 : 0,

    orderBy: {
      createdAt: "desc",
    },
  });

  const hasMore = images.length > limit;

  const data = hasMore ? images.slice(0, limit) : images;

  const nextCursor = hasMore ? images[images.length - 1]!.id : null;

  return {
    images: data,
    nextCursor,
    hasMore,
  };
};
