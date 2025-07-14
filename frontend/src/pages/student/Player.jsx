import { useContext, useEffect, useState, useRef } from "react";
import { AppContext } from "../../context/AppContext";
import YouTube from "react-youtube";
import { useParams } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import axios from "axios";
import { toast } from "react-toastify";
import Rating from "../../components/student/Rating";
import Footer from "../../components/student/Footer";
import Loading from "../../components/student/Loading";
import Markdown from "react-markdown";

import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  Play,
  Award,
  Download,
  Cloud,
} from "lucide-react";

const Player = () => {
  const { enrolledCourses, backendUrl, userData, fetchUserEnrolledCourses } =
    useContext(AppContext);

  const { courseId, chapterId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [selectedContent, setSelectedContent] = useState(null);
  const [contentType, setContentType] = useState("");
  const [initialRating, setInitialRating] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [mySubmissions, setMySubmissions] = useState([]);

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState("");
  const [loadingFeedback, setLoadingFeedback] = useState(false);

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
    if (lecture.lectureType === "video") {
      let videoUrl = lecture.lectureUrl;
      let videoId = "";

      if (videoUrl.includes("youtu.be/")) {
        videoId = videoUrl.split("youtu.be/")[1];
      } else if (videoUrl.includes("watch?v=")) {
        videoId = new URLSearchParams(new URL(videoUrl).search).get("v");
      }

      return (
        <div className="w-full aspect-video">
          <YouTube
            videoId={videoId}
            opts={{
              width: "100%",
              height: "100%",
              playerVars: {
                autoplay: 0,
              },
            }}
            className="w-full h-full"
          />
        </div>
      );
    }

    return <p className="text-gray-500">Unsupported lecture format</p>;
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "assignment_upload");

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/demqrjawq/auto/upload",
      formData
    );

    return response.data.secure_url;
  };

  const handleFileUpload = async (assignmentId, file) => {
    try {
      const fileUrl = await uploadToCloudinary(file);
      const token = localStorage.getItem("token");

      const mySubmission = mySubmissions.find(
        (s) => s.assignmentId === assignmentId
      );

      const endpoint = mySubmission
        ? `${backendUrl}/api/user/edit-submission/${mySubmission._id}`
        : `${backendUrl}/api/user/submit-assignment`;

      const method = mySubmission ? "put" : "post";
      const body = mySubmission
        ? { submissionFileUrl: fileUrl }
        : {
            courseId,
            assignmentId,
            assignmentTitle: selectedContent.title,
            chapterId: selectedContent.chapterId,
            submissionFileUrl: fileUrl,
          };

      const { data } = await axios[method](endpoint, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success(
          mySubmission ? "Assignment updated" : "Assignment submitted"
        );
        getCourseProgress();
        fetchMySubmissions();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Upload failed. Try again.");
      console.error(err);
    }
  };

  const fetchMySubmissions = async () => {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(
      `${backendUrl}/api/user/my-submissions/${courseId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (data.success) setMySubmissions(data.submissions);
  };

  useEffect(() => {
    if (courseData) fetchMySubmissions();
  }, [courseData]);

  const handleDeleteSubmission = async (submissionId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `${backendUrl}/api/user/delete-submission/${submissionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Submission deleted");
      fetchMySubmissions();
    } catch (err) {
      toast.error("Failed to delete", err.message);
    }
  };

  const handleQuizAnswer = (option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: option,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < activeQuiz.quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateScoreAndSubmit();
    }
  };
  const calculateScoreAndSubmit = async () => {
    let score = 0;
    activeQuiz.quizQuestions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctAnswer) score++;
    });

    const { courseId, chapterId } = selectedContent || {};

    const answersObj =
      selectedAnswers instanceof Map
        ? Object.fromEntries(selectedAnswers)
        : selectedAnswers;

    const payload = { courseId, chapterId, selectedAnswers: answersObj, score };
    console.log("Submitting quiz payload:", payload);
    if (!courseId || !chapterId || score == null) {
      console.warn("Aborting submit—missing data:", payload);
      toast.error("Quiz submission aborted: missing course or chapter ID");
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/submit-quiz`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("submitQuiz success:", data);
      setQuizScore(data.submission.score);
      setSelectedAnswers(data.submission.selectedAnswers);
      setQuizCompleted(true);
      setAlreadyAttempted(true);
      localStorage.setItem(
        "lastSelectedContent",
        JSON.stringify({ content: selectedContent, type: "quiz" })
      );
      fetchQuizFeedback();
    } catch (err) {
      console.error("submitQuiz error:", err.response || err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Could not submit quiz—check console"
      );
    }
  };

  const handleReattempt = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setQuizCompleted(false);
    setQuizScore(0);
    setAlreadyAttempted(false);
  };
  const fetchSubmission = async (courseId, chapterId) => {
    setLoadingQuiz(true);
    try {
      const res = await axios.get(
        `${backendUrl}/api/user/check-quiz-submission/${courseId}/${chapterId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.submitted) {
        setQuizCompleted(true);
        setQuizScore(res.data.submission.score);
        setSelectedAnswers(res.data.submission.selectedAnswers || {});
        setQuizFeedback(res.data.submission.feedback || "");
        setAlreadyAttempted(true);
      } else {
        setQuizCompleted(false);
        setAlreadyAttempted(false);
        setSelectedAnswers({});
        setQuizScore(0);
      }
    } catch (error) {
      console.error("Failed to load quiz submission:", error);
    } finally {
      setLoadingQuiz(false);
    }
  };
  const selectContent = (content, type) => {
    setSelectedContent(content);
    setContentType(type);
    // localStorage.setItem(
    //   "lastSelectedContent",
    //   JSON.stringify({ content, type })
    // );

    if (type === "quiz") {
      const questions = content.quizQuestions || content.questions || [];
      setActiveQuiz({ ...content, quizQuestions: questions });
      setSelectedAnswers({});
      setCurrentQuestionIndex(0);
      setQuizCompleted(false);
      setQuizScore(0);
      setAlreadyAttempted(false);
      fetchSubmission(content.courseId, content.chapterId);
    }
  };

  useEffect(() => {
    setSelectedContent(null);
    setContentType("");
  }, []);

  useEffect(() => {
    if (
      contentType === "quiz" &&
      selectedContent?.courseId &&
      selectedContent?.chapterId
    ) {
      fetchSubmission(selectedContent.courseId, selectedContent.chapterId);
    }
  }, [selectedContent?.courseId, selectedContent?.chapterId, contentType]);

  useEffect(() => {
    if (enrolledCourses.length > 0) getCourseData();
  }, [enrolledCourses]);

  useEffect(() => {
    getCourseProgress();
  }, []);

  const fetchQuizFeedback = async () => {
    if (!selectedContent?.courseId || !selectedContent?.chapterId) return;

    try {
      setLoadingFeedback(true);
      const { data } = await axios.post(
        `${backendUrl}/api/user/generate-feedback`,
        {
          courseId: selectedContent.courseId,
          chapterId: selectedContent.chapterId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (data.success) {
        setQuizFeedback(data.feedback);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to load feedback");
      console.error(err);
    } finally {
      setLoadingFeedback(false);
    }
  };

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
                            key={`quiz-${chapter.chapterId}`}
                            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                              selectedContent?.id === chapter.quiz.id
                                ? "bg-purple-50 border border-purple-200"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() =>
                              selectContent(
                                {
                                  ...chapter.quiz,
                                  chapterId: chapter.chapterId,
                                  courseId: courseData._id,
                                  id: `quiz-${chapter.chapterId}`,
                                },
                                "quiz"
                              )
                            }
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
                  <div className="mt-6 border border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 relative">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer text-center space-y-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploading(true);
                            setUploadedFile(file);
                            handleFileUpload(
                              selectedContent.assignmentId,
                              file
                            ).finally(() => {
                              setUploading(false);
                            });
                          }
                        }}
                      />

                      <Cloud className="mx-auto h-6 w-6 text-blue-500" />
                      <p className="text-gray-700 font-medium">Upload files</p>
                      <p className="text-sm text-gray-500">
                        Choose a file or drag & drop it here <br />
                        (JPEG, PNG, PDF, MP4 - up to 50MB)
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Browse File
                      </button>
                    </div>

                    {uploading && (
                      <div className="mt-4 text-sm text-blue-600">
                        Uploading...
                      </div>
                    )}

                    {mySubmissions &&
                      selectedContent?.assignmentId &&
                      (() => {
                        const submission = mySubmissions.find(
                          (s) => s.assignmentId === selectedContent.assignmentId
                        );
                        return submission ? (
                          <div className="mt-6 bg-white p-4 border rounded shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-800">
                                  {submission.assignmentTitle}
                                </p>
                                <a
                                  href={submission.submissionFileUrl}
                                  target="_blank"
                                  className="text-blue-600 text-xs underline"
                                >
                                  View Submitted File
                                </a>
                              </div>
                              {!submission.grade && !submission.feedback && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      fileInputRef.current?.click()
                                    }
                                    className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteSubmission(submission._id)
                                    }
                                    className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                            {/* Grade & Feedback */}
                            {(submission.grade || submission.feedback) && (
                              <div className="mt-2 p-4 bg-gray-50 border border-dashed rounded-lg">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                  Educator Feedback
                                </h4>
                                {submission.grade && (
                                  <p className="text-sm text-gray-800">
                                    <span className="font-medium">Grade:</span>{" "}
                                    <span className="text-blue-600 font-semibold">
                                      {submission.grade}
                                    </span>
                                  </p>
                                )}
                                {submission.feedback && (
                                  <p className="text-sm text-gray-800 mt-1">
                                    <span className="font-medium">
                                      Feedback:
                                    </span>{" "}
                                    {submission.feedback}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ) : null;
                      })()}
                  </div>
                </>
              ) : (
                contentType === "quiz" &&
                activeQuiz && (
                  <>
                    <h2 className="text-2xl font-bold mb-4">
                      {selectedContent.title || "Quiz"}
                    </h2>

                    {loadingQuiz ? (
                      <div className="text-center py-10">
                        Loading your results…
                      </div>
                    ) : quizCompleted || alreadyAttempted ? (
                      <>
                        <div className="text-center mb-6">
                          <h4 className="text-xl font-semibold text-green-700 mb-2">
                            Quiz Completed!
                          </h4>
                          <p className="text-gray-700">
                            You scored {quizScore} /{" "}
                            {activeQuiz.quizQuestions.length} (
                            {Math.round(
                              (quizScore / activeQuiz.quizQuestions.length) *
                                100
                            )}
                            %)
                          </p>
                          {loadingFeedback ? (
                            <p className="text-center text-blue-600 font-medium">
                              Generating feedback...
                            </p>
                          ) : (
                            quizFeedback && (
                              <div className="w-full p-6 bg-white border border-green-200 rounded-lg shadow">
                                <h4 className="text-xl font-semibold text-green-800 mb-4">
                                  AI Feedback on Your Quiz
                                </h4>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                  <Markdown>{quizFeedback}</Markdown>
                                </p>
                              </div>
                            )
                          )}
                        </div>

                        <div className="space-y-4">
                          {activeQuiz.quizQuestions.map((q, idx) => (
                            <div
                              key={idx}
                              className="p-4 border rounded bg-gray-50"
                            >
                              <p className="font-medium mb-1">
                                Q{idx + 1}. {q.question}
                              </p>
                              <p
                                className={`text-sm mb-1 ${
                                  selectedAnswers[idx] === q.correctAnswer
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                Your Answer: {selectedAnswers[idx] || "—"}
                              </p>
                              {selectedAnswers[idx] !== q.correctAnswer && (
                                <p className="text-sm text-green-600">
                                  Correct: {q.correctAnswer}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="mt-8 flex flex-col gap-6 w-full">
                          <div className="flex flex-wrap justify-center gap-4 w-full">
                            <button
                              disabled
                              className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed transition"
                            >
                              Already Attempted
                            </button>
                            <button
                              onClick={handleReattempt}
                              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-lg transition"
                            >
                              Reattempt
                            </button>
                            {/* <button
                            onClick={fetchQuizFeedback}
                            className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-4 py-2 rounded-lg transition"
                          >
                            Get AI Feedback
                          </button> */}
                          </div>
                        </div>
                      </>
                    ) : (
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
                              onClick={() => handleQuizAnswer(option)}
                              className={`w-full px-4 py-3 text-left rounded-lg border ${
                                selectedAnswers[currentQuestionIndex] === option
                                  ? "bg-blue-100 border-blue-300"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>

                        <div className="text-right">
                          <button
                            onClick={nextQuestion}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            disabled={
                              selectedAnswers[currentQuestionIndex] ===
                              undefined
                            }
                          >
                            {currentQuestionIndex <
                            activeQuiz.quizQuestions.length - 1
                              ? "Next"
                              : "Finish"}
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )
              )}
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
