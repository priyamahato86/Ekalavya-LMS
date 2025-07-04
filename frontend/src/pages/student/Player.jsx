import { useContext, useEffect, useState, useRef } from "react";
import { AppContext } from "../../context/AppContext";
import YouTube from "react-youtube";
import { assets } from "../../assets/assets";
import { useParams } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import axios from "axios";
import { toast } from "react-toastify";
import Rating from "../../components/student/Rating";
import Footer from "../../components/student/Footer";
import Loading from "../../components/student/Loading";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  Play,
  Award,
  Download,
} from "lucide-react";

const Player = () => {
  const {
    enrolledCourses,
    backendUrl,
    calculateChapterTime,
    userData,
    fetchUserEnrolledCourses,
  } = useContext(AppContext);

  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [selectedContent, setSelectedContent] = useState(null);
  const [contentType, setContentType] = useState("");
  //const [playerData, setPlayerData] = useState(null);
  const [initialRating, setInitialRating] = useState(0);

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  // const [selectedOption, setSelectedOption] = useState('');
  // const [score, setScore] = useState(0);
  const fileInputRef = useRef(null);

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
  const selectContent = (content, type) => {
    if (type === 'quiz' && !content.id) {
    content.id = `${content.title}-${Math.random().toString(36).substr(2, 9)}`; // Generate fallback id if missing
  }
    setSelectedContent(content);
    setContentType(type);
    if (type === "quiz") {
       const questions = content.quizQuestions || content.questions || [];
      setActiveQuiz({
      ...content,
      quizQuestions: questions , // normalize
    });
      setCurrentQuestionIndex(0);
      setQuizCompleted(false);
      setQuizScore(0);
      setShowAnswer(false);
      setSelectedAnswer("");
    }
  };

  const markLectureAsCompleted = async (lectureId) => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        backendUrl + "/api/user/update-course-progress",
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
      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        backendUrl + "/api/user/get-course-progress",
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
      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        backendUrl + "/api/user/add-rating",
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

  const renderLectureContent = (lecture) => {
    if (
      lecture.lectureType === "video" &&
      lecture.lectureUrl.includes("youtube")
    ) {
      const videoId = lecture.lectureUrl.split("/").pop();
      return <YouTube videoId={videoId} className="w-full aspect-video" />;
    } else if (lecture.lectureType === "document") {
      return (
        <iframe
          src={lecture.documentUrl}
          className="w-full h-[500px] border rounded"
          title="Lecture Document"
        ></iframe>
      );
    }
    return <p className="text-gray-500">Unsupported lecture format</p>;
  };

  const handleFileUpload = async (assignmentId, file) => {
    try {
      const formData = new FormData();
      formData.append("assignment", file);
      formData.append("assignmentId", assignmentId);
      formData.append("courseId", courseId);

      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${backendUrl}/api/user/submit-assignment`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success("Assignment submitted successfully");
        // Optionally refresh user progress
        getCourseProgress();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Upload failed. Try again.");
      console.error(err);
    }
  };

  const handleQuizAnswer = (option) => {
    if (!activeQuiz?.quizQuestions?.[currentQuestionIndex]) return;

    const currentQ = activeQuiz.quizQuestions[currentQuestionIndex];
    setSelectedAnswer(option);
    setShowAnswer(true);
    if (option === currentQ.correctAnswer) setQuizScore((prev) => prev + 1);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 >= activeQuiz.quizQuestions.length) {
      setQuizCompleted(true);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer("");
      setShowAnswer(false);
    }
  };

  useEffect(() => {
    if (enrolledCourses.length > 0) getCourseData();
  }, [enrolledCourses]);

  useEffect(() => {
    getCourseProgress();
  }, []);

  // const renderLectureContent = (lecture) => {
  //   if (lecture.lectureType === 'video' && lecture.lectureUrl.includes('youtube')) {
  //     const videoId = lecture.lectureUrl.split('/').pop();
  //     return <YouTube videoId={videoId} className="w-full aspect-video" />;
  //   } else if (lecture.lectureType === 'document') {
  //     return (
  //       <iframe src={lecture.documentUrl} className="w-full h-[500px] border rounded" title="Lecture Document"></iframe>
  //     );
  //   }
  //   return <p className="text-gray-500">Unsupported lecture format</p>;
  // };

  return courseData ? (
    <>
      <div className="min-h-screen w-full px-4 sm:px-6 lg:px-12 py-8 bg-gray-50">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Course Content
                </h2>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {courseData.courseContent.map((chapter, index) => (
                  <div key={index} className="border-b">
                    {/* Chapter Header */}
                    <div
                      className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleSection(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {openSections[index] ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          )}
                          <h3 className="font-medium text-gray-900">
                            {chapter.chapterTitle}
                          </h3>
                        </div>
                        <span className="text-sm text-gray-500">
                          {chapter.chapterContent.length} lectures
                        </span>
                      </div>
                    </div>

                    {/* Chapter Contents */}
                    {openSections[index] && (
                      <div className="px-6 pb-4 space-y-2">
                        {/* Lectures */}
                        {chapter.chapterContent.map((lecture) => (
                          <div
                            key={lecture.lectureId}
                            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                              selectedContent?.id === lecture.lectureId
                                ? "bg-blue-50 border border-blue-200"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() => selectContent(lecture, "lecture")}
                          >
                            <Play className="h-4 w-4 text-blue-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {lecture.lectureTitle}
                              </p>
                              <p className="text-xs text-gray-500">
                                {humanizeDuration(
                                  lecture.lectureDuration * 60000,
                                  { units: ["h", "m"] }
                                )}
                              </p>
                            </div>
                          </div>
                        ))}

                        {/* Assignments */}
                        {chapter.assignments?.map((a) => (
                          <div
                            key={a.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                              selectedContent?.id === a.id
                                ? "bg-orange-50 border border-orange-200"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() => selectContent(a, "assignment")}
                          >
                            <FileText className="h-4 w-4 text-orange-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {a.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                Due: {a.dueDate}
                              </p>
                            </div>
                          </div>
                        ))}

                        {/* Quiz */}
                        {chapter.quiz?.quizQuestions?.length > 0 && (
                          
                          <div
                           key={`quiz-${chapter.quiz.id || chapter.quiz.title || index}`}
                            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                              selectedContent?.id === chapter.quiz.id
                                ? "bg-purple-50 border border-purple-200"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() => selectContent(chapter.quiz, "quiz")}
                          >
                            <Award className="h-4 w-4 text-purple-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {chapter.quiz.title || "Chapter Quiz"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {chapter.quiz.quizQuestions.length} questions
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Player Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              {!selectedContent ? (
                <div className="text-center">
                  <img
                    src={courseData.courseThumbnail}
                    alt="Course Thumbnail"
                    className="w-full h-[400px] object-cover rounded-lg mb-4"
                  />
                </div>
              ) : contentType === "lecture" ? (
                <>
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedContent.lectureTitle}
                  </h2>
                  {/* <div className="bg-black aspect-video rounded-lg mb-6 flex items-center justify-center">
                    <Play className="h-12 w-12 text-white" />
                  </div> */}
                  <div className="mb-6">
      {renderLectureContent(selectedContent)}
    </div>
                  <button
                    onClick={() =>
                      markLectureAsCompleted(selectedContent.lectureId)
                    }
                    className={`px-4 py-2 rounded text-sm font-medium ${
                      progressData?.lectureCompleted.includes(
                        selectedContent.lectureId
                      )
                        ? "bg-green-100 text-green-700 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                    disabled={progressData?.lectureCompleted.includes(
                      selectedContent.lectureId
                    )}
                  >
                    {progressData?.lectureCompleted.includes(
                      selectedContent.lectureId
                    )
                      ? "Completed"
                      : "Mark as Complete"}
                  </button>
                </>
              ) : contentType === "assignment" ? (
                <>
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedContent.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {selectedContent.description}
                  </p>
                  {selectedContent.resourceUrl && (
                    <a
                      href={selectedContent.resourceUrl}
                      target="_blank"
                      className="inline-flex items-center text-blue-600 hover:underline"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      View Resource
                    </a>
                  )}
                  <div className="mt-6">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(selectedContent.id, file);
                      }}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                      Upload Assignment
                    </button>
                  </div>
                </>
              ) : contentType === "quiz" && activeQuiz ? (
                <>
                  <h2 className="text-2xl font-bold mb-4">
                    {selectedContent.title || "Quiz"}
                  </h2>
                  <>
                    {!quizCompleted ? (
                      <>
                        <p className="text-gray-600 mb-2">
                          Question {currentQuestionIndex + 1} of{" "}
                          {activeQuiz.quizQuestions.length}
                        </p>
                        <h4 className="text-lg font-semibold mb-4">
                          {
                            activeQuiz.quizQuestions[currentQuestionIndex]
                              .question
                          }
                        </h4>

                        <div className="space-y-3 mb-6">
                          {activeQuiz.quizQuestions[
                            currentQuestionIndex
                          ].options.map((option, i) => (
                            <button
                              key={i}
                              onClick={() =>
                                !showAnswer && handleQuizAnswer(option)
                              }
                              className={`w-full px-4 py-3 text-left rounded-lg border ${
                                showAnswer
                                  ? option ===
                                    activeQuiz.quizQuestions[
                                      currentQuestionIndex
                                    ].correctAnswer
                                    ? "bg-green-100 border-green-300 text-green-700"
                                    : selectedAnswer === option
                                    ? "bg-red-100 border-red-300 text-red-700"
                                    : ""
                                  : "hover:bg-gray-50"
                              }`}
                              disabled={showAnswer}
                            >
                              {option}
                            </button>
                          ))}
                        </div>

                        {showAnswer && (
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-700">
                              {selectedAnswer ===
                              activeQuiz.quizQuestions[currentQuestionIndex]
                                .correctAnswer
                                ? "✅ Correct!"
                                : `❌ Incorrect. Correct: ${activeQuiz.quizQuestions[currentQuestionIndex].correctAnswer}`}
                            </p>
                            <button
                              onClick={nextQuestion}
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                              {currentQuestionIndex <
                              activeQuiz.quizQuestions.length - 1
                                ? "Next"
                                : "Finish"}
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center">
                        <h4 className="text-xl font-semibold text-green-700 mb-2">
                          Quiz Completed!
                        </h4>
                        <p className="text-gray-700 mb-4">
                          You scored {quizScore} out of{" "}
                          {activeQuiz.quizQuestions.length} (
                          {Math.round(
                            (quizScore / activeQuiz.quizQuestions.length) * 100
                          )}
                          %)
                        </p>
                      </div>
                    )}
                  </>

                  {/* You can drop in your quiz logic here as shown in your CoursePlayer component */}
                  {/* Use currentQuestionIndex, selectedAnswer, quizScore, quizCompleted, etc. */}
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Course Rating Section */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Rate this Course
          </h3>
          <Rating initialRating={initialRating} onRate={handleRate} />
        </div>
      </div>

      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default Player;
