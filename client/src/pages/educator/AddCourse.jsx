import React, { useEffect, useState, useRef, useContext } from "react";
import uniqid from "uniqid";
import Quill from "quill";
import { assets } from "../../assets/assets";
import { AppContext } from '../../context/AppContext'
import { toast } from "react-toastify";
import axios from "axios";

const AddCourse = () => {
  const quilRef = useRef(null);
  const editorRef = useRef(null);
  const { backendUrl, getToken } = useContext(AppContext)

  const [courseTitle, setCourseTitle] = useState("");
  const [videoFiles, setVideoFiles] = useState({}); // Add this line after other useState
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: "",
    lectureDuration: "",
    lectureUrl: "",
    isPreviewFree: false,
  });

  const handleChapter = (action, chapterId) => {
    if (action === "add") {
      const title = prompt("Enter Chapter Name:");
      if (title) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder:
            chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
        };
        setChapters([...chapters, newChapter]);
      }
    } else if (action === "remove") {
      setChapters(
        chapters.filter((chapter) => chapter.chapterId !== chapterId)
      );
    } else if (action === "toggle") {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId
            ? { ...chapter, collapsed: !chapter.collapsed }
            : chapter
        )
      );
    }
  };

  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === "add") {
      setCurrentChapterId(chapterId);
      setShowPopup(true);
    } else if (action === "remove") {
      setChapters(
        chapters.map((chapter) => {
          if (chapter.chapterId === chapterId) {
            chapter.chapterContent.splice(lectureIndex, 1);
          }
          return chapter;
        })
      );
    }
  };

  const addLecture = () => {
    if (!lectureDetails.lectureTitle || !lectureDetails.lectureDuration || !lectureDetails.lectureUrl) {
      toast.error("Please fill all lecture fields");
      return;
    }

    const lectureId = uniqid();
    const videoFile = videoFiles[currentChapterId + '-temp'];

    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currentChapterId) {
          const newLecture = {
            lectureTitle: lectureDetails.lectureTitle,
            lectureDuration: Number(lectureDetails.lectureDuration) * 60,
            lectureUrl: lectureDetails.lectureUrl, // Temporarily store filename
            isPreviewFree: lectureDetails.isPreviewFree,
            lectureOrder:
              chapter.chapterContent.length > 0
                ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1
                : 1,
            lectureId: lectureId,
          };
          chapter.chapterContent.push(newLecture);
        }
        return chapter;
      })
    );

    // Store video file with lectureId
    if (videoFile) {
      setVideoFiles(prev => {
        const updated = { ...prev };
        delete updated[currentChapterId + '-temp'];
        updated[lectureId] = videoFile;
        return updated;
      });
    }

    setShowPopup(false);
    setLectureDetails({
      lectureTitle: "",
      lectureDuration: "",
      lectureUrl: "",
      isPreviewFree: false,
    });
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault()
      if (!image) {
        toast.error('Thumbnail Not Selected')
        return;
      }

      if (chapters.length === 0) {
        toast.error('Please add at least one chapter')
        return;
      }

      // Check if all lectures have videos
      const allLecturesHaveVideos = chapters.every(chapter =>
        chapter.chapterContent.every(lecture => videoFiles[lecture.lectureId])
      );

      if (!allLecturesHaveVideos) {
        toast.error('Please upload videos for all lectures')
        return;
      }

      const courseData = {
        courseTitle,
        courseDescription: quilRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapters,
      }

      const formData = new FormData()
      formData.append('courseData', JSON.stringify(courseData))
      formData.append('image', image)

      // Create video mapping: filename -> lectureId
      const videoMapping = {};
      Object.entries(videoFiles).forEach(([lectureId, file]) => {
        videoMapping[file.name] = lectureId;
        formData.append('videos', file);
      });

      formData.append('videoMapping', JSON.stringify(videoMapping))

      const token = await getToken()

      const { data } = await axios.post(
        backendUrl + '/api/educator/add-course',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            toast.info(`Uploading: ${percentCompleted}%`, { autoClose: false, toastId: 'upload-progress' });
          }
        }
      )

      toast.dismiss('upload-progress');

      if (data.success) {
        toast.success(data.message)
        setCourseTitle('')
        setCoursePrice(0)
        setDiscount(0)
        setImage(null)
        setChapters([])
        setVideoFiles({})
        quilRef.current.root.innerHTML = ""
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.dismiss('upload-progress');
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (!quilRef.current && editorRef.current) {
      quilRef.current = new Quill(editorRef.current, {
        theme: "snow",
      });
    }
  }, []);

  return (
    <div className="h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl w-full text-gray-500">
        <div className="flex flex-col gap-1">
          <p>Course Title</p>
          <input
            onChange={(e) => setCourseTitle(e.target.value)}
            value={courseTitle}
            type="text"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <p>Course Description</p>
          <div ref={editorRef} className="bg-white"></div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <p>Course Price</p>
            <input
              onChange={(e) => setCoursePrice(e.target.value)}
              value={coursePrice}
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500"
              required
            />
          </div>

          <div className="flex md:flex-row flex-col items-center gap-3">
            <p>Course Thumbnail</p>
            <label htmlFor="thumbnailImage" className="flex items-center gap-3 cursor-pointer">
              <img
                src={assets.file_upload_icon}
                alt="Upload"
                className="p-3 bg-blue-500 rounded"
              />
              <input
                type="file"
                id="thumbnailImage"
                onChange={(e) => setImage(e.target.files[0])}
                accept="image/*"
                hidden
              />
              {image && (
                <img
                  className="max-h-10"
                  src={URL.createObjectURL(image)}
                  alt="Thumbnail preview"
                />
              )}
            </label>
          </div>

          <div className="flex flex-col gap-1">
            <p>Discount %</p>
            <input
              onChange={(e) => setDiscount(e.target.value)}
              value={discount}
              type="number"
              placeholder="0"
              min={0}
              max={100}
              className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500"
              required
            />
          </div>
        </div>

        {/* Chapters and Lectures Section */}
        <div className="w-full">
          {chapters.map((chapter, chapterIndex) => (
            <div
              key={chapter.chapterId}
              className="bg-white border rounded-lg mb-4 shadow-sm"
            >
              {/* Chapter Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center gap-2">
                  <img
                    onClick={() => handleChapter("toggle", chapter.chapterId)}
                    src={assets.dropdown_icon}
                    width={14}
                    alt=""
                    className={`cursor-pointer transition-all ${chapter.collapsed ? "-rotate-90" : ""
                      }`}
                  />
                  <span className="font-semibold">
                    {chapterIndex + 1}. {chapter.chapterTitle}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 text-sm">
                    {chapter.chapterContent.length} Lecture{chapter.chapterContent.length !== 1 ? 's' : ''}
                  </span>
                  <img
                    onClick={() => handleChapter("remove", chapter.chapterId)}
                    src={assets.cross_icon}
                    alt=""
                    className="cursor-pointer w-4 h-4"
                  />
                </div>
              </div>

              {/* Chapter Content - Lectures */}
              {!chapter.collapsed && (
                <div className="p-4">
                  {chapter.chapterContent.map((lecture, lectureIndex) => (
                    <div
                      key={lecture.lectureId}
                      className="flex justify-between items-center mb-3 p-2 bg-gray-50 rounded"
                    >
                      <span className="text-green-600">
                        {videoFiles[lecture.lectureId] ? '✓ Video' : lecture.lectureUrl}
                      </span>
                      <img
                        src={assets.cross_icon}
                        alt=""
                        className="cursor-pointer w-4 h-4"
                        onClick={() =>
                          handleLecture(
                            "remove",
                            chapter.chapterId,
                            lectureIndex
                          )
                        }
                      />
                    </div>
                  ))}

                  <div
                    className="inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2 text-sm hover:bg-gray-200 transition-colors"
                    onClick={() => handleLecture("add", chapter.chapterId)}
                  >
                    + Add Lecture
                  </div>
                </div>
              )}
            </div>
          ))}

          <div
            className="flex justify-center items-center bg-blue-100 p-3 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors"
            onClick={() => handleChapter("add")}
          >
            + Add Chapter
          </div>
        </div>

        <button
          type="submit"
          className="bg-black text-white w-max py-2.5 px-8 rounded my-4 hover:bg-gray-800 transition-colors"
        >
          ADD
        </button>
      </form>

      {/* Add Lecture Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white text-gray-700 p-6 rounded-lg relative w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Add Lecture</h2>

            <div className="mb-4">
              <p className="mb-1 font-medium">Lecture Title</p>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded py-2 px-3 outline-none focus:border-blue-500"
                value={lectureDetails.lectureTitle}
                onChange={(e) =>
                  setLectureDetails({
                    ...lectureDetails,
                    lectureTitle: e.target.value,
                  })
                }
                placeholder="Enter lecture title"
              />
            </div>


            <div className="mb-4">
              <p className="mb-1 font-medium">Upload Video</p>
              <input
                type="file"
                accept="video/*"
                className="mt-1 block w-full border border-gray-300 rounded py-2 px-3 outline-none focus:border-blue-500"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setLectureDetails({
                      ...lectureDetails,
                      lectureUrl: file.name, // Store filename temporarily
                    });
                    // Store file temporarily with a unique key
                    setVideoFiles(prev => ({
                      ...prev,
                      [currentChapterId + '-temp']: file
                    }));
                  }
                }}
              />
              {lectureDetails.lectureUrl && (
                <p className="mt-1 text-sm text-gray-600">Selected: {lectureDetails.lectureUrl}</p>
              )}
            </div>

            <div className="mb-4">
              <p className="mb-1 font-medium">Duration (minutes)</p>
              <input
                type="number"
                className="mt-1 block w-full border border-gray-300 rounded py-2 px-3 outline-none focus:border-blue-500"
                value={lectureDetails.lectureDuration}
                onChange={(e) =>
                  setLectureDetails({
                    ...lectureDetails,
                    lectureDuration: e.target.value,
                  })
                }
                placeholder="Enter duration in minutes"
                min="1"
              />
            </div>

            <div className="flex items-center gap-2 mb-6">
              <input
                type="checkbox"
                id="previewFree"
                className="scale-125 cursor-pointer"
                checked={lectureDetails.isPreviewFree}
                onChange={(e) =>
                  setLectureDetails({
                    ...lectureDetails,
                    isPreviewFree: e.target.checked,
                  })
                }
              />
              <label htmlFor="previewFree" className="font-medium cursor-pointer">
                Is Preview Free?
              </label>
            </div>

            <button
              onClick={addLecture}
              type="button"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded transition-colors font-medium"
            >
              Add
            </button>

            <img
              onClick={() => {
                setShowPopup(false);
                setLectureDetails({
                  lectureTitle: "",
                  lectureDuration: "",
                  lectureUrl: "",
                  isPreviewFree: false,
                });
              }}
              src={assets.cross_icon}
              className="absolute top-4 right-4 w-5 h-5 cursor-pointer"
              alt="Close"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCourse;