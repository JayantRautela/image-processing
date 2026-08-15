import { logger } from "@repo/logger";
import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error(
    {
      err,
      method: req.method,
      url: req.originalUrl,
    },
    "Unhandled application error"
  );

  res.status(500).json({
    message: "Internal server error",
  });
};