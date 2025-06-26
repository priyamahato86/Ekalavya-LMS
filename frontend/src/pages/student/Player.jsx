import  { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import YouTube from 'react-youtube';
import { assets } from '../../assets/assets';
import { useParams } from 'react-router-dom';
import humanizeDuration from 'humanize-duration';
import axios from 'axios';
import { toast } from 'react-toastify';
import Rating from '../../components/student/Rating';
import Footer from '../../components/student/Footer';
import Loading from '../../components/student/Loading';

// const Player = ({}) => {

//   const { enrolledCourses, backendUrl, getToken, calculateChapterTime, userData, fetchUserEnrolledCourses } = useContext(AppContext)

//   const { courseId } = useParams()
//   const [courseData, setCourseData] = useState(null)
//   const [progressData, setProgressData] = useState(null)
//   const [openSections, setOpenSections] = useState({});
//   const [playerData, setPlayerData] = useState(null);
//   const [initialRating, setInitialRating] = useState(0);

//   const [activeQuiz, setActiveQuiz] = useState(null);
// const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
// const [showAnswer, setShowAnswer] = useState(false);
// const [selectedOption, setSelectedOption] = useState('');
// const [score, setScore] = useState(0);

// // Dummy quiz data per chapter
// const quizData = {
//   0: [
//     { question: "What is JavaScript?", options: ["Language", "Car", "City", "Fruit"], correctAnswer: "Language" },
//     { question: "Which keyword declares a variable?", options: ["const", "var", "let", "All"], correctAnswer: "All" },
//   ],
//   1: [
//     { question: "What does DOM stand for?", options: ["Document Object Model", "Data Object Model", "Disk Object Mode", "None"], correctAnswer: "Document Object Model" },
//   ],
// };


//   // const getCourseData = () => {
//   //   enrolledCourses.map((course) => {
//   //     if (course._id === courseId) {
//   //       setCourseData(course)
//   //       course.courseRatings.map((item) => {
//   //         if (item.userId === userData._id) {
//   //           setInitialRating(item.rating)
//   //         }
//   //       })
//   //     }
//   //   })
//   // }

//   const getCourseData = () => {
//   enrolledCourses.forEach((course) => {
//     if (course._id === courseId) {
//       setCourseData(course);
      
//       // Safe check for userData and courseRatings
//       if (userData && Array.isArray(course.courseRatings)) {
//         course.courseRatings.forEach((item) => {
//           if (item.userId === userData._id) {
//             setInitialRating(item.rating);
//           }
//         });
//       }
//     }
//   });
// };


//   const toggleSection = (index) => {
//     setOpenSections((prev) => ({
//       ...prev,
//       [index]: !prev[index],
//     }));
//   };


//   useEffect(() => {
//     if (enrolledCourses.length > 0) {
//       getCourseData()
//     }
//   }, [enrolledCourses])

//   const markLectureAsCompleted = async (lectureId) => {

//     try {

//       const token = await getToken()

//       const { data } = await axios.post(backendUrl + '/api/user/update-course-progress',
//         { courseId, lectureId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       )

//       if (data.success) {
//         toast.success(data.message)
//         getCourseProgress()
//       } else {
//         toast.error(data.message)
//       }

//     } catch (error) {
//       toast.error(error.message)
//     }

//   }

//   const getCourseProgress = async () => {

//     try {

//       const token = await getToken()

//       const { data } = await axios.post(backendUrl + '/api/user/get-course-progress',
//         { courseId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       )

//       if (data.success) {
//         setProgressData(data.progressData)
//       } else {
//         toast.error(data.message)
//       }

//     } catch (error) {
//       toast.error(error.message)
//     }

//   }

//   const handleRate = async (rating) => {

//     try {

//       const token = await getToken()

//       const { data } = await axios.post(backendUrl + '/api/user/add-rating',
//         { courseId, rating },
//         { headers: { Authorization: `Bearer ${token}` } }
//       )

//       if (data.success) {
//         toast.success(data.message)
//         fetchUserEnrolledCourses()
//       } else {
//         toast.error(data.message)
//       }

//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   useEffect(() => {

//     getCourseProgress()

//   }, [])

  


//   return courseData ? (
//     <>
    
//     <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36' >
//       <div className=" text-gray-800" >
//         <h2 className="text-xl font-semibold">Course Structure</h2>
//         <div className="pt-5">
//           {courseData && courseData.courseContent.map((chapter, index) => (
//             <div key={index} className="border border-gray-300 bg-white mb-2 rounded">
//               <div
//                 className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
//                 onClick={() => toggleSection(index)}
//               >
//                 <div className="flex items-center gap-2">
//                   <img src={assets.down_arrow_icon} alt="arrow icon" className={`transform transition-transform ${openSections[index] ? "rotate-180" : ""}`} />
//                   <p className="font-medium md:text-base text-sm">{chapter.chapterTitle}</p>
//                 </div>
//                 <p className="text-sm md:text-default">{chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}</p>
//               </div>

//               <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? "max-h-96" : "max-h-0"}`} >
//                 <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
//                   {chapter.chapterContent.map((lecture, i) => (
//                     <li key={i} className="flex items-start gap-2 py-1">
//                       <img src={progressData && progressData.lectureCompleted.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon} alt="bullet icon" className="w-4 h-4 mt-1" />
//                       <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
//                         <p>{lecture.lectureTitle}</p>
//                         <div className='flex gap-2'>
//                           {lecture.lectureUrl && <p onClick={() => setPlayerData({ ...lecture, chapter: index + 1, lecture: i + 1 })} className='text-blue-500 cursor-pointer'>Watch</p>}
//                           <p>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}</p>
//                         </div>
//                       </div>
//                     </li>
//                   ))}
//                 </ul>

//                 <div className="px-4 pb-4">
//   {activeQuiz === index ? (
//     <>
//       <div className="border p-4 rounded mb-2">
//         <p className="font-medium mb-2">{quizData[index]?.[currentQuestionIndex]?.question}</p>
//         <div className="flex flex-col gap-2">
//           {quizData[index]?.[currentQuestionIndex]?.options.map((option, i) => (
//             <button
//               key={i}
//               className={`border px-3 py-1 rounded text-left ${
//                 showAnswer
//                   ? option === quizData[index][currentQuestionIndex].correctAnswer
//                     ? 'bg-green-200'
//                     : option === selectedOption
//                     ? 'bg-red-200'
//                     : ''
//                   : ''
//               }`}
//               onClick={() => {
//                 setSelectedOption(option);
//                 setShowAnswer(true);
//                 if (option === quizData[index][currentQuestionIndex].correctAnswer) {
//                   setScore(score + 1);
//                 }
//               }}
//               disabled={showAnswer}
//             >
//               {option}
//             </button>
//           ))}
//         </div>
//         {showAnswer && (
//           <button
//             className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
//             onClick={() => {
//               setCurrentQuestionIndex(currentQuestionIndex + 1);
//               setShowAnswer(false);
//               setSelectedOption('');
//             }}
//           >
//             {currentQuestionIndex + 1 < quizData[index]?.length ? "Next" : "Finish"}
//           </button>
//         )}
//       </div>
//       {currentQuestionIndex >= quizData[index]?.length && (
//         <p className="text-green-600 font-medium">Quiz Completed! Your score: {score}/{quizData[index]?.length}</p>
//       )}
//     </>
//   ) : (
//     <button
//       onClick={() => {
//         setActiveQuiz(index);
//         setCurrentQuestionIndex(0);
//         setScore(0);
//         setShowAnswer(false);
//         setSelectedOption('');
//       }}
//       className="bg-blue-100 px-4 py-2 rounded mt-2"
//     >
//       Start Quiz
//     </button>
//   )}
// </div>

                
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className=" flex items-center gap-2 py-3 mt-10">
//           <h1 className="text-xl font-bold">Rate this Course:</h1>
//           <Rating initialRating={initialRating} onRate={handleRate} />
//         </div>

//       </div>

//       <div className='md:mt-10'>
//         {
//           playerData
//             ? (
//               <div>
//                 <YouTube iframeClassName='w-full aspect-video' videoId={playerData.lectureUrl.split('/').pop()} />
//                 <div className='flex justify-between items-center mt-1'>
//                   <p className='text-xl '>{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}</p>
//                   <button onClick={() => markLectureAsCompleted(playerData.lectureId)} className='text-blue-600'>{progressData && progressData.lectureCompleted.includes(playerData.lectureId) ? 'Completed' : 'Mark Complete'}</button>
//                 </div>
//               </div>
//             )
//             : <img src={courseData ? courseData.courseThumbnail : ''} alt="" />
//         }
//       </div>
//     </div>
//     <Footer />
//     </>
//   ) : <Loading />
// }

// export default Player

// Updated Player.jsx based on AddCourse schema
// Displays lecture video/document, followed by assignments, then quiz

// import  { useContext, useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { AppContext } from '../context/AppContext';
// import { toast } from 'react-hot-toast';
// import YouTube from 'react-youtube';
// import Rating from '../components/Rating';
// import Footer from '../components/Footer';
// import Loading from '../components/Loading';
// import assets from '../assets';
// import humanizeDuration from 'humanize-duration';
// import axios from 'axios';

const Player = () => {
  const { enrolledCourses, backendUrl, getToken, calculateChapterTime, userData, fetchUserEnrolledCourses } = useContext(AppContext);

  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [initialRating, setInitialRating] = useState(0);

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [score, setScore] = useState(0);

  const getCourseData = () => {
    enrolledCourses.forEach((course) => {
      if (course._id === courseId) {
        setCourseData(course);
        if (userData && Array.isArray(course.courseRatings)) {
          course.courseRatings.forEach((item) => {
            if (item.userId === userData._id) {
              setInitialRating(item.rating);
            }
          });
        }
      }
    });
  };

  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const markLectureAsCompleted = async (lectureId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + '/api/user/update-course-progress',
        { courseId, lectureId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        getCourseProgress();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + '/api/user/get-course-progress',
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setProgressData(data.progressData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRate = async (rating) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + '/api/user/add-rating',
        { courseId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        fetchUserEnrolledCourses();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (enrolledCourses.length > 0) getCourseData();
  }, [enrolledCourses]);

  useEffect(() => {
    getCourseProgress();
  }, []);

  const renderLectureContent = (lecture) => {
    if (lecture.lectureType === 'video' && lecture.lectureUrl.includes('youtube')) {
      const videoId = lecture.lectureUrl.split('/').pop();
      return <YouTube videoId={videoId} className="w-full aspect-video" />;
    } else if (lecture.lectureType === 'document') {
      return (
        <iframe src={lecture.documentUrl} className="w-full h-[500px] border rounded" title="Lecture Document"></iframe>
      );
    }
    return <p className="text-gray-500">Unsupported lecture format</p>;
  };

  return courseData ? (
    <>
      <div className="p-4 sm:p-10 md:px-36 grid md:grid-cols-2 gap-10">
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold mb-4">Course Structure</h2>
          {courseData.courseContent.map((chapter, index) => (
            <div key={index} className="bg-white border rounded mb-4">
              <div
                onClick={() => toggleSection(index)}
                className="flex justify-between items-center px-4 py-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <img src={assets.down_arrow_icon} className={`transition-transform ${openSections[index] ? 'rotate-180' : ''}`} alt="toggle" />
                  <p className="font-medium">{chapter.chapterTitle}</p>
                </div>
                <p className="text-sm">{chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}</p>
              </div>
              {openSections[index] && (
                <div className="p-4 space-y-4">
                  {chapter.chapterContent.map((lecture, i) => (
                    <div key={i} className="border rounded p-3">
                      <div className="flex justify-between">
                        <p className="font-medium">{lecture.lectureTitle}</p>
                        <p>{humanizeDuration(lecture.lectureDuration * 60000, { units: ['h', 'm'] })}</p>
                      </div>
                      <div className="my-2">
                        {renderLectureContent(lecture)}
                      </div>
                      <button
                        onClick={() => markLectureAsCompleted(lecture.lectureId)}
                        className="text-blue-500 mt-2"
                      >
                        {progressData?.lectureCompleted.includes(lecture.lectureId) ? 'Completed' : 'Mark Complete'}
                      </button>
                    </div>
                  ))}

                  {/* Assignments */}
                  {chapter.assignments?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mt-4">Assignments</h3>
                      {chapter.assignments.map((a, i) => (
                        <div key={i} className="border rounded p-3 mt-2">
                          <h4 className="font-medium">{a.title}</h4>
                          <p>{a.description}</p>
                          <a href={a.resourceUrl} target="_blank" className="text-blue-600 underline">View Resource</a>
                          <p className="text-sm text-gray-500">Due: {a.dueDate}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quiz */}
                  {chapter.quiz?.quizQuestions?.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-lg">Quiz</h3>
                      {activeQuiz === index ? (
                        <>
                          <div className="border p-4 rounded mb-2">
                            <p className="font-medium mb-2">{chapter.quiz.quizQuestions[currentQuestionIndex]?.question}</p>
                            <div className="space-y-2">
                              {chapter.quiz.quizQuestions[currentQuestionIndex]?.options.map((opt, i) => (
                                <button
                                  key={i}
                                  className={`border px-3 py-1 rounded w-full text-left ${
                                    showAnswer
                                      ? opt === chapter.quiz.quizQuestions[currentQuestionIndex].answer
                                        ? 'bg-green-200'
                                        : opt === selectedOption
                                        ? 'bg-red-200'
                                        : ''
                                      : ''
                                  }`}
                                  onClick={() => {
                                    setSelectedOption(opt);
                                    setShowAnswer(true);
                                    if (opt === chapter.quiz.quizQuestions[currentQuestionIndex].answer) {
                                      setScore(score + 1);
                                    }
                                  }}
                                  disabled={showAnswer}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                            {showAnswer && (
                              <button
                                onClick={() => {
                                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                                  setShowAnswer(false);
                                  setSelectedOption('');
                                }}
                                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
                              >
                                {currentQuestionIndex + 1 < chapter.quiz.quizQuestions.length ? 'Next' : 'Finish'}
                              </button>
                            )}
                          </div>
                          {currentQuestionIndex >= chapter.quiz.quizQuestions.length && (
                            <p className="text-green-600 font-medium">Quiz Completed! Score: {score}/{chapter.quiz.quizQuestions.length}</p>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveQuiz(index);
                            setCurrentQuestionIndex(0);
                            setScore(0);
                            setShowAnswer(false);
                            setSelectedOption('');
                          }}
                          className="bg-blue-100 px-4 py-2 rounded mt-2"
                        >
                          Start Quiz
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <div className="mt-10">
            <h1 className="text-xl font-bold">Rate this Course:</h1>
            <Rating initialRating={initialRating} onRate={handleRate} />
          </div>
        </div>

        <div className="md:mt-10">
          {playerData ? renderLectureContent(playerData) : <img src={courseData.courseThumbnail} alt="Course Thumbnail" />}
        </div>
      </div>

      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default Player;
