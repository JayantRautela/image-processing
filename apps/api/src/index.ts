import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { logger, httpLogger } from "@repo/logger";
import { errorHandler } from "./middleware/error.middleware";
import cookieParser from "cookie-parser";

const app = express();

const PORT = process.env.PORT!;

app.use(httpLogger)
app.use(cookieParser())
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ port: PORT }, "server started");
});