import { useState, useContext, useEffect } from "react"
import { useParams } from "react-router-dom"
import { AppContext } from "../../context/AppContext"
import Loading from "../../components/student/Loading";

const CourseDetails = () => {

  const { id } = useParams(); //get the course id from the url
  const [courseData, setCourseData] = useState(null);
  const { allCourses } = useContext(AppContext);
  const fetchCourseData = async () => {
    const findCourse = allCourses.find(course => course._id === id)  //it fetches course data from allCourses if the course id matches
    setCourseData(findCourse);
  }

  useEffect(() => {
    fetchCourseData();
  }, []);

  return courseData ? (
    <>
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-35 px-8 md:pt-30 pt-20 text-left">

        <div className="absolute top-0 left-0 w-full h-section-height -z-1 bg-gradient -to-b from-cyan-100/70"></div>
        {/* left column */}
        <div className="max-w-xl z-10 text-gray-500">
          <h1 className="md:text-4xl text-2xl font-semibold text-gray-800">{courseData.courseTitle}</h1>
          <p className="pt-4 md:text-base text-sm" dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200) }}></p>
        </div>

        {/* right column */}
        <div></div>

      </div>
    </>
  ) : <Loading /> //if courseData is not available, show loading component
}

export default CourseDetails
