import { useContext } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { Link } from 'react-router-dom'

const CourseCard = ({course}) => {

  const { currency, calculateRating } = useContext(AppContext)

  return (
    <Link to={'/course/'+course._id} onClick={()=> scrollTo(0,0)} className='border border-gray-500/30 pb-6 overflow-hidden rounded-lg flex flex-col hover:shadow-lg transition-shadow'>
      <div className='w-full aspect-video overflow-hidden bg-gray-100'>
        <img className='w-full h-full object-cover' src={course.courseThumbnail} alt=''/>
      </div>
      <div className='p-3 text-left flex-1 flex flex-col'>
        <h3 className='text-base font-semibold line-clamp-2 mb-1'>{course.courseTitle}</h3>
        <p className='text-gray-500 text-sm mb-2'>{course.educator.name}</p>
        <div className='flex items-center space-x-2 mb-2'>
          <p className='text-sm font-semibold'>{calculateRating(course)}</p>
          <div className='flex'>
            {[...Array(5)].map((_, i)=>( // for 5 star rating
              <img className='w-3.5 h-3.5' key={i} src={i < Math.floor(calculateRating(course)) ? assets.star : assets.star_blank} alt=''/>
            ))}
          </div>
          <p className='text-gray-500 text-sm'>({course.courseRatings.length})</p>
        </div>
        <p className='text-base font-semibold text-gray-800 mt-auto'>{currency}{(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)}</p>
      </div>
    </Link>
  )
}

export default CourseCard