import {Router} from 'express'
import upload from '../middleware/multer.middle.js'
import { JWTauth,authorizeRoles } from '../middleware/JWT.js';


import{ createCourse,updateCourse,getallCourses,getLecturesbyId,removeCourse, addlecturecourseById}  from '../controller/course.controller.js'
const router = Router();
router.route('/createcourse').post(JWTauth, authorizeRoles ("ADMIN"),upload.single("thumbnail"),createCourse);
router.route('/:id').put(JWTauth,authorizeRoles('ADMIN'),updateCourse);
router.route('/getallcourse').get(getallCourses);
router.route('/:id').get(getLecturesbyId);
router.route('/:id').delete(JWTauth,authorizeRoles('ADMIN'),removeCourse)
router.route('/addlecture/:id').post(JWTauth ,authorizeRoles('ADMIN'),upload.single("lecture"),addlecturecourseById);

export  default router