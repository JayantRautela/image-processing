import { z } from "zod";

export const enterUserSchema = z.object({
  email: z.email(),
});

export const enterUserOtpSchema = z.object({
  email: z.email(),
  otp: z.string().length(6, { message: "OTP length must be 6" }),
});

export const getOtpSchema = z.object({
  email: z.email(),
});
