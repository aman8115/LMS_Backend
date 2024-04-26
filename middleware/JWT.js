import JWT from 'jsonwebtoken'
import AppError from '../utils/utils.js'
import User from '../model/sschema.js';
// const JWTauth = async  (req, res,next)=>{
//     const token = (req.cookies&&req.cookies.token)||null
//     console.log("This is token",token)
// if(!token){
//     return next(new AppError("please log in "),400)
// }

// const Payload =  await JWT.verify(token,process.env.SECRET);
// if (!Payload) {
//   return next(new AppError("Unauthorized, please login to continue", 401));
// }
// req.user = Payload
// return  next()
// console.log("this is payload",Payload)
 
// }
// const JWTauth = async (req, res, next) => {
//   const token = (req.cookies && req.cookies.token) || null;
//   console.log("Token:", token);

//   if (!token) {
//       return next(new AppError("Please log in", 400));
//   }

//   try {
//       const payload = await JWT.verify(token, process.env.SECRET);
//       if (!payload) {
//           return next(new AppError("Unauthorized, please login to continue", 401));
//       }
//       req.user = payload;
//       console.log("Payload:", payload);
//       return next();
//   } catch (error) {
//       console.error("Error verifying token:", error);
//       return next(new AppError("Error verifying token", 500));
//   }
// };
const JWTauth = async (req, res, next) => {
  const token = (req.cookies && req.cookies.token) || null;
  if (!token) {
      return next(new AppError("please log in "), 400);
  }
  
  try {
      const payload = await JWT.verify(token, process.env.SECRET);
      if (!payload) {
          return next(new AppError("Unauthorized, please login to continue", 401));
      }
      
      req.user = payload;
       // Moved logging inside try block
      
      return next();
  } catch (error) {
      // Handle JWT verification errors
      return next(new AppError("Error verifying token", 500));
  }
};
 const authorizeRoles = (...roles) =>
  async (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to view this route", 403)
      );
    }

    return  next();
  };
  const authorizesubscriber = async (req,res,next)=>{
  
  const user = await User.findById(req.user.id)
  console.log("user methode",user)
  const status = user.subscription.status
  console.log('status methoed',status)
  const currenRole = user.role
  console.log(currenRole)
  if(currenRole!=="ADMIN" && status!=="active"){
    return next( new AppError(" please  subscribe course to access this rout "),500)

  }
    return next()
  }
export {
JWTauth,
authorizeRoles,
authorizesubscriber
}
    