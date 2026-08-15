import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { logger, httpLogger } from "@repo/logger";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

const PORT = process.env.PORT!;

app.use(httpLogger)
app.use(express.json());
app.use(cors());

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ port: PORT }, "server started");
});