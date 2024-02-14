import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema({
    paymet_Id:{
        type:String,
        required:[true,"payment_Id is required"]
    },
    razropay_subsciription_id:{
        type:String,
        required:[true,"subscription_id is required"]
    },
    razropay_signature_id:{
        type:String,
        required:[true,"signature is required"]
    }
},{timestamps:true})
const Payment = mongoose.model("paymentINFO",paymentSchema);
export default Payment;
