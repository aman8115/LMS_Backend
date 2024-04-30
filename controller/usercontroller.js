import { config, configDotenv } from "dotenv";
config()
import { JWTauth } from "../middleware/JWT.js";
import path from "path";
import sendEmail from "../utils/sendMail.js"
import AppError from "../utils/utils.js";
import User  from '../model/sschema.js'
import cloudinary from "cloudinary"
import fs from "fs/promises"
import crypto from 'crypto'
const cookieOption = {
  maxAge:12*60*60*1000,
  httpOnly:true,
  secure:process.env.SECRET ==='production' ? true : fals
}
console.log(cookieOption)
const CreateAccount = async (req,res,next)=>{
  const {fullName,email ,password} = req.body;
  if(!fullName||!email||!password){
    return next( new AppError(' All fiedl is required'),500)
  }
  const existuser = await User.findOne({email})
  if(existuser){
    return next (new AppError('user already with this email'),501)
  }
  const user = await User.create({
    fullName,email,password,avatar:{
      public_id:email,
      secure_url:"https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg"

    }
  })
  if(!user){
    return next(new AppError("registration do not successful try Again!"),502)
  }
  if(req.file){
    try{
      const result = await cloudinary.v2.uploader.upload(req.file.path,{
        folder:'lms',
        width:250,
        height:250,
        gravity:'faces',
        crop:'fill'
      })
      if(result){
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;
        fs.rm(`uploads/${req.file.filename}`)
      }

    }catch(e){
      return next( new AppError(` file not upload try again ${e.message}`))

    }
  }
  await user.save()
  user.password = undefined;
  const token  = await user.genrateJWTtoken();
  res.cookie('token',token,cookieOption)
  res.status(200).json({
    success:true,
    message:"user registration successfull",
    user
  })

}



const LogIn =  async(req,res,next)=>{
   try {
    const {email, password,} = req.body
    if(!email||!password){
        return next(new AppError( 'please enter  email and password'))
    }
    const user = await User.findOne({email}).select('+password')

   if(!(user && !(await user.comparePassword(password)))){
    return next( new AppError(" email and password are  worng"),400)
   }
    const token = await user.genrateJWTtoken()
    user.password = undefined;
    res.cookie("token",token,cookieOption)
    res.status(200).json({
        success:true,
        message:" user loggdIn successfully",
        user
    })
   } catch (e) {
    res.status(400).json({
      success:false,
      message:` user not login ${e}`
    })
    
   }

}

const viewProfile = async(req,res,next)=>{
  try{
            const id = req.user.id
            const user = await User.findById(id)
            res.status(200).json({
              success:true,
              message:" User print successfully",
              userInfo:user
            })
  }catch(e){
    return next(new AppError( " user does not exist in database"))
  }
}

