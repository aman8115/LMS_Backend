import mongoose from "mongoose";
const courseSchema =  new mongoose.Schema({
    title:{
        type:String,
        required:[true,"title is required "],
        minLength:[8,"title must be at least 8 character"],
        maxlength:[60,"title should be lesstah 60 character"],
        trim:true
    },
    description:{
        type:String,
        required:[true,"description is required"],
        minLength:[10,"description must be  at least 10 character"],
        maxLength:[200,"description should be lesstahn 200 characters"],
        trim:true

    },
    category:{
        type:String,
        required:[true,"category is required"],
        minLength:[5,"category must be al least 5 characters"],
        maxLength:[50,"category should be lessthan 50 characters"],
        trim:true,
    },
 
    createdBy:{
        type:String,
        required:[true,"author name is required "]
    },
    thumbnail:{
        public_id:{
            type:String

        },
        secure_url:{
            type:String

        }

    },
    lectures:[
        {
            title:String,
            description:String,
          
            lecture:{
                public_id:{
                    type:String
                    
                },
                secure_url:{
                    type:String
                   
                }

            
            }
        }
        
    ],
    numberofLecture:{
        type:Number,
        default:0
    }
    

    


},{timestamps:true})
const Course = mongoose.model("Course",courseSchema)
export default Course