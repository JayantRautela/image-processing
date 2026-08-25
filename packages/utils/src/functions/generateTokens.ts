import crypto from "node:crypto";
import { SignJWT } from "jose";

export const getRefreshToken = (): string => {
  return crypto.randomBytes(64).toString("hex");
};

export const getAccessToken = async (
  sessionId: string,
  userId: string,
): Promise<string> => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const accessToken = await new SignJWT({
    type: "access",
    sessionId: sessionId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);

  return accessToken;
};
