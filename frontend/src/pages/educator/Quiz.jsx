import Loading from "../../components/student/Loading";
import { AppContext } from "../../context/AppContext";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Pencil, Trash2 } from "lucide-react";

const Quiz = () => {
  const [quizzesLoading, setQuizzesLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);

  const { backendUrl, isEducator, navigate } = useContext(AppContext);
  const fetchQuizzes = async () => {
    setQuizzesLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/educator/quiz`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setQuizzes(data.quizzes);
      console.log("Fetched quizzes:", data.quizzes);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setQuizzesLoading(false);
    }
  };
  useEffect(() => {
    if (isEducator) {
      axios
        .get(`${backendUrl}/api/educator/course`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setCourses(res.data.courses))
        .catch((err) => toast.error(err.message));
      fetchQuizzes();
    }
  }, [isEducator]);

  const handleDeleteQuiz = async (courseId, chapterId) => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this quiz?"
      );
      if (!confirm) return;
      const { data } = await axios.delete(
        `${backendUrl}/api/educator/quiz/${courseId}/${chapterId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (data.success) {
        toast.success("Quiz deleted");
        fetchQuizzes();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };


  return quizzesLoading ? (
    <Loading />
  ) : (
    <div className="h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 ">
      <div className="w-full">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-medium">Quizzes</h2>
          <button
            onClick={() => navigate("/educator/quiz/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            + Add Quiz
          </button>
        </div>

        <div className="flex flex-col items-center max-w-4xl w-full overflow-x-auto rounded-md bg-white border border-gray-500/20">
          <table className="min-w-[600px] table-auto w-full text-sm">
            <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">Course</th>
                <th className="px-4 py-3 font-semibold truncate">Chapter</th>
                <th className="px-4 py-3 font-semibold truncate">Number of Questions</th>
                <th className="px-4 py-3 font-semibold truncate">Date</th>
                <th className="px-4 py-3 font-semibold truncate">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {quizzes
                .filter((q) => q.quizQuestions && q.quizQuestions.length > 0)
                .map((q, index) => (
                  <tr key={index} className="border-b border-gray-500/20">
                    <td className="px-4 py-3 truncate">
                      {courses.find((c) => c._id === q.courseId)?.courseTitle ||
                        q.courseId}
                    </td>
                    <td className="px-4 py-3 truncate">
                      {courses
                        .find((c) => c._id === q.courseId)
                        ?.courseContent.find(
                          (ch) => ch.chapterId === q.chapterId
                        )?.chapterTitle || q.chapterId}
                    </td>
                    <td className="px-4 py-3 capitalize truncate">
                      {q.quizQuestions.length}
                    </td>
                    <td className="px-4 py-3 truncate">
                      {new Date(q.updatedAt || new Date()).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 truncate">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            navigate(
                              `/educator/quiz/edit/${q.courseId}/${q.chapterId}`
                            )
                          }
                          className="text-yellow-500 hover:text-yellow-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteQuiz(q.courseId, q.chapterId)
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
