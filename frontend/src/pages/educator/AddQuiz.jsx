import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Sparkles } from "lucide-react";

const AddQuizz = () => {
  const { backendUrl, isEducator, navigate } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quizzesLoading, setQuizzesLoading] = useState(true);
  const [quizType, setQuizType] = useState("manual");
  const [editMode, setEditMode] = useState(false);
  const [editChapterId, setEditChapterId] = useState("");

  const [form, setForm] = useState({
    courseId: "",
    chapterId: "",
    quizType: "manual",
    quizQuestions: [{ question: "", options: ["", "", "", ""], correctAnswer: "" }],
  });

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

  useEffect(() => {
    const course = courses.find((c) => c._id === form.courseId);
    setChapters(course?.courseContent || []);
  }, [form.courseId, courses]);

  const fetchQuizzes = async () => {
    setQuizzesLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/educator/quiz`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setQuizzes(data.quizzes);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setQuizzesLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setForm((prev) => ({
      ...prev,
      quizQuestions: [
        ...prev.quizQuestions,
        { question: "", options: ["", "", "", ""], correctAnswer: "" },
      ],
    }));
  };

  const handleQuestionChange = (i, field, value, optIndex) => {
    setForm((prev) => {
      const questions = [...prev.quizQuestions];
      if (field === "option") {
        questions[i].options[optIndex] = value;
         if (questions[i].correctAnswer === questions[i].options[optIndex]) {
          questions[i].correctAnswer = value;
         }
      } else {
        questions[i][field] = value;
      }
      return { ...prev, quizQuestions: questions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.courseId ||
      !form.chapterId ||
      (form.quizType === "manual" &&
        form.quizQuestions.some(
          (q) => !q.question || !q.correctAnswer || q.options.some((o) => !o)
        ))
    ) {
      return toast.error("Fill all required fields");
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${backendUrl}/api/educator/quiz/add`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (data.success) {
        toast.success("Quiz added");
        setForm({
          courseId: "",
          chapterId: "",
          quizType: "manual",
          quizQuestions: [
            { question: "", options: ["", "", "", ""], correctAnswer: "" },
          ],
        });
        setQuizType("manual");
        setEditMode(false);
        fetchQuizzes();
        navigate("/educator/quiz");
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6">
      <div className="max-w-4xl bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          {editMode ? "Edit Quiz" : "Add Quiz"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <select
              value={form.courseId}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  courseId: e.target.value,
                  chapterId: "",
                }))
              }
              className="p-2 border rounded flex-1"
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.courseTitle}
                </option>
              ))}
            </select>
            <select
              value={form.chapterId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, chapterId: e.target.value }))
              }
              className="p-2 border rounded flex-1"
            >
              <option value="">Select Chapter</option>
              {chapters.map((ch) => (
                <option key={ch.chapterId} value={ch.chapterId}>
                  {ch.chapterTitle}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="flex items-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
              onClick={() => toast.info("AI generation not implemented yet")}
            >
              <Sparkles size={18} /> Generate with AI
            </button>
          </div>

          {form.quizQuestions.map((q, i) => (
            <div key={i} className="border p-4 rounded space-y-2 bg-gray-50">
              <input
                type="text"
                value={q.question}
                onChange={(e) =>
                  handleQuestionChange(i, "question", e.target.value)
                }
                placeholder={`Question #${i + 1}`}
                className="p-2 border rounded w-full"
              />
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, j) => (
                  <label
                    key={j}
                    className="flex items-center gap-2 p-2 border rounded w-full"
                  >
                    <input
                      type="radio"
                      name={`correct-${i}`}
                      checked={q.correctAnswer === opt}
                      onChange={() =>
                        handleQuestionChange(i, "correctAnswer", opt)
                      }
                    />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) =>
                      handleQuestionChange(i, "option", e.target.value, j)
                    }
                    placeholder={`Option ${j + 1}`}
                    className="p-2 border rounded w-full"
                  />
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="text-blue-600"
          >
            + Add another question
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {loading
              ? editMode
                ? "Updating..."
                : "Saving..."
              : editMode
              ? "Update Quiz"
              : "Create Quiz"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddQuizz;
