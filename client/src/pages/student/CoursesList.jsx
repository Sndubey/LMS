import { useState, useContext, useEffect, } from 'react'
import SearchBar from '../../components/student/SearchBar'
import { AppContext } from '../../context/AppContext'
import { useParams } from 'react-router-dom'
import CourseCard from '../../components/student/CourseCard'
import { assets } from '../../assets/assets'
import Footer from '../../components/student/Footer'

const CoursesList = () => {

  const {navigate, allCourses} = useContext(AppContext);
  const { input: searchQuery } = useParams();   // to get the input from the url
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    if (allCourses && allCourses.length > 0) {
      const tempCourses = allCourses;  // create a shallow copy of allCourses into tempCourses
      setFilteredCourses(
        tempCourses.filter(
          item=> item.courseTitle.toLowerCase().includes(input)  //check if course title includes input & filter the courses
        )
      )
    }
  },[allCourses])

  return (
    <>
      <div className='relative md:px-36 px-8 pt-20 text-left'>
        <div className='flex md:flex-row flex-col gap-6 justify-between w-50'>
          <div>
          <h1 className='text-4xl font-semibold text-gray-800'>Course List</h1>
          <p className='text-gray-500'><span onClick={()=> navigate('/')} className='text-blue-600 cursor-pointer'>Home</span> / <span>Course List</span></p>
          </div>
          <SearchBar data={input}/>  {/* here input is from url */}
        </div>

        {
          input && <div className='inline-flex items-center gap-4 px-4 py-2 mt-8 -mb-8 text-gray-200'>
            <p>{input}</p>
            <img src={assets.cross_icon} alt='' className='cursor-poiter' onClick={()=> navigate('/course-list')} />
          </div>
        }

        <div className='grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 gap-3 px-2'>
          {allCourses.map((course, index)=> <CourseCard key={index} course={course}/>)}
        </div>
      </div>
      
    </>
  )
}

export default CoursesList
