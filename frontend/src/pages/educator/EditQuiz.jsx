import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { Sparkles } from "lucide-react";

const EditQuiz = () => {
  const { backendUrl, navigate, isEducator } = useContext(AppContext);
  const { courseId, chapterId } = useParams();

  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    courseId: courseId,
    chapterId: chapterId,
    numQuestions: 0,
    quizQuestions: [{ question: "", options: ["", "", "", ""], answer: "" }],
  });

  useEffect(() => {
    if (isEducator) {
      axios
        .get(`${backendUrl}/api/educator/course`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setCourses(res.data.courses))
        .catch((err) => toast.error(err.message));
    }
  }, [isEducator]);

  useEffect(() => {
    const course = courses.find((c) => c._id === courseId);
    setChapters(course?.courseContent || []);
  }, [courseId, courses]);

  // Fetch and prefill quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/educator/quiz/${courseId}/${chapterId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const quiz = res.data.quiz;

        setForm({
          courseId,
          chapterId,
          numQuestions: quiz.quizQuestions?.length || 0,
          quizQuestions: quiz.quizQuestions,
        });
      } catch (err) {
        console.log(err);
        toast.error("Failed to fetch quiz data.");
      }
    };

    if (isEducator && courseId && chapterId) {
      fetchQuiz();
    }
  }, [isEducator, courseId, chapterId]);

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

  const handleAddQuestion = () => {
    setForm((prev) => ({
      ...prev,
      quizQuestions: [
        ...prev.quizQuestions,
        { question: "", options: ["", "", "", ""], answer: "" },
      ],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.courseId ||
      !form.chapterId ||
      form.quizQuestions.some(
        (q) => !q.question || !q.answer || q.options.some((o) => !o)
      )
    ) {
      return toast.error("Fill all required fields");
    }

    try {
      setLoading(true);
      const res = await axios.put(
        `${backendUrl}/api/educator/quiz/${courseId}/${chapterId}`,
        form,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.data.success) {
        toast.success("Quiz updated successfully");
        navigate("/educator/quiz");
      } else {
        toast.error(res.data.message || "Failed to update quiz");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6">
      <div className="max-w-4xl bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Edit Quiz</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 flex-wrap items-center">
            <select
              value={form.courseId}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  courseId: e.target.value,
                  chapterId: "",
                }))
              }
              className="p-2 border rounded flex-1 min-w-[150px]"
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
              className="p-2 border rounded flex-1 min-w-[150px]"
            >
              <option value="">Select Chapter</option>
              {chapters.map((ch) => (
                <option key={ch.chapterId} value={ch.chapterId}>
                  {ch.chapterTitle}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              max="20"
              placeholder="No. of questions"
              className="p-2 border rounded w-48"
              value={form.numQuestions || ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  numQuestions: Number(e.target.value),
                }))
              }
            />
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
              <div className="space-y-2">
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
            {loading ? "Updating..." : "Update Quiz"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditQuiz;
