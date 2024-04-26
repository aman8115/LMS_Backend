import  express  from "express";
import{getRazorPayId,buySubscription, cancelSubscription, verifyUserPayment, viewPayment


} from '../controller/payment.controller.js'
import { JWTauth, authorizeRoles,authorizesubscriber} from "../middleware/JWT.js";


const router = express.Router()
router.route('/getRazorpayId').get(JWTauth,getRazorPayId)
router.route('/subscribe').post(JWTauth,buySubscription)
router.route('/verifypayments').post(JWTauth,verifyUserPayment)
router.route('/cancelsubscription').post(JWTauth, cancelSubscription);
router.route('/').get(JWTauth,authorizeRoles("ADMIN"),viewPayment)

export default router