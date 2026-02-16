import { useState, useContext, useEffect } from "react"
import { useParams } from "react-router-dom"
import { AppContext } from "../../context/AppContext"
import Loading from "../../components/student/Loading";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import Footer from "../../components/student/Footer";
import ReactPlayer from "react-player";
import axios from "axios";
import { toast } from "react-toastify";

const CourseDetails = () => {

  const { id } = useParams(); //get the course id from the url
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});  //key-value pair, index-boolean, to track every section open/close state.
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const { calculateRating, calculateChapterTime, calculateCourseDuration, calculateNoOfLectures, currency, backendUrl, userData, getToken } = useContext(AppContext);

  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/course/' + id)

      if (data.success) {
        setCourseData(data.courseData)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const enrollCourse = async () => {
    try {
      if (!userData) {
        return toast.warn('Login to Enroll')
      }

      if (isAlreadyEnrolled) {
        return toast.warn('Already Enrolled')
      }

      const token = await getToken();

      const { data } = await axios.post(backendUrl + '/api/user/purchase', { courseId: courseData._id }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (data.success) {
        const { session_url } = data;
        window.location.replace(session_url)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchCourseData();
  }, []);

  useEffect(() => {
    if (userData && courseData) {
      setIsAlreadyEnrolled(userData.enrolledCourses.includes(courseData._id))
    }
  }, [userData, courseData])

  const toggleSection = (index) => {  //index contains the section of chapter in courseContent that is clicked.
    setOpenSections((prev) => (
      {
        ...prev,
        [index]: !prev[index],
      }
    ))
  }

  return courseData ? (
    <>
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-35 px-8 md:pt-30 pt-20 text-left">

        <div className="absolute top-0 left-0 w-full h-section-height -z-1 bg-gradient-to-b from-cyan-100/70"></div>

        {/* left column */}
        <div className="flex-1 max-w-3xl z-10 text-gray-500">
          <h1 className="md:text-4xl text-2xl font-semibold text-gray-800">{courseData.courseTitle}</h1>
          <p className="pt-4 md:text-base text-sm" dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200) }}></p>

          {/* Review and ratings */}
          <div className='flex items-center space-x-2 pt-3 pb-1 text-sm'>
            <p>{calculateRating(courseData)}</p>
            <div className='flex'>
              {[...Array(5)].map((_, i) => ( // for 5 star rating
                <img className='w-3.5 h-3.5' key={i} src={i < Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank} alt='' />
              ))}
            </div>
            <p className='text-blue-600'>({courseData.courseRatings.length} {courseData.courseRatings.length !== 1 ? 'ratings' : 'rating'})</p>
            <p>{courseData.enrolledStudents.length} {courseData.enrolledStudents.length !== 1 ? 'students' : 'student'}</p>
          </div>

          <p className="text-sm">Course by <span className="text-blue-600 underline">{courseData.educator.name}</span></p>

          <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold mb-5">Course Structure</h2>

            <div className="space-y-2">
              {courseData.courseContent.map((chapter, index) => (
                <div key={index} className="border border-gray-300 bg-white rounded overflow-hidden">
                  <div
                    onClick={() => toggleSection(index)}
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <img
                        className={`w-3 h-3 transform transition-transform ${openSections[index] ? 'rotate-180' : ''}`}
                        src={assets.down_arrow_icon}
                        alt="arrow icon"
                      />
                      <p className="font-medium md:text-base text-sm">{chapter.chapterTitle}</p>
                    </div>
                    <p className="text-sm md:text-base text-gray-600 whitespace-nowrap ml-4">
                      {chapter.chapterContent.length} lecture{chapter.chapterContent.length !== 1 ? 's' : ''} - {calculateChapterTime(chapter)}
                    </p>
                  </div>

                  <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-[1000px]' : 'max-h-0'}`}>
                    <ul className='space-y-2 px-4 py-3 text-gray-600 border-t border-gray-300 bg-gray-50'>
                      {chapter.chapterContent.map((lecture, i) => (
                        <li key={i} className='flex items-start gap-3'>
                          <img src={assets.play_icon} alt='play icon' className='w-4 h-4 mt-1 flex-shrink-0' />
                          <div className='flex items-center justify-between w-full text-gray-800 text-sm md:text-base'>
                            <p className="flex-1">{lecture.lectureTitle}</p>
                            <div className='flex gap-3 items-center ml-4 flex-shrink-0'>
                              {lecture.isPreviewFree && (
                                <p
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPlayerData({
                                      videoUrl: lecture.lectureUrl,
                                    });
                                  }}
                                  className='text-blue-500 cursor-pointer hover:underline'
                                >
                                  Preview
                                </p>
                              )}
                              <p className="text-gray-600">
                                {humanizeDuration(lecture.lectureDuration * 1000, {
                                  units: ['h', 'm'],
                                  round: true
                                })}
                              </p>
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

          <div className="py-20 text-sm md:text-base">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Course Description</h3>
            <div className="pt-3 rich-text text-gray-600" dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}></div>
          </div>

        </div>

        {/* right column */}
        <div className="course-card custom-card z-10 rounded-lg md:rounded-none overflow-hidden bg-white w-full md:w-auto min-w-[300px] md:min-w-[420px] md:sticky md:top-20">
          {
            playerData ?
              <ReactPlayer
                src={playerData.videoUrl}
                controls
                width="100%"
                height="100%"
                className="aspect-video"
                playing
              />
              :
              <img src={courseData.courseThumbnail} alt={courseData.courseTitle} className="w-full object-cover" />
          }

          <div className="p-5">
            <div className="flex items-center gap-2">
              <img className="w-3.5" src={assets.time_left_clock_icon} alt="time left clock icon" />
              <p className="text-red-500"><span className="font-medium">5 days</span> left at this price!</p>
            </div>

            <div className="flex gap-3 items-center pt-2">
              <p className="text-gray-800 md:text-4xl text-2xl font-semibold">
                {currency}{(courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)}
              </p>
              <p className="md:text-lg text-gray-500 line-through">{currency}{courseData.coursePrice}</p>
              <p className="md:text-lg text-gray-500">{courseData.discount}% off</p>
            </div>

            <div className="flex items-center text-sm md:text-base gap-4 pt-2 md:pt-4 text-gray-500">
              <div className="flex items-center gap-1">
                <img src={assets.star} alt="star icon" className="w-4 h-4" />
                <p>{calculateRating(courseData)}</p>
              </div>

              <div className="h-4 w-px bg-gray-500/40"></div>

              <div className="flex items-center gap-1">
                <img src={assets.time_clock_icon} alt="clock icon" className="w-4 h-4" />
                <p>{calculateCourseDuration(courseData)}</p>
              </div>

              <div className="h-4 w-px bg-gray-500/40"></div>

              <div className="flex items-center gap-1">
                <img src={assets.lesson_icon} alt="lesson icon" className="w-4 h-4" />
                <p>{calculateNoOfLectures(courseData)} lectures</p>
              </div>

            </div>

            <button
              onClick={enrollCourse}
              className={`md:mt-6 mt-4 w-full py-3 rounded font-medium transition-colors ${isAlreadyEnrolled
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              disabled={isAlreadyEnrolled}
            >
              {isAlreadyEnrolled ? "Already Enrolled" : "Enroll Now"}
            </button>

            <div className="pt-6">
              <p className="md:text-xl text-lg font-medium text-gray-800">What's in the course?</p>
              <ul className="ml-4 pt-2 text-sm md:text-base list-disc text-gray-500 space-y-1">
                <li>Lifetime access with free updates.</li>
                <li>Step-by-step, hands-on project guidance.</li>
                <li>Downloadable resources and source code.</li>
                <li>Quizzes to test your knowledge.</li>
                <li>Certificate of completion.</li>
              </ul>
            </div>

          </div>
        </div>

      </div>
      <Footer />
    </>
  ) : <Loading /> //if courseData is not available, show loading component
}

export default CourseDetails