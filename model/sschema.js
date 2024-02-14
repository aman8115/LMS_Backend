import mongoose from "mongoose";
import bcrypt  from 'bcrypt'
import JWT  from 'jsonwebtoken'
import { config } from "dotenv";
const UserSchema =  new mongoose.Schema({
    fullName:{
        type:String,
        required:[true,"name is required"],
        lowercase:true,
        trim:true
    },
    email:{
        type:String,
        required:[true,"email is required"],
        unique:true,
        lowercase:true
        

    },
    password:{
        type:String,
        required:[true, "password is required"],
        lowercase:true,
        trim:true,
        select:false
    },
    avatar:{
        public_id:{
            type:'String'
        },
        secure_url:{
            type:'String'
        }
    },
    role:{type:String,
    enum:['USER','ADMIN'],
    default:'USER'
},
    forgotPaaswordToken:String,
    forgotPaaswordExpiry:String
    
})
UserSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        return next()

    }
    this.password = await bcrypt.hash(this.password,10)
})
UserSchema.methods ={
    comparePassword:async function(plaintextPassword){

return await bcrypt.compare(plaintextPassword,this.password)
    },
    genrateJWTtoken:async function(){
        return await JWT.sign({id:this.id,fullName:this.fullName,email:this.email,role:this.role},
            process.env.SECRET,{expiresIn:'24h'})

    }
}
   

const User = mongoose.model('User',UserSchema);
export default User;