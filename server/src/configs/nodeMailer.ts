import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
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
      from: process.env.SENDER_EMAIL!,
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
