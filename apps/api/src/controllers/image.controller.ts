import { logError, rateLimit } from "@repo/utils";
import { initiateUploadSchema } from "@repo/zod";
import type { Request, Response } from "express";
import {
  completeUploadService,
  uploadService,
} from "../services/image.service";

export const initiateUpload = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const userId = req.userId as string;
    const body = req.body;

    const validate = await initiateUploadSchema.safeParseAsync(body);

    if (!validate.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: validate.error.flatten(),
      });
    }

    // check for only image type

    const allowed = await rateLimit(
      `rate-limit:image-upload:${userId}`,
      15,
      15 * 60,
    );

    if (!allowed) {
      return res.status(429).json({
        message: "Too many requests. Try again later.",
      });
    }

    const { presignedUrl, imageId } = await uploadService(
      validate.data,
      userId,
    );

    return res.status(200).json({
      message: "Presigned URL generated successfully",
      presignedUrl: presignedUrl,
      imageId: imageId,
    });
  } catch (error) {
    logError(error, req, "Error while generating presigned url");

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const completeUpload = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const userId = req.userId;
    const imageId = req.params.imageId as string;

    const allowed = await rateLimit(
      `rate-limit:image-upload-complete:${userId}`,
      15,
      15 * 60,
    );

    if (!allowed) {
      return res.status(429).json({
        message: "Too many requests. Try again later.",
      });
    }

    await completeUploadService(userId, imageId);

    return res.status(200).json({
      message: "Image upload completed successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Image not found") {
      return res.status(404).json({
        message: "No image found",
      });
    }

    if (error instanceof Error && error.message === "Image upload has already been completed") {
      return res.status(404).json({
        message: "Image already uploaded",
      });
    }

    logError(error, req, "Error while completing upload");

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
