import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
  const msg = {
    from,
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(msg);
  console.log('Email sent:', info && info.messageId ? info.messageId : info);
  return info;
};

export default sendEmail;
