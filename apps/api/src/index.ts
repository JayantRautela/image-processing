import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

const app = express();

const PORT = process.env.PORT!;

app.use(express.json());
app.use(cors());

app.get('/health', (req: Request, res: Response) => {
  console.log("Incoming request from IP :- ", req.ip);

  return res.status(200).json({
    success: true,
    message: "OK",
  });
});

app.listen(PORT, () => {
  console.log(`Server started at PORT :- ${PORT}`);
});