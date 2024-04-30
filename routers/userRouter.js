import express from 'express'
import { CreateAccount,LogIn,viewProfile,logOut ,Home,forgotPassword,changePassword,updateUser,User1,resetpassword} from '../controller/usercontroller.js'
import{ JWTauth} from '../middleware/JWT.js'
import upload from '../middleware/multer.middle.js'
const router = express.Router()
router.post('/rgister',upload.single('avatar'),CreateAccount)
router.post('/singIn',LogIn)
router.get('/me', JWTauth, viewProfile)
router.get('/logout',JWTauth,logOut)
router.post('/forgot',forgotPassword)
router.post('/change',JWTauth,changePassword)
router.put("/update/:id", JWTauth, upload.single("avatar"), updateUser);

router.post('/reset/:resetToken',resetpassword)
router.get('/get',Home)
router.get('/homeuseer',User1)

 export default router