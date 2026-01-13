import { clerkClient } from '@clerk/express'
import Course from '../models/Course.js'
import {v2 as cloudinary} from 'cloudinary'

//updating role to educator
export const updateRoleToEducator = async (req, res) => {
    try {
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - No valid session found'
            });
        }

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator'
            }
        })

        res.json({ success: true, message: 'you can publish a course now' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body
        const imageFile = req.file
        const educatorId = req.auth.userId

        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail Not Attached' })
        }

        const parsedCourseData = await JSON.parse(courseData)
        parsedCourseData.educator = educatorId
        const newCourse = await Course.create(parsedCourseData)
        const imageUpload = await cloudinary.uploader.upload(imageFile.path)  //if we fetched img url first then db call and if db call fails then cloudinary will have orphan img which takes useless memory
        newCourse.courseThumbnail = imageUpload.secure_url
        await newCourse.save()  //saving updated data to db

        res.json({ success: true, message: 'Course Added' })
    } catch (error) {
        console.log({success:false, message:error.message});
    }
}

// get all educator courses
export const getEducatorCourses = async (req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({educator})
        res.json({success: true, courses});
    } catch (error) {
        res.json({success:false, message:error.message})
    }
}