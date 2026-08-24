import { logger } from "@repo/logger";
import type { Request, Response } from "express";
import { enterUserOtpSchema, enterUserSchema } from "@repo/zod";
import { checkOtp, requestOtp } from "../services/auth.service";

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

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const validate = await enterUserOtpSchema.safeParseAsync(body);

    if (!validate.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: validate.error.flatten(),
      });
    }

    const isOtpCorrect = await checkOtp(validate.data.email, validate.data.otp);

    if (isOtpCorrect === false) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    return res.status(200).json({
      message: "User verified",
    });
  } catch (error) {
    logger.error(
      {
        error,
        method: req.method,
        url: req.originalUrl,
      },
      "Error in OTP verification",
    );

    if (error instanceof Error && error.message === "Invalid Credentials") {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
