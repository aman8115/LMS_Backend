import Router from "express"
import { sendMessage } from "../controller/message.controller.js"
const router = Router()
router.route('/contact').post(sendMessage);
export default router;