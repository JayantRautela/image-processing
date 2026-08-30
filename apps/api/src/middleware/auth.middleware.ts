import { logError } from "@repo/utils";
import type { NextFunction, Request, Response } from "express";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization header missing",
      });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        message: "Invalid authorization header",
      });
    }

    const { payload } = await jwtVerify(token, secret);
    console.log(payload);

    if (
      payload.type !== "access" ||
      typeof payload.sub !== "string" ||
      typeof payload.sessionId !== "string"
    ) {
      return res.status(401).json({
        message: "Invalid access token",
      });
    }

    req.userId = payload.sub;
    req.sessionId = payload.sessionId;

    next();
  } catch (error) {
    logError(error, req, "Error in auth middleware");

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