const logOut = (req,res)=>{
    try {
        const cookieOption =  {
            maxAge:0,
            secure:  process.env.SECRET === 'production' ? true : false,
            httpOnly:true,
            
    
        }
        res.cookie("token",null,cookieOption)
        res.status(200).json({
            success:true,
            message:" user logout successfully"
        })
    } catch (error) {
        return next(new AppError(' user not logdout ',400))
        
    }

}
const Home = (req,res)=>{
    res.status(200).json({
        success:true,
        message:" this is LMS Project "
    })
}
const forgotPassword = async (req,res,next)=>{
  const{email} = req.body;
  if(!email){
    return next( new AppError( "please enter your email",500))
  }
  console.log(email)
  const user =  await User.findOne({email})
  if(!user){
    return next(new AppError(" email is not exist in database",500))
  }
  const resetToken = await user.generateResettoken()
  console.log(" TOken ",resetToken) 
  await user.save() 
 console.log(process.env.FORNTEND_URL)
 const resetPasswordUrl = `${process.env.FORNTEND_URL}reset-password/${resetToken}`
  console.log(" Password url",resetPasswordUrl)
  const subject = ' Reset password'
  const message = ` reset your password <a href ${resetPasswordUrl} target ="blanck">Reset your Password </a>`
  try {

     await sendEmail(email,subject,message)
     res.status(200).json({
      success:true,
      message:` reset token password has been sent ${email}`
     })
    
  } catch (e) {
    user.forgotPasswordExpiry= undefined
    user.forgotPasswordToken = undefined
    await user.save()
    return next(new AppError (` Token not sent ${e.message}`))
    
  }
}
const resetpassword =  async (req,res,next)=>{
  const{resetToken} = req.params;
  const{password} =  req.body
 try{
  const forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  console.log(forgotPasswordToken)
 const user  = await User.findOne({forgotPasswordToken})
  console.log(user)
  if(!user){
    return next( new AppError ( "token invalid and expired"),500)
  }
  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  user.save()
  res.status(200).json({
    success:true,
    message:" your password change successfully"
  })

 }catch(e){
  res.status(500).json({
    success:false,
    message:` your password didnot rest ${e.message}`
  })
 }


}
const changePassword = async(req,res, next) =>{
  const {oldPassword,newPassword} = req.body;
  const{id} =  req.user
  if(!oldPassword||!newPassword){
    return next(new AppError(" oldpassword and newpassword is required"),500)
  }
  const user = await User.findById(id).select('+password');
  if(!user){
    return next(new AppError(" user not exist in database"),500)
  }
  const isvalidPassword = await user.comparePassword(oldPassword);
  if(!isvalidPassword){
    return next(new AppError(" please enter a correct password "),5000)
  }
  user.password = newPassword;
  await user.save()
  user.password = undefined;
  res.status(200).json({
    success:true,
    message:" your password has been changed successfully"
  })

}


// const updateUser =  async (req,res, next)=>{
//  const {fullName} = req.body
//  console.log("Request body name",req.fullName)
//   const { id } = req.params;
//  console.log("User id",id)
//  const user = await User.findById(id)
//   console.log(" Database user ",user)
//   if(!user){
//     return next( new AppError(" user  doesnot exist in database"))
//   }
//   console.log(" fullname",fullName)
//   if(fullName){
//     user.fullName = fullName
//   }
//   if(req.file){
//     await cloudinary.v2.uploader.destroy(user.avatar.public_id)

//   }
//   console.log(req.file)
//   if(req.file){
//     try{
//       const result = await cloudinary.v2.uploader.upload(req.file.path,{
//         folder:'lms',
//         width:250,
//         height:250,
//         crop:"fill",
//         gravity:"faces"
//       })
//       if(result){
//         user.avatar.public_id  = result.public_id;
//         user.avatar.secure_url = result.secure_url;
//       }

//     }catch(e){
//       return next ( ` your file could not uploaded try again!! ${ e.message}`)
//     }
//   }
//   await user.save();
//   res.status(200).json({
//     success:true,
//     message:" Your profile updated successfully!!",
//     user
//   })

  
// }
const updateUser = async (req, res, next) => {
  // Destructuring the necessary data from the req object
  const { fullName } = req.body;
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return next(new AppError('Invalid user id or user does not exist'));
  }
            console.log(fullName)
  if (fullName) {
    user.fullName = fullName;
  }

  // Run only if user sends a file
  console.log(req.file)
  if (req.file) {
    // Deletes the old image uploaded by the user
    await cloudinary.v2.uploader.destroy(user.avatar.secure_url);

    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: 'lms', // Save files in a folder named lms
        width: 250,
        height: 250,
        gravity: 'faces', // This option tells cloudinary to center the image around detected faces (if any) after cropping or resizing the original image
        crop: 'fill',
      });

      // If success
      if (result) {
        // Set the public_id and secure_url in DB
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // After successful upload remove the file from local storage
        fs.rm(`uploads/${req.file.filename}`);
      }
    } catch (error) {
      return next(
        new AppError(error || 'File not uploaded, please try again', 400)
      );
    }
  }

  // Save the user object
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User details updated successfully',
    user
  });
};

const User1 = (req, res)=>{
 try{
  res.status(200).json({
    success:true,
    message:"  youe  useer  print successfully at home user"
  })

 }catch(e){
  res.status(400).json({
     success:false,
     message:` your user not print at  user function`
  })
 }
}

export{
    CreateAccount,
    LogIn,
    viewProfile,
    logOut,
    
    forgotPassword,
    resetpassword,
    changePassword,
    updateUser,
    User1,
    
    Home
}