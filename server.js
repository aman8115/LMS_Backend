import app from './app.js'
import{config} from 'dotenv';
config()
import cloudinary from 'cloudinary'

import Razorpay from 'razorpay';
const PORT = process.env.PORT||8000
// cloudinary config
cloudinary.v2.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.SECRET_KEY
})

export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
  key_secret:process.env.RAZORPAY_SECRET
})


app.listen(PORT,()=>{
    console.log(` LMS project running at http://localhost${PORT}`)
})