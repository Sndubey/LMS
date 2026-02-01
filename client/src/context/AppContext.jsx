import { createContext } from "react";
import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";  //useAuth returns isLoaded, isSignedIn, userId, getToken
import axios from 'axios';
import { toast } from "react-toastify";

export const AppContext = createContext()

export const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const currency = import.meta.env.VITE_CURRENCY
    const [allCourses, setAllCourses] = useState([])
    const navigate = useNavigate();
    const [isEducator, setIsEducator] = useState(false);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [userData, setUserData] = useState(null)

    const { getToken } = useAuth()  // getToken is function of useAuth hook
    const { user } = useUser()  // currently signed-in user’s information

    //fetch all courses
    const fetchAllCourses = async () => {
        try {
            const { data } = await axios(backendUrl + '/api/course/all')

            if (data.success) {
                setAllCourses(data.courses)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // fetch user data
    const fetchUserData = async () => {

        if (user.publicMetadata.role === 'educator') {
            setIsEducator(true)
        }

        try {
            const token = await getToken()

            const { data } = await axios.get(backendUrl + '/api/user/data', {
                headers: {
                    authorization: `Bearer ${token}`
                }
            })

            if (data.success) {
                setUserData(data.user)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to calculate average raiting of course
    const calculateRating = (course) => {
        if (course.courseRatings.length === 0) return 0;
        let totalRating = 0;
        course.courseRatings.forEach((rating) => {
            totalRating += rating.rating;
        });
        return Math.floor(totalRating / course.courseRatings.length);
    }

    //To calculate course chapter time
    const calculateChapterTime = (chapter) => {
        let time = 0;
        chapter.chapterContent.map((lecture) => time += lecture.lectureDuration)
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
    }

    //To calculate course duration
    const calculateCourseDuration = (course) => {
        if (!course) return "0m";
        const chapters = Array.isArray(course.courseChapters)
            ? course.courseChapters
            : Array.isArray(course.courseContent)
                ? course.courseContent
                : [];
        let time = 0;
        chapters.forEach((chapter) => {
            if (Array.isArray(chapter.chapterContent)) {
                chapter.chapterContent.forEach((lecture) => {
                    time += lecture.lectureDuration;
                });
            }
        });
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
    };

    //To calculate no of lectures in the course
    const calculateNoOfLectures = (course) => {
        if (!course) return 0;
        const chapters = Array.isArray(course.courseChapters)
            ? course.courseChapters
            : Array.isArray(course.courseContent)
                ? course.courseContent
                : [];
        let totalLectures = 0;
        chapters.forEach((chapter) => {
            if (Array.isArray(chapter.chapterContent)) {
                totalLectures += chapter.chapterContent.length;
            }
        });
        return totalLectures;
    };

    const fetchUserEnrolledCourses = async () => {
        try {
            const token = await getToken();
            console.log(token);
            
            const { data } = await axios.get(
                backendUrl + '/api/user/enrolled-courses',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                setEnrolledCourses(data.enrolledCourses.reverse());
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchAllCourses()
    }, [])
    
    useEffect(() => {
        if (user) {
            fetchUserData();
            fetchUserEnrolledCourses();
        }
    }, [user])

    const value = {
        currency,
        allCourses,
        navigate,
        calculateRating,
        isEducator,
        setIsEducator,
        calculateChapterTime,
        calculateCourseDuration,
        calculateNoOfLectures,
        fetchUserEnrolledCourses,
        enrolledCourses,
        backendUrl, userData, setUserData, getToken, fetchAllCourses
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}