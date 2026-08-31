import type { Request, Response } from "express";
import { enterUserOtpSchema, enterUserSchema, getOtpSchema } from "@repo/zod";
import {
  checkOtp,
  getToken,
  logoutUser,
  requestOtp,
} from "../services/auth.service";
import { logError, rateLimit } from "@repo/utils";

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

    const allowed = await rateLimit(
      `rate-limit:otp-request:${validate.data.email}`,
      5,
      15 * 60,
    );

    if (!allowed) {
      return res.status(429).json({
        message: "Too many OTP requests. Try again later.",
      });
    }

    await requestOtp(validate.data?.email);

    return res.status(201).json({
      message: "Otp sent",
    });
  } catch (error) {
    logError(error, req, "Error while entering user");

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

    const allowed = await rateLimit(
      `rate-limit:otp-verify:${validate.data.email}`,
      5,
      15 * 60,
    );

    if (!allowed) {
      return res.status(429).json({
        message: "Too many OTP attempts. Try again later.",
      });
    }

    const tokens = await checkOtp(validate.data.email, validate.data.otp);

    if (tokens === false) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/auth",
    });

    return res.status(200).json({
      message: "User verified",
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    logError(error, req, "Error in OTP verification");

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

export const getOtp = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const validate = await getOtpSchema.safeParseAsync(body);

    if (!validate.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: validate.error.flatten(),
      });
    }

    const allowed = await rateLimit(
      `rate-limit:get-otp:${validate.data.email}`,
      1,
      1 * 60,
    );

    if (!allowed) {
      return res.status(429).json({
        message: "Please try again in 1 minute",
      });
    }

    await requestOtp(validate.data.email);

    return res.status(200).json({
      message: "Otp sent",
    });
  } catch (error) {
    logError(error, req, "Error in OTP verification");

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const allowed = await rateLimit(
      `rate-limit:otp-request:${req.ip}`,
      5,
      15 * 60,
    );

    if (!allowed) {
      return res.status(429).json({
        message: "Too many OTP requests. Try again later.",
      });
    }

    const accessToken = await getToken(refreshToken);

    return res.status(200).json({
      message: "Tokens refreshed successgully",
      accessToken: accessToken,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Error refreshing tokens") {
      return res.status(400).json({
        message: "Invalid request",
      });
    }

    logError(error, req, "Error in OTP verification");

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const sessionId = req.sessionId as string;
    const refreshToken = req.cookies.refreshToken;

    const allowed = await rateLimit(
      `rate-limit:logout:${userId}`,
      10,
      10 * 60
    );

    if (!allowed) {
      return res.status(429).json({
        message: "Too many OTP requests. Try again later.",
      });
    }

    await logoutUser(userId, sessionId, refreshToken);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/auth",
    });

    return res.status(200).json({
      message: "User logged out",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "No Session Found") {
      return res.status(404).json({
        message: "No session found",
      });
    }

    logError(error, req, "Error while logging out");

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
