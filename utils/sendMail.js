import nodemailer from "nodemailer";
import { config } from "dotenv";
config()

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async function (email, subject, message) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    
    port: 2525,
    secure:false,
    auth: {
      user: "4fc491a676d86e",
      pass: "5674fae4e40f62"
    }
  });

  // send mail with defined transport object
  await transporter.sendMail({
    from:process.env.SMTP_FROM_EMAIL, // sender address
    to: email , // user email
    subject: subject, // Subject line
    html: message, // html body
  });
};

export default sendEmail;