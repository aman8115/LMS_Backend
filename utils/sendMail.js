import nodemailer from "nodemailer";
import { configDotenv } from "dotenv";

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async function (email, subject, message) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false, // true for 465, false for other ports
    auth: {
      
    },
  });

  // send mail with defined transport object
  await transporter.sendMail({
    from:email, // sender address
    to: process.env.SMTP_FROM_EMAI, // user email
    subject: subject, // Subject line
    html: message, // html body
  });
};

export default sendEmail;