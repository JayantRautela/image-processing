import { prisma } from "@repo/db";
import { logger } from "@repo/logger";
import { emailQueue } from "@repo/queue";
import { generateOTP, hashString } from "@repo/utils";
import { apiRedis } from "@repo/redis";

export const requestOtp = async (email: string) => {
  const user = await prisma.user.upsert({
    where: {
      email,
    },
    update: {},
    create: {
      email,
    },
  });

  const otp = generateOTP();
  const otpHash = await hashString(otp);

  if (process.env.NODE_ENV === "development") {
    logger.info(
      {
        otp: otp,
        email: email,
        userId: user.id
      },
      "OTP"
    )
  }

  await apiRedis.set(`otp:user:${user.id}`, otpHash, "EX", 300);

  await emailQueue.add(
    "send-otp-email",
    {
      email,
      otp,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  );
};
