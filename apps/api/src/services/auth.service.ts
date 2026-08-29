import { prisma } from "@repo/db";
import { logger } from "@repo/logger";
import { emailQueue } from "@repo/queue";
import {
  generateOTP,
  getAccessToken,
  getRefreshToken,
  hashString,
} from "@repo/utils";
import { apiRedis } from "@repo/redis";

type AuthTokens = {
  refreshToken: string;
  accessToken: string;
};

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
        userId: user.id,
      },
      "OTP",
    );
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

export const checkOtp = async (
  email: string,
  otp: string,
): Promise<AuthTokens | false> => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new Error("Invalid Credentials");
  }

  const otpHash = await hashString(otp);
  const storedOtpHash = await apiRedis.get(`otp:user:${user.id}`);

  if (!storedOtpHash || storedOtpHash !== otpHash) {
    return false;
  }

  await apiRedis.del(`otp:user:${user.id}`);

  const refreshToken = getRefreshToken();
  const refreshTokenHash = await hashString(refreshToken);

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const accessToken = await getAccessToken(session.id, user.id);

  return { refreshToken: refreshToken, accessToken: accessToken };
};

export const getToken = async (refreshToken: string): Promise<string> => {
  const refreshTokenHash = await hashString(refreshToken);

  const session = await prisma.session.findFirst({
    where: {
      refreshTokenHash: refreshTokenHash,
      expiresAt: undefined,
      revoked: false,
    },
  });

  if (!session) {
    throw new Error(" ");
  }

  const accessToken = await getAccessToken(session.id, session.userId);

  return accessToken;
}
