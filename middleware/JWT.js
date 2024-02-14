import JWT from 'jsonwebtoken'
import AppError from '../utils/utils.js'
const JWTauth = async  (req, res,next)=>{
    const token = (req.cookies&&req.cookies.token)||null
if(!token){
    return next(new AppError("please log in "),400)
}
const Payload =  await JWT.verify(token,process.env.SECRET);
if (!Payload) {
  return next(new AppError("Unauthorized, please login to continue", 401));
}
req.user = Payload
return  next()
console.log("this is payload",Payload)
 
}
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
    const subscription = req.user.subscription;
    const currentRole = req.user.role;
    if(currentRole !== 'ADMIN' && subscription.status !== 'active'){
      return next(new AppError(' please subscribe your course  after try'))
    }
    next()
  }
export {
JWTauth,
authorizeRoles,
authorizesubscriber
}
    