import  { useContext, useEffect, useRef, useState } from 'react';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify'
import Quill from 'quill';
import uniqid from 'uniqid';
import axios from 'axios'
import { AppContext } from '../../context/AppContext';

const AddCourse = () => {

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const { backendUrl, getToken } = useContext(AppContext)

  const [courseTitle, setCourseTitle] = useState('')
  const [coursePrice, setCoursePrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [image, setImage] = useState(null)
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  // const [lectureDetails, setLectureDetails] = useState({
  //   lectureTitle: '',
  //   lectureDuration: '',
  //   lectureUrl: '',
  //   isPreviewFree: false,
  // });
  // ✅ NEW: lectureType, documentUrl added
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    documentUrl: '',
    lectureType: 'video',
    isPreviewFree: false,
  });
  // ===== NEW: assignment popup state =====
  const [showAssignmentPopup, setShowAssignmentPopup] = useState(false);
  const [currentAssignmentChapterId, setCurrentAssignmentChapterId] = useState(null);
  const [assignmentDetails, setAssignmentDetails] = useState({
    title: '',
    description: '',
    resourceUrl: '',
    dueDate: '',
  });
  // ===== NEW: quiz-question popup state =====
  const [showQuizPopup, setShowQuizPopup] = useState(false);
  const [currentQuizChapterId, setCurrentQuizChapterId] = useState(null);
  const [quizQuestionDetails, setQuizQuestionDetails] = useState({
    question: '',
    optionsStr: '',
    answer: '',
  });

  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter Chapter Name:');
      if (title) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder: chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
           // ✅ NEW: support assignments and quiz per schema
          assignments: [],
          quiz: {
            quizType: 'manual',
            quizQuestions: []
          }
        };
        setChapters([...chapters, newChapter]);
      }
    } else if (action === 'remove') {
      setChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId));
    } else if (action === 'toggle') {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId ? { ...chapter, collapsed: !chapter.collapsed } : chapter
        )
      );
    }
  };

  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === 'add') {
      setCurrentChapterId(chapterId);
      setShowPopup(true);
    } else if (action === 'remove') {
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

  // const addLecture = () => {
  //   setChapters(
  //     chapters.map((chapter) => {
  //       if (chapter.chapterId === currentChapterId) {
  //         const newLecture = {
  //           ...lectureDetails,
  //           lectureOrder: chapter.chapterContent.length > 0 ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1 : 1,
  //           lectureId: uniqid()
  //         };
  //         chapter.chapterContent.push(newLecture);
  //       }
  //       return chapter;
  //     })
  //   );
  //   setShowPopup(false);
  //   setLectureDetails({
  //     lectureTitle: '',
  //     lectureDuration: '',
  //     lectureUrl: '',
  //     documentUrl: '',
  //     lectureType: 'video',
  //     isPreviewFree: false,
  //   });
  // };
// const addLecture = () => {
//   setChapters(
//     chapters.map((chapter) => {
//       if (chapter.chapterId === currentChapterId) {
//         const lectureData = {
//           lectureId: uniqid(),
//           lectureTitle: lectureDetails.lectureTitle,
//           lectureDuration: Number(lectureDetails.lectureDuration),
//           lectureType: lectureDetails.lectureType,
//           isPreviewFree: lectureDetails.isPreviewFree,
//           lectureOrder: chapter.chapterContent.length > 0 ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1 : 1,
//         };

//         // Only add the correct URL based on type
//         if (lectureDetails.lectureType === 'video') {
//           lectureData.lectureUrl = lectureDetails.lectureUrl;
//           lectureData.documentUrl = undefined;
//         } else if (lectureDetails.lectureType === 'document') {
//           lectureData.documentUrl = lectureDetails.documentUrl;
//           lectureData.lectureUrl = undefined;
//         }

//         chapter.chapterContent.push(lectureData);
//       }
//       return chapter;
//     })
//   );

//   setShowPopup(false);
//   setLectureDetails({
//     lectureTitle: '',
//     lectureDuration: '',
//     lectureUrl: '',
//     documentUrl: '',
//     lectureType: 'video',
//     isPreviewFree: false,
//   });
// };
// const addLecture = () => {
//   if (
//     (lectureDetails.lectureType === 'video' && !lectureDetails.lectureUrl.trim()) ||
//     (lectureDetails.lectureType === 'document' && !lectureDetails.documentUrl.trim())
//   ) {
//     toast.error(`Please provide a valid ${lectureDetails.lectureType === 'video' ? 'video URL' : 'document URL'}`);
//     return;
//   }

//   setChapters(
//     chapters.map((chapter) => {
//       if (chapter.chapterId === currentChapterId) {
//         const lectureData = {
//           lectureId: uniqid(),
//           lectureTitle: lectureDetails.lectureTitle,
//           lectureDuration: Number(lectureDetails.lectureDuration),
//           lectureType: lectureDetails.lectureType,
//           isPreviewFree: lectureDetails.isPreviewFree,
//           lectureOrder:
//             chapter.chapterContent.length > 0
//               ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1
//               : 1,
//           lectureUrl: undefined,
//           documentUrl: undefined,
//         };

//         if (lectureDetails.lectureType === 'video') {
//           lectureData.lectureUrl = lectureDetails.lectureUrl;
//         } else {
//           lectureData.documentUrl = lectureDetails.documentUrl;
//         }

//         chapter.chapterContent.push(lectureData);
//       }
//       return chapter;
//     })
//   );

//   setShowPopup(false);
//   setLectureDetails({
//     lectureTitle: '',
//     lectureDuration: '',
//     lectureUrl: '',
//     documentUrl: '',
//     lectureType: 'video',
//     isPreviewFree: false,
//   });
// };
// ===== NEW: add assignment into chapters =====
  const addAssignment = () => {
    const { title, description, resourceUrl, dueDate } = assignmentDetails;
    if (!title.trim()) {
      toast.error('Assignment title is required');
      return;
    }
    setChapters((chaps) =>
      chaps.map((c) => {
        if (c.chapterId === currentAssignmentChapterId) {
          return {
            ...c,
            assignments: [
              ...(c.assignments || []),
              {
                assignmentId: uniqid(),
                title: title.trim(),
                description: description.trim(),
                resourceUrl: resourceUrl.trim(),
                dueDate: dueDate.trim(),
              },
            ],
             };
        }
        return c;
      })
    );
    // reset & close
    setAssignmentDetails({
      title: '',
      description: '',
      resourceUrl: '',
      dueDate: '',
    });
    setShowAssignmentPopup(false);
  };
  // ===== NEW: add manual quiz question =====
  const addQuizQuestion = () => {
    const { question, optionsStr, answer } = quizQuestionDetails;
    if (!question.trim()) {
      toast.error('Question text is required');
      return;
    }
    const options = optionsStr
      .split(',')
      .map((o) => o.trim())
      .filter((o) => o);
    if (options.length < 2) {
      toast.error('Provide at least two options');
      return;
    }
    if (!answer.trim()) {
      toast.error('Correct answer is required');
      return;
    }
    setChapters((chaps) =>
      chaps.map((c) => {
        if (c.chapterId === currentQuizChapterId) {
          return {
            ...c,
            quiz: {
              ...c.quiz,
              quizQuestions: [
                ...(c.quiz.quizQuestions || []),
                {
                  question: question.trim(),
                  options,
                  answer: answer.trim(),
                },
              ],
            },
          };
        }
        return c;
      })
    );
    // reset & close
    setQuizQuestionDetails({ question: '', optionsStr: '', answer: '' });
    setShowQuizPopup(false);
  };


const addLecture = () => {
  const isVideo = lectureDetails.lectureType === 'video';
  const isDocument = lectureDetails.lectureType === 'document';

  // ✋ Check required fields before proceeding
  if (!lectureDetails.lectureTitle.trim()) {
    toast.error('Lecture title is required');
    return;
  }

  if (!lectureDetails.lectureDuration || isNaN(lectureDetails.lectureDuration)) {
    toast.error('Lecture duration must be a valid number');
    return;
  }

  if (isVideo && !lectureDetails.lectureUrl.trim()) {
    toast.error('Video URL is required for video lectures');
    return;
  }

  if (isDocument && !lectureDetails.documentUrl.trim()) {
    toast.error('Document URL is required for document lectures');
    return;
  }

  setChapters(
    chapters.map((chapter) => {
      if (chapter.chapterId === currentChapterId) {
        const lectureData = {
          lectureId: uniqid(),
          lectureTitle: lectureDetails.lectureTitle.trim(),
          lectureDuration: Number(lectureDetails.lectureDuration),
          lectureType: lectureDetails.lectureType,
          isPreviewFree: lectureDetails.isPreviewFree,
          lectureOrder:
            chapter.chapterContent.length > 0
              ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1
              : 1,
          lectureUrl: isVideo ? lectureDetails.lectureUrl.trim() : undefined,
          documentUrl: isDocument ? lectureDetails.documentUrl.trim() : undefined,
        };

       // chapter.chapterContent.push(lectureData);
       return {
          ...chapter,
          chapterContent: [...chapter.chapterContent, lectureData],
        };
      }
      return chapter;
    })
  );

  setShowPopup(false);
  setLectureDetails({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    documentUrl: '',
    lectureType: 'video',
    isPreviewFree: false,
  });
};



  const handleSubmit = async (e) => {
    try {

      e.preventDefault();

      if (!image) {
        toast.error('Thumbnail Not Selected')
      }

      const courseData = {
        courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapters,
      }

      const formData = new FormData()
      formData.append('courseData', JSON.stringify(courseData))
      formData.append('image', image)

      const token = await getToken()

      const { data } = await axios.post(backendUrl + '/api/educator/add-course', formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success(data.message)
        setCourseTitle('')
        setCoursePrice(0)
        setDiscount(0)
        setImage(null)
        setChapters([])
        quillRef.current.root.innerHTML = ""
      } else (
        toast.error(data.message)
      )

    } catch (error) {
      toast.error(error.message)
    }

  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      });
    }
  }, []);

  useEffect(() => {
    console.log(chapters);
  }, [chapters]);

  return (

<div className="min-h-screen overflow-y-auto flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-20  ">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20 p-4 "
      >
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
          <div ref={editorRef}></div>
        </div>

        <div className="flex items-center justify-between flex-wrap">
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
            <label htmlFor="thumbnailImage" className="flex items-center gap-3">
              <img
                src={assets.file_upload_icon}
                alt=""
                className="p-3 bg-blue-500 rounded"
              />
              <input
                type="file"
                id="thumbnailImage"
                onChange={(e) => setImage(e.target.files[0])}
                accept="image/*"
                hidden
              />
              <img
                className="max-h-10"
                src={image ? URL.createObjectURL(image) : ""}
                alt=""
              />
            </label>
          </div>
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

        <div>
          {chapters.map((chapter, chapterIndex) => (
            <div key={chapterIndex} className="bg-white border rounded-lg mb-4">
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center">
                  <img
                    onClick={() => handleChapter("toggle", chapter.chapterId)}
                    src={assets.dropdown_icon}
                    width={14}
                    alt=""
                    className={`mr-2 cursor-pointer transition-all ${
                      chapter.collapsed && "-rotate-90"
                    }`}
                  />
                  <span className="font-semibold">
                    {chapterIndex + 1} {chapter.chapterTitle}
                  </span>
                </div>
                <span className="text-gray-500">
                  {chapter.chapterContent.length} Lectures
                </span>
                <img
                  onClick={() => handleChapter("remove", chapter.chapterId)}
                  src={assets.cross_icon}
                  alt=""
                  className="cursor-pointer"
                />
              </div>
              {!chapter.collapsed && (
                <div className="p-4">
                  
                  {chapter.chapterContent.map((lecture, lectureIndex) => (
                    <div
                      key={lectureIndex}
                      className="flex justify-between items-center mb-2"
                    >
                      <span>
                        {lectureIndex + 1} {lecture.lectureTitle} -{" "}
                        {lecture.lectureDuration} mins
                        <a
                          href={lecture.lectureUrl}
                          target="_blank"
                          className="text-blue-500 ml-2"
                        >
                          Link
                        </a>
                        {lecture.isPreviewFree ? " Free Preview" : " Paid"}
                      </span>
                      <img
                        src={assets.cross_icon}
                        alt=""
                        onClick={() =>
                          handleLecture(
                            "remove",
                            chapter.chapterId,
                            lectureIndex
                          )
                        }
                        className="cursor-pointer"
                      />
                    </div>
                  ))}
                  <div
                    className="inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2"
                    onClick={() => handleLecture("add", chapter.chapterId)}
                  >
                    + Add Lectures
                  </div>
                   {/* ✅ NEW: Assignments UI */}
                   <div className="mt-4">
                    <p className="font-semibold mb-2">Assignments</p>
                    <button
                      type="button"                    // <<< prevents accidental form-submit
                      className="bg-gray-200 px-2 py-1 rounded"
                      onClick={() => {
                        setCurrentAssignmentChapterId(chapter.chapterId);
                        setShowAssignmentPopup(true);
                      }}
                    >
                      + Add Assignment
                    </button>
                    {chapter.assignments?.map((a, i) => (
                      <div key={i} className="p-2 mt-2 border rounded text-sm">
                        <p><strong>{a.title}</strong></p>
                        <p>{a.description}</p>
                        <a href={a.resourceUrl} target="_blank" className="text-blue-500">
                          Resource
                        </a>
                        <p>Due: {a.dueDate}</p>
                      </div>
                    ))}
                  </div>
                  {/* ✅ NEW: Quiz UI */}
                 <div className="mt-4">
                    <p className="font-semibold mb-2">Quiz</p>
                    <div className="flex gap-2 items-center mb-2">
                      <label>Quiz Type:</label>
                      <select
                        value={chapter.quiz?.quizType}
                        onChange={(e) => {
                          const newType = e.target.value;
                          setChapters((chaps) =>
                            chaps.map((c) =>
                              c.chapterId === chapter.chapterId
                                ? {
                                    ...c,
                                    quiz: {
                                      quizType: newType,
                                      quizQuestions:
                                        newType === 'manual'
                                          ? c.quiz.quizQuestions || []
                                          : [],
                                    },
                                  }
                                : c
                                )
                          );
                        }}
                      >
                        <option value="manual">Manual</option>
                        <option value="ai">AI</option>
                      </select>
                    </div>
                    {/* manual mode */}
                    {chapter.quiz.quizType === 'manual' && (
                      <>
                        <button
                          type="button"                // <<< prevents form-submit
                          className="bg-gray-200 px-2 py-1 rounded"
                          onClick={() => {
                            setCurrentQuizChapterId(chapter.chapterId);
                            setShowQuizPopup(true);
                          }}
                        >
                          + Add Question
                        </button>
                        {chapter.quiz.quizQuestions.map((q, i) => (
                          <div key={i} className="mt-2 p-2 border rounded">
                            <p><strong>{q.question}</strong></p>
                            <ul className="list-disc ml-6">
                              {q.options.map((opt, j) => (
                                <li key={j}>{opt}</li>
                              ))}
                            </ul>
                            <p className="text-green-500">Answer: {q.answer}</p>
                          </div>
                        ))}
                      </>
                      )}
                      {/* AI mode */}
                    {chapter.quiz.quizType === 'ai' && (
                      <button
                        type="button"              // <<< prevents form-submit
                        className="bg-green-400 text-white px-2 py-1 rounded mt-2"
                        onClick={async () => {
                          const topic = prompt('Enter topic for AI Quiz:');
                          if (!topic) return;
                          try {
                            const res = await axios.post(
                              `${backendUrl}/api/generate-quiz`,
                              { topic, chapterId: chapter.chapterId },
                              { headers: { Authorization: `Bearer ${await getToken()}` } }
                            );
                            const questions = res.data.quiz || [];
                            setChapters((chaps) =>
                              chaps.map((c) =>
                                c.chapterId === chapter.chapterId
                                  ? { ...c, quiz: { quizType: 'ai', quizQuestions: questions } }
                                  : c
                              )
                            );
                          } catch {
                            toast.error('Quiz generation failed.');
                          }
                        }}
                      >
                        Generate with AI
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div
            className="flex justify-center items-center bg-blue-100 p-2 rounded-lg cursor-pointer"
            onClick={() => handleChapter("add")}
          >
            + Add Chapter
          </div>

          {showPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="bg-white text-gray-700 p-4 rounded relative w-full max-w-80">
                <h2 className="text-lg font-semibold mb-4">Add Lecture</h2>
                <div className="mb-2">
                  <p>Lecture Title</p>
                  <input
                    type="text"
                    className="mt-1 block w-full border rounded py-1 px-2 "
                    value={lectureDetails.lectureTitle}
                    onChange={(e) =>
                      setLectureDetails({
                        ...lectureDetails,
                        lectureTitle: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="mb-2">
                  <p>Duration(minutes)</p>
                  <input
                    type="number"
                    className="mt-1 block w-full border rounded py-1 px-2 "
                    value={lectureDetails.lectureDuration}
                    onChange={(e) =>
                      setLectureDetails({
                        ...lectureDetails,
                        lectureDuration: e.target.value,
                      })
                    }
                  />
                </div>

                {/* <div className="mb-2">
                  <p>Lecture Url</p>
                  <input
                    type="text"
                    className="mt-1 block w-full border rounded py-1 px-2 "
                    value={lectureDetails.lectureUrl}
                    onChange={(e) =>
                      setLectureDetails({
                        ...lectureDetails,
                        lectureUrl: e.target.value,
                      })
                    }
                  />
                </div> */}
                {/* ✅ NEW: Lecture Type and URL */}
                <div className="mb-2">
                  <p>Lecture Type</p>
                  <select
                    className="mt-1 block w-full border rounded py-1 px-2"
                    value={lectureDetails.lectureType}
                    onChange={(e) =>
                      setLectureDetails({
                        ...lectureDetails,
                        lectureType: e.target.value,
                      })
                    }
                  >
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                  </select>
                </div>

                {lectureDetails.lectureType === 'video' ? (
                  <div className="mb-2">
                    <p>Video URL</p>
                    <input
                      type="text"
                      className="mt-1 block w-full border rounded py-1 px-2"
                      value={lectureDetails.lectureUrl}
                      onChange={(e) =>
                        setLectureDetails({
                          ...lectureDetails,
                          lectureUrl: e.target.value,
                        })
                      }
                    />
                  </div>
                ) : (
                  <div className="mb-2">
                    <p>Document URL</p>
                    <input
                      type="text"
                      className="mt-1 block w-full border rounded py-1 px-2"
                      value={lectureDetails.documentUrl}
                      onChange={(e) =>
                        setLectureDetails({
                          ...lectureDetails,
                          documentUrl: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div className="flex gap-2 my-4">
                  <p>Is preview free?</p>
                  <input
                    type="checkbox"
                    className="mt-1 scale-125 "
                    checked={lectureDetails.isPreviewFree}
                    onChange={(e) =>
                      setLectureDetails({
                        ...lectureDetails,
                        isPreviewFree: e.target.checked,
                      })
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded w-full"
                  onClick={addLecture}
                >
                  Add
                </button>
                <img
                  onClick={() => setShowPopup(false)}
                  src={assets.cross_icon}
                  alt=""
                  className="absolute top-4 right-4 w-4 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="bg-black text-white py-2.5 px-8 rounded my-4 w-max cursor-pointer"
        >
          Add
        </button>
      </form>
      {/* ===== NEW: Assignment Popup ===== */}
      {showAssignmentPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Assignment</h3>
            <label className="block mb-2">
              Title
              <input
                type="text"
                className="mt-1 w-full border rounded px-2 py-1"
                value={assignmentDetails.title}
                onChange={(e) =>
                  setAssignmentDetails({ ...assignmentDetails, title: e.target.value })
                }
              />
            </label>
            <label className="block mb-2">
              Description
              <textarea
                className="mt-1 w-full border rounded px-2 py-1"
                value={assignmentDetails.description}
                onChange={(e) =>
                  setAssignmentDetails({ ...assignmentDetails, description: e.target.value })
                }
              />
              </label>
            <label className="block mb-2">
              Resource URL
              <input
                type="text"
                className="mt-1 w-full border rounded px-2 py-1"
                value={assignmentDetails.resourceUrl}
                onChange={(e) =>
                  setAssignmentDetails({ ...assignmentDetails, resourceUrl: e.target.value })
                }
              />
            </label>
            <label className="block mb-4">
              Due Date
              <input
                type="date"
                className="mt-1 w-full border rounded px-2 py-1"
                value={assignmentDetails.dueDate}
                onChange={(e) =>
                  setAssignmentDetails({ ...assignmentDetails, dueDate: e.target.value })
                }
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setShowAssignmentPopup(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={addAssignment}
              >
                Add Assignment
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== NEW: Quiz Question Popup ===== */}
      {showQuizPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Quiz Question</h3>
            <label className="block mb-2">
              Question
              <input
                type="text"
                className="mt-1 w-full border rounded px-2 py-1"
                value={quizQuestionDetails.question}
                onChange={(e) =>
                  setQuizQuestionDetails({ ...quizQuestionDetails, question: e.target.value })
                }
              />
            </label>
            <label className="block mb-2">
              Options (comma-separated)
              <input
                type="text"
                className="mt-1 w-full border rounded px-2 py-1"
                value={quizQuestionDetails.optionsStr}
                onChange={(e) =>
                  setQuizQuestionDetails({ ...quizQuestionDetails, optionsStr: e.target.value })
                }
              />
            </label>
            <label className="block mb-4">
              Correct Answer
              <input
                type="text"
                className="mt-1 w-full border rounded px-2 py-1"
                value={quizQuestionDetails.answer}
                onChange={(e) =>
                  setQuizQuestionDetails({ ...quizQuestionDetails, answer: e.target.value })
                }
              />
              </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setShowQuizPopup(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={addQuizQuestion}
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AddCourse;