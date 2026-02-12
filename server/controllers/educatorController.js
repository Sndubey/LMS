import { clerkClient } from '@clerk/express'
import Course from '../models/Course.js'
import User from '../models/User.js'
import { Purchase } from '../models/Purchase.js'
import { v2 as cloudinary } from 'cloudinary'

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
        console.log({ success: false, message: error.message });
    }
}

// get all educator courses
export const getEducatorCourses = async (req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator })
        res.json({ success: true, courses });
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// get educator dashboard data (total earning, enrolled students, no. of courses)
export const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.auth.userId;

        // Fetch all courses created by this educator
        const courses = await Course.find({ educator });
        const totalCourses = courses.length;

        // Extract course IDs
        const courseIds = courses.map(course => course._id);

        // Find all completed purchases for these courses
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        });

        // Calculate total earnings
        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

        // Collect unique enrolled student IDs with their course titles
        const enrolledStudentsData = [];

        for (const course of courses) {
            const students = await User.find(
                { _id: { $in: course.enrolledStudents } },
                'name imageUrl' // Only select name and imageUrl fields
            );

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }

        res.json({
            success: true, dashboardData: {
                totalEarnings, enrolledStudentsData, totalCourses
            }
        })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
};

// educator dashboard -> students enrolled data fetching controller (student name, course title, purchase date)
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator });
        const courseIds = courses.map(course => course._id);

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle');  // getting courseTitle from Course collection from courseId (stored in Purchase schema)

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }));

        res.json({ success: true, enrolledStudents })
    }
    catch (error) {
        res.json({ success: false, message: error.message })
    }
};