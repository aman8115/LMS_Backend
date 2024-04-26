import User from "../model/sschema.js";
import sendEmail from "../utils/sendMail.js";
import AppError from "../utils/utils.js";
import { configDotenv } from "dotenv";
const sendMessage = async (req,res,next)=> {
   const {name,email,message} = req.body;
   if(!name||!email||!message){
    return next( new AppError(" all field is required"),500)
   }
   try {
    const subject = 'Contact us form'
    const messageText = `${name}-${email} <br/> ${message}`
    
    await sendEmail( process.env.USER_EMAIL, subject,messageText)
    console.log(sendEmail)
    
   }catch(e){
    console.log(e);
    return next(new AppError("email not send try again",e.message, 400));
   
  }
  res.status(200).json({
    success:true,
    message:" Email send successfully",
   
})

 

}
export {
    sendMessage,
}