import express from "express";
import cors from "cors";
import { logger, httpLogger } from "@repo/logger";
import { errorHandler } from "./middleware/error.middleware";
import cookieParser from "cookie-parser";
import AuthRoute from "./routes/auth.route";

const app = express();

const PORT = process.env.PORT!;

app.use(httpLogger);
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(errorHandler);

app.use("/auth", AuthRoute);

app.listen(PORT, () => {
  logger.info({ port: PORT }, "server started");
});
