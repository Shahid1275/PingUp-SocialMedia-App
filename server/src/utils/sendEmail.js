const nodemailer = require("nodemailer");
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_MAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info("Email sent:", { response: info.response });
    return true;
  } catch (error) {
    logger.error("Error sending email:", { error: error.message, stack: error.stack });
    return false;
  }
};

module.exports = sendEmail;
