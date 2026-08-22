import nodemailer from "nodemailer";
import { AttachmentLike } from "nodemailer/lib/mailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string | AttachmentLike | Buffer<ArrayBufferLike> | undefined;
}

export const sendMail = async ({
  to,
  subject,
  text,
  html,
}: MailOptions): Promise<void> => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
};
