import express from 'express'
import { userStates } from '../controller/States.controller.js'
import { JWTauth ,authorizeRoles} from '../middleware/JWT.js'
const router = express.Router()
router.route('/admin/states/user').get( JWTauth, authorizeRoles("ADMIN"),userStates)
export default router