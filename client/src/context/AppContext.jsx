import { createContext } from "react";
import React, { useContext } from "react";
import { dummyCourses } from "../assets/assets";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";

export const AppContext = createContext()

export const AppContextProvider = (props) => {
    const currency = import.meta.env.VITE_CURRENCY
    const [allCourses, setAllCourses] = useState([])
    const navigate = useNavigate();
    const [isEducator, setIsEducator] = useState(true)

    //fetch all courses
    const fetchAllCourses = async () => {
        setAllCourses(dummyCourses)
    }

    //function to calculate average raiting of course
    const calculateRating = (course) => {
        if(course.courseRatings.length === 0) return 0;
        let totalRating = 0;
        course.courseRatings.forEach((rating) => {
            totalRating += rating.rating;
        });
        return (totalRating / course.courseRatings.length).toFixed(1);
    }

    //To calculate course chapter time
    const calculateChapterTime = (chapter) => {
        let time = 0;
        chapter.chapterContent.map((lecture)=> time += lecture.lectureDuration)
        return humanizeDuration(time * 60 * 1000, {units: ["h","m"]});
    }

    //To calculate course duration
    const calculateCourseDuration = (course) => {
        let time = 0;
        course.courseChapters.map((chapter)=> chapter.chapterContent.map((lecture)=> time += lecture.lectureDuration))
        return humanizeDuration(time * 60 * 1000, {units: ["h","m"]});
    }

    //To calculate no of lectures in the course
    const calculateNoOfLectures = (course) => {
        let totalLectures = 0;
        course.courseChapters.forEach((chapter)=> {
            if(Array.isArray(chapter.chapterContent)) {
                totalLectures += chapter.chapterContent.length;
            }
        })
        return totalLectures;
    }

    useEffect(() => {
        fetchAllCourses()
    }, []) 

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
    }
    
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}