import AppError from "../utils/utils.js";
import Course from '../model/course.model.js'
import cloudinary from "cloudinary"
import path from "path"


// const createCourse = async(req,res,next)=>{
//     const {title,description,category,createdBy} = req.body

// }

const createCourse = async(req,res,next)=>{
    try{
        const{title,description, category,createdBy} = req.body;
    if(!title || !description || !category ||!createdBy){
        return next(new AppError(" all field are required"),400)

    }
   const course = await Course.create({
    title,description,category,createdBy,
    thumbnail:{
        public_id:"dummy",
        secure_url:"https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg"
  
        
    }
     
   })
   if(!course){
    return next(new AppError(" your course not created successfully"),400)
   }
   // upload thumbnail
   if(req.file){
    try{
        const result = await  cloudinary.v2.uploader.upload(req.file.path,{
            
            folder:'lms',
            width:250,
            height:250,
            gravity:'faces',
            crop:'fill'
        })
        if(result){
            course.thumbnail.public_id = result.public_id;
            course.thumbnail.secure_url = result.secure_url;
        }
        
       

    }catch(e){
        return next(new AppError(' thumbnail not uploaded try again'))

    }
   }
   await course.save()
   res.status(200).json({
    success:true,
    message:" course save successfully",
    course

   })

    }catch(e){
        res.status(400).json({
            success:false,
            message:` your course not save in databse ${e}`
        })
    }
        
}
  
const updateCourse = async (req,res,next)=>{
    try{
      const {id} = req.params;
      const course = await Course.findByIdAndUpdate(id,{$set:req.body},
        {runValidators:true}
       
      )
        if(!course){
            return next(new AppError(" course not updated"),400)
        }
        res.status(200).json({
            success:true,
            message:" your course updated successfully",
            course
        })
    }catch(e){
        res.status(400).json({
            success:false,
            message:` your course  could not update ${e}`
        })

    }

}

const getallCourses =  async (req,res,next)=>{
    try{
        const course = await Course.find({}).select('-lectures');
        if(! course){
        return next( AppError(' courses are not exist in database'), 500)
        }
        res.status(200).json({
            success:true,
            message:" course print successfully ",
            course:course
        })
    
       }catch(e){
        res.status(500).json({
            success:false,
            message:` course cannot print ${ e.message}`
        })
       }
       
    

}


const getLecturesbyId =  async (req,res,next)=>{
   

   try{
    const {id }= req.params;
    
    const course = await Course.findById(id);
                
     res.status(200).json({
         success:true,
        message:" courses fetched successfully ",
        lectures: course.lectures
    })
  
   }catch(e){
    return res.status(500).json({
        success:false,
        message:` course not fetched ${ e.message}`
    })
      

   }

}
const removeCourse = async(req,res,next)=>{
    try{
        const {id} = req.params;
        const course = await Course.findById(id)
        if(!course){
            return next( new AppError(' course not exist with this Id'),400)
        }
        await Course.findByIdAndDelete(id)
        res.status(200).json({
            success:true,
            message:" your course deleted successfully",
            course
        })

    }catch(e){
        res.status(400).json({
            success:false,
            message:` your course has deleted successfully${e}`
        })
    }

}
const addlecturecourseById =  async(req,res,next)=>{
    const { title, description } = req.body;
    const { id } = req.params;
    console.log(title,description,id)
   let lectureData ={}
     if (!title || !description) {
      return next(new AppError('Title and Description are required', 400));
    }
    const course = await Course.findById(id);
        console.log(course)
    if (!course) {
      return next(new AppError('Invalid course id or course not found.', 400));
    }
    
     
      
      console.log("lecture  data",lectureData)
    // Run only if user sends a file
    console.log(req.file)
    if(req.file){
      try{
       const result = await  cloudinary.v2.uploader.upload(req.file.path,{
        folder:'lms',
        resource_type:'video',
        chunk_size:6000000
  
       })
       if(result){
        lectureData.public_id = result.public_id;
        lectureData.secure_url = result.secure_url;
       }
      }catch(e){
        return next(new AppError(` file not uploaded try again ${e.message}`))
      }

    }
    console.log(lectureData)
  
    course.lectures.push({
        title,description,
           lecture:lectureData
    });
    course.numberofLecture = course.lectures.length;
     await course.save();
     res.status(200).json({
      success: true,
      message: 'Course lecture added successfully',
      course,
    });


    
}
   

  
export{
getallCourses,
getLecturesbyId,
createCourse,
updateCourse,
removeCourse,
addlecturecourseById
}
