import express from 'express'
import {updateRoleToEducator, addCourse, getEducatorCourses} from '../controllers/educatorController.js';
import {protectEducator} from '../middlewares/authMidddleware.js'
import upload from '../configs/multer.js'

const educatorRouter = express.Router()

educatorRouter.get('/update-role',updateRoleToEducator);
educatorRouter.post('/add-course',protectEducator, upload.single('image'), addCourse)  //only one file comes in one api call, file comes from form field 'image' then stores this file to server specific/default destination folder and make available in route (req.file)
educatorRouter.get('/courses', protectEducator, getEducatorCourses)

export default educatorRouter; 