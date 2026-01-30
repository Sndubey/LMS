import express from 'express'
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
import { getUserCourseProgress, getUserData, purchaseCourse, updateUserCourseProgress, userEnrolledCourses, addUserRating } from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.get('/data', getUserData)
userRouter.get('/enrolled-courses', userEnrolledCourses)
userRouter.post('/purchase',ClerkExpressRequireAuth(), purchaseCourse)

userRouter.post('/update-course-progress',ClerkExpressRequireAuth(), updateUserCourseProgress)
userRouter.get('/get-course-progress',ClerkExpressRequireAuth(), getUserCourseProgress)  // fix courseId route fetching, can add in query param
userRouter.post('/add-rating', ClerkExpressRequireAuth(), addUserRating)

export default userRouter;