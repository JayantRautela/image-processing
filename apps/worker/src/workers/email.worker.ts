import { sendMail } from "@repo/email";
import { logger } from "@repo/logger";
import { workerRedis } from "@repo/redis";
import { Worker, Job } from "bullmq";

type SendOtpEmailData = {
  email: string;
  otp: string;
};

export const emailWorker = new Worker<SendOtpEmailData>(
  "email-processing",
  async (job: Job<SendOtpEmailData>) => {
    switch (job.name) {
      case "send-otp-email": {
        logger.info(
          {
            email: job.data.email,
            jobId: job.id,
          },
          "Sending OTP email",
        );

        await sendMail({
          to: job.data.email,
          subject: "OTP for login",
          text: `your otp to login into your account is ${job.data.otp}`,
        });

        return;
      }

      default:
        throw new Error(`Unknown job: ${job.name}`);
    }
  },
  {
    connection: workerRedis,
  },
);
