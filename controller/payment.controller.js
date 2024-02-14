import Payment from "../model/Payment.model.js";
import User from "../model/sschema.js"
import AppError from "../utils/utils.js";
import { config } from "dotenv";

import { razorpay } from "../server.js";
import crypto from "crypto"
import { ifError } from "assert";

const getrazropayAPI = (req,res,next)=>{
   try{
    res.status(200).json({
        success:true,
        message:' you get razorpay key successfully',
        key: process.env.RAZORPAYAPIKEY
    })
    
   }catch(e){
    res.status(400).json({
        success:false,
        message:` you can not get razorpay key ${e}`
    })
   }

}
const buySubscription  =  async (req,res,next)=>{
   try{

   }catch(e){
    res.status(400).json({
        success:false,
        message:` you could not buy a course ${e}`
    })
   }

}
const verifySubscription = async  (req,res,next)=>{
try{
    const {id } = req.user
const {paymet_Id, razropay_subsciription_id,razropay_signature_id } = req.body;
const user = await user.findById(id)
if(!user){
    return next(new AppError(' umauthorized please login '),400)
}
const subscriptionId = user.subscription.id
const genrateSingnature = crypto.createHmac('sha256',process.env.RAZORPAYAPIKEYSECRETKEY).update(`${paymet_Id}|${subscriptionId}`).digest('hex')

if(genrateSingnature!==razropay_signature_id){
    return next(new AppError(' payment not verified '),400)
}
 await Payment.create({
    paymet_Id,
    razropay_signature_id,
    razropay_subsciription_id

})
user.subscription.status = 'active'
await user.save()

}catch(e){
    res.status(400).json({
        success:false,
        message:` your subscription could not verify ${e}`
    })
}


}
const cancelSubsciption =  async (req,res,next)=>{
  try{

    const{id} = req.user;
    const user = await User.findById(id)
    if(!user){
        return next(new AppError(' unathorized please login'),500)
    }
    if(user.role === 'ADMIN'){
        return next(new AppError ("ADMIN cannot cancel subscription"),400)
    }
    const subscriptionId = req.user.subscriptionId
    const subscription = await razorpay.subscriptions.cancel(subscriptionId)
    user.subscription.status = subscription.status
    await user.save()
  }catch(e){
    res.status(400).json({
        success:false,
        message:` subscription could not cancel ${e}`
    })
  }

}
const viewPayment = (req,res,next)=>{

}
export  {
getrazropayAPI,
buySubscription,
verifySubscription,
cancelSubsciption,
viewPayment
}