import express from 'express'
import { updateRoleToEducator, addCourse, getEducatorCourses, getEnrolledStudentsData, educatorDashboardData } from '../controllers/educatorController.js';
import { protectEducator } from '../middlewares/authMidddleware.js'
import upload from '../configs/multer.js'

const educatorRouter = express.Router()

educatorRouter.get('/update-role', updateRoleToEducator);
educatorRouter.post('/add-course', protectEducator, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'videos', maxCount: 50 }]), addCourse)  //now multiple files comes in one api call, one thumbnail and multiple video, file comes from form field 'image' then stores this file to server specific/default destination folder and make available in route (req.file)
educatorRouter.get('/courses', protectEducator, getEducatorCourses)
educatorRouter.get('/dashboard', protectEducator, educatorDashboardData)
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentsData)

export default educatorRouter; 