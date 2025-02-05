const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: "omarhanyaref55@gmail.com", pass: "pifmewtqmfsdnapd" },
  });

  await transporter.sendMail({
    from: "omarhanyaref55@gmail.com",
    to,
    subject,
    text,
  });
};

module.exports = sendEmail;
