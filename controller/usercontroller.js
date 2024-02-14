import { JWTauth } from "../middleware/JWT.js";
import path from "path";
import sendEmail from "../utils/sendMail.js"
import AppError from "../utils/utils.js";
import User  from '../model/sschema.js'
import cloudinary from "cloudinary"
import fs from "fs/promises"
const cookieOption = {
  maxAge:12*60*60*1000,
  httpOnly:true,
  secure:true
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
    const {email,password} = req.body
    if(!email||!password){
        return next(new AppError( 'please enter  email and password'))
    }
    const user = await  User.findOne({email}).select('+password')

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
const viewProfile = async  (req,res,next)=>{
    try{
        const userId = req.user.id
        const userInfo = await User.findById(userId)
        return  res.status(200).json({
            success:true,
            message:" user data print successfully",
            userInfo
        })

    } catch(e){
        return next( new AppError(' user does not exist in database ',400))


    }

}
const logOut = (req,res)=>{
    try {
        const cookieOption =  {
            maxAge:0,
            secure:true,
            httpOnly:true,
            
    
        }
        res.cookie("token",null,cookieOption)
        res.status(200).json({
            success:true,
            message:" user loggdout successfully"
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
  const user =  await User.findOne({email})
  if(!user){
    return next(new AppError(" email is not exist in database",500))
  }
  const resetToken = await user. generateResettoken()
  console.log(" TOken ",resetToken) 
 /* await user.save() */
  const passwordURL = ` ${ process.env.FORNTENDURL} /reset-password/ ${ resetToken}`
  console.log(" Password url",passwordURL)
  const subject = ' Reset password'
  const message = ` reset your password <a href ${passwordURL} target ="blanck">Reset your Password </a>`
  try {

     await sendEmail(email,subject,message)
     res.status(200).json({
      success:true,
      message:` reset token password has been sent ${email}`
     })
    
  } catch (e) {
    user.forgotPasswordExpiry = undefined
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
  const user = await User.findOne({forgotPasswordToken,forgotPasswordExpiry:{$gt:Date.now()}})
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
const updateUser = async(req,res,next)=>{
  const{fullName} = req.body;
  const{id} = req.params;
  const user = await User.findById(id)
  if(!user){
    return next(new AppError(" user is not exist in database"),500)
  }
  if(req.fullName){
    user.fullName = fullName
  }
  if(req.file){
    await cloudinary.v2.uploader.destroy(user.avatar.public_id)
  }
  console.log(" uploading file" , req.file)
     if(req.file){
        
        try{
          const result =  await cloudinary.v2.uploader.upload(req.file.path,{
            folder:'lms',
            width:250,
            height:250,
            gravity:'faces',
            crop:'fill'
          })
          if(result){
            user.avatar.public_id = result.public_id;
            user.avatar.secure_url = result.secure_url;
             // remove file 
            fs.rm(`uploads/${req.file.filename}`);
          }
        }catch(e){
            return next( new AppError(' file not uploaded try again ',400))

        }
     }
     await user.save()
     res.status(200).json({
      success:true,
      message:" your profile update successfully"
     })

}
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