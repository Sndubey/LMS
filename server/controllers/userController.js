import User from "../models/User.js"
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js"
import Stripe from "stripe";

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

// purchase course
export const purchaseCourse = async (req, res) => {

    try {
        const { userId } = req.auth
        const { courseId } = req.body   
        const { origin } = req.headers
        const userData = await User.findById(userId)
        const courseData = await Course.findById(courseId)

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'Data not found' })
        }

        // creating purchase record
        const purchaseData = {
            courseId: courseData._id,
            userId: userData._id,
            amount: Number((courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2))
        }

        const newPurchase = await Purchase.create(purchaseData)

        // Initialize stripe payment gateway
        // Stripe Gateway Initialize
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

        const currency = process.env.CURRENCY.toLowerCase();

        // Creating line items for Stripe
        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle
                },
                unit_amount: Math.floor(newPurchase.amount) * 100
            },
            quantity: 1
        }];

        // creating payment session
        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,  //stripe redirection after success
            cancel_url: `${origin}/`,  // redirection to same page if cancel
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        })

        res.json({ success: true, session_url: session.url })

    } catch (error) {
        res.json({success:false, message:error.message})
    }
}