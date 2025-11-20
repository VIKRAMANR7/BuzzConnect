import nodemailer from "nodemailer";

const smtpUser = process.env.SMTP_USER ?? "";
const smtpPass = process.env.SMTP_PASS ?? "";
const senderEmail = process.env.SENDER_EMAIL ?? "";

if (!smtpUser || !smtpPass || !senderEmail) {
  throw new Error("❌ Missing SMTP environment variables.");
}

// SMTP Transporter
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail({ to, subject, body }: EmailPayload) {
  try {
    const response = await transporter.sendMail({
      from: senderEmail,
      to,
      subject,
      text: body,
    });

    return response;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Failed to send email");
  }
}

export default sendEmail;
