import { logger } from "@repo/logger";
import { logError } from "@repo/utils";
import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logError(err, req, "Unhandled application error");

  res.status(500).json({
    message: "Internal server error",
  });
};