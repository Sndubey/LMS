import { createContext } from "react";
import React, { useContext } from "react";
import { dummyCourses } from "../assets/assets";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import {useAuth, useUser} from "@clerk/clerk-react";  //useAuth returns isLoaded, isSignedIn, userId, getToken

export const AppContext = createContext()

export const AppContextProvider = (props) => {
    const currency = import.meta.env.VITE_CURRENCY
    const [allCourses, setAllCourses] = useState([])
    const navigate = useNavigate();
    const [isEducator, setIsEducator] = useState(true);
    const [enrolledCourses, setEnrolledCourses] = useState([]); 

    const {getToken} = useAuth()  // getToken is function of useAuth hook
    const {user} = useUser()

    //fetch all courses
    const fetchAllCourses = async () => {
        setAllCourses(dummyCourses)
    }

    //function to calculate average raiting of course
    const calculateRating = (course) => {
        if (course.courseRatings.length === 0) return 0;
        let totalRating = 0;
        course.courseRatings.forEach((rating) => {
            totalRating += rating.rating;
        });
        return (totalRating / course.courseRatings.length).toFixed(1);
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
        setEnrolledCourses(dummyCourses);
    }

    useEffect(() => {
        fetchAllCourses()
        fetchUserEnrolledCourses()
    }, [])

    const logToken = async () => {
        console.log(await getToken())
    }

    useEffect(()=>{
        if(user){
            logToken();
        }
    },[user])

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
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}