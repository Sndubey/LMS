import User from "../models/User.js"

// Get User Data
export const getUserData = async (req, res) => {
    try {
        // 1. Call req.auth() as a function
        const { userId } = req.auth();

        // 2. Add a log to see the actual ID being sent to the DB
        console.log("Searching for User ID:", userId);

        if (!userId) {
            return res.json({ success: false, message: 'Authentication failed: No User ID' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User Not Found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Users Enrolled Courses With Lecture Links
export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = req.auth.userId
        const userData = await User.findById(userId).populate('enrolledCourses')

        res.json({ success: true, enrolledCourses: userData.enrolledCourses })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}