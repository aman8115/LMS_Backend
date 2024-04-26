import AppError from "../utils/utils.js"
import User from '../model/sschema.js'
const userStates = async(req,res,next)=>{
    try{
        const allUserCount = await User.countDocuments()
        const subscribedUser = await User.countDocuments({
            'subscription.status': 'active',
        })
        console.log(allUserCount)
        console.log(subscribedUser)
        res.status(200).json({
            success:true,
            message:" All Rgisterd User count ",
            allUserCount,
            subscribedUser
        })
    }catch(e){
        return next ( new AppError(` user couldnot count ${e.message}`))
    }

}
export {
    userStates
}