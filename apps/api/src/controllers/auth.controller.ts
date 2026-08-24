import { logger } from "@repo/logger";
import type { Request, Response } from "express";
import { enterUserSchema } from "@repo/zod";
import { requestOtp } from "../services/auth.service";

export const auth = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const validate = await enterUserSchema.safeParseAsync(body);

    if (!validate.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: validate.error.flatten(),
      });
    }

    await requestOtp(validate.data?.email);

    return res.status(201).json({
      message: "Otp sent",
    });
  } catch (error) {
    logger.error(
      {
        error,
        method: req.method,
        url: req.originalUrl,
      },
      "Error while entering user",
    );

    res.status(500).json({
      message: "Internal server error",
    });
  }
};
