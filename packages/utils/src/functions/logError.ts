import { logger } from "@repo/logger";

export const logError = (error: Error | any,  req?: any, message?: string) => {
  logger.error(
      {
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
        method: req.method,
        url: req.originalUrl,
      },
      message,
    );
}