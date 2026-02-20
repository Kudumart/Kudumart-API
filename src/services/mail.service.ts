import dotenv from 'dotenv';
import nodemailer, { Transporter } from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';

dotenv.config();

const transporter: Transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT as string, 10),
  secure: process.env.MAIL_ENCRYPTION?.toLowerCase() === 'ssl', // true for SSL/TLS
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

transporter.verify()
  .then(() => console.log("Connected to email server"))
  .catch((err) => console.error("Unable to connect to email server:", err.message));

interface Attachment {
  filename: string;
  path: string;
}

export const sendMail = async (
  email: string, 
  subject: string, 
  message: string, 
  files: Attachment[] = []
): Promise<SentMessageInfo> => {
  try {
    const mailOptions = {
      from: process.env.MAIL_FROM_ADDRESS,
      to: email,
      subject: subject,
      text: "IWTYS LTD",
      html: message,
      attachments: files,
    };

    const info: SentMessageInfo = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error: any) {
    console.error("Error sending mail:", error.message);
    throw error;
  }
};
