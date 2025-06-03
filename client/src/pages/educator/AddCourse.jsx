import React, { useState } from 'react'
import uniqid from 'uniqid'
import Quill from 'quill'

const AddCourse = () => {

  const quilRef = useRef(null);
  const editorRef = useRef(null);

  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [lectureDetails, setLectureDetails] = useState();


  return (
    <div>
      <h1>Add Course</h1>
    </div>
  )
}

export default AddCourse
