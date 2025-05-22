import { useState, useContext, useEffect } from "react"
import { useParams } from "react-router-dom"
import { AppContext } from "../../context/AppContext"
import Loading from "../../components/student/Loading";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";

const CourseDetails = () => {

  const { id } = useParams(); //get the course id from the url
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState(null); 
  const { allCourses, calculateRating, calculateChapterTime } = useContext(AppContext);

  const fetchCourseData = async () => {
    const findCourse = allCourses.find(course => course._id === id)  //it fetches course data from allCourses if the course id matches
    setCourseData(findCourse);
  }

  useEffect(() => {
    fetchCourseData();
  }, []);

  const toggleSection = (index) => {
    setOpenSections((prev)=>(
      {...prev,
        [index]: !prev[index],
      }
    ))
  }

  return courseData ? (
    <>
      <div className="flex md:flex-row flex-col-reverse relative items-start justify-between px-8 pt-20 text-left">

        <div className="absolute top-1 left-12 w-full h-section-height -z-1 bg-gradient from-cyan-100/20"></div>
        {/* left column */}
        <div className="max-w-xl z-10 text-gray-500">
          <h1 className="md:text-4xl text-4xl font-bold text-gray-800">{courseData.courseTitle}</h1>
          <p className="pt-4 md:text-base text-sm" dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200) }}></p>

          {/* Review and ratings */}
          <div className='flex items-center space-x-4 pt-3 text-sm'>
            <p>{calculateRating(courseData)}</p>
            <div className='flex'>
              {[...Array(5)].map((_, i) => ( // for 5 star rating
                <img className='w-3.5 h-3.5' key={i} src={i < Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank} alt='' />
              ))}
            </div>
            <p className='text-blue-600'>({courseData.courseRatings.length} {courseData.courseRatings.length > 1 ? 'ratings' : 'rating'})</p>
            <p>{courseData.enrolledStudents.length} {courseData.courseRatings.length > 1 ? 'students' : 'student'}</p>
          </div>

          <p className="text-sm">Course by <span className="text-blue-600 underline">Shubham</span></p>

          <div className="pt-8 text-gray-800">
            <h2>Course Structure</h2>
            <div className="pt-5">
              {courseData.courseContent.map((chapter, index) => (
                <div key={index} className="border border-gray-300 bg-white mb-2 rounded">
                  <div className="flex items-center justify-between px-4 py-3 cursor-pointer select-none">
                    <div className="flex items-center gap-2">
                      <img className={`transform transition-transform ${openSections[index] ? 'rotate-180':''}`} src={assets.down_arrow_icon} alt="arrow icon" />
                      <p className="font-bold md:text-base text-gray-500 text-sm">{chapter.chapterTitle}</p>
                    </div>
                  </div>

                  <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-96' : 'max-h-0'}`}>
                    <ul className='list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300'>
                      {chapter.chapterContent.map((lecture, i) => (
                        <li key={i} className='flex items-start gap-2 py-1'>
                          <img src={assets.play_icon} alt='play icon' className='w-4 h-4 mt-1' />
                          <div className='flex items-center justify-between w-full text-gray-800 text-sm '>
                            <p>{lecture.lectureTitle}</p>
                            <div className='flex gap-2'>
                              <p className='text-blue-500 cursor-pointer'>Preview</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>


                </div>
              ))}
            </div>
          </div>

        </div>

        {/* right column */}
        <div></div>

      </div>
    </>
  ) : <Loading /> //if courseData is not available, show loading component
}

export default CourseDetails
