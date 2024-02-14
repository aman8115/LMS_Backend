import express from "express"
import{getrazropayAPI,buySubscription,verifySubscription,cancelSubsciption,viewPayment} from "../controller/payment.controller.js"
import { JWTauth, authorizeRoles } from "../middleware/JWT.js";

const router = express.Router()
router.route('/razropay_key').get(JWTauth,getrazropayAPI);
router.route('/subscribe').post(JWTauth,buySubscription);
router.route('verify').post(JWTauth,verifySubscription);
router.route('/unsubscribe').post(JWTauth,cancelSubsciption);
router.route('/viewpayment').get(JWTauth,authorizeRoles,viewPayment)

export default router
