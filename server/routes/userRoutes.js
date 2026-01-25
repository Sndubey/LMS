import express from 'express'
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
import { getUserData, purchaseCourse, userEnrolledCourses } from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.get('/data', getUserData)
userRouter.get('/enrolled-courses', userEnrolledCourses)
userRouter.post('/purchase',ClerkExpressRequireAuth(), purchaseCourse)

export default userRouter;