const nodeMailer = require("nodemailer");

const transporter = nodeMailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `RFP System <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendMail;
