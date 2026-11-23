import dotenv from "dotenv";
dotenv.config(); // 👈 Load env variables

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true, // true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendMail(to, subject, text, html) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
}

export { sendMail };
