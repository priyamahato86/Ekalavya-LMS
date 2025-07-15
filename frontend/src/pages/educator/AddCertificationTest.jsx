import { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Sparkles } from "lucide-react";
import { AppContext } from "../../context/AppContext";

const AddCertificationTest = () => {
  const { backendUrl, isEducator, navigate } = useContext(AppContext);

  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generateAI, setGenerateAI] = useState(false);
  const [duration, setDuration] = useState(""); // 1 hour default
  const [passMarks, setPassMarks] = useState("");
  const [totalMarks, setTotalMarks] = useState("");

  useEffect(() => {
    if (isEducator) {
      axios
        .get(`${backendUrl}/api/educator/course`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => setCourses(res.data.courses))
        .catch((err) => toast.error("Failed to fetch courses"));
    }
  }, [isEducator]);

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { question: "", options: ["", "", "", ""], correctAnswer: "" },
    ]);
  };

  const handleQuestionChange = (index, field, value, optionIndex) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const current = updated[index];

      if (field === "option") {
        current.options[optionIndex] = value;
        if (current.correctAnswer === current.options[optionIndex]) {
          current.correctAnswer = value;
        }
      } else {
        current[field] = value;
      }

      updated[index] = current;
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!courseId) return toast.error("Please select a course");
    if (
      questions.some(
        (q) => !q.question || q.options.some((opt) => !opt) || !q.correctAnswer
      )
    ) {
      return toast.error("Please complete all questions");
    }

    try {
      setLoading(true);
      await axios.post(
        `${backendUrl}/api/educator/certification-test/add`,
        {
          courseId,
          durationMinutes: duration,
          totalMarks,
          passMarks,
          questions,
          generatedByAI: generateAI,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Certification test created!");
      navigate("/educator/certification-test");
    } catch (err) {
      console.log("Error:", err);
      toast.error("Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  const handleAIQuestionGeneration = async () => {
    if (!courseId) return toast.error("Select a course first");

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/api/educator/certification-test/generate-ai`,
        { courseId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setQuestions(data.questions);
      setGenerateAI(true);
      toast.success("AI-generated questions loaded!");
    } catch (err) {
      toast.error("AI generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6">
      <div className="max-w-4xl bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          Add Final Certification Test
        </h2>
        <div className="space-y-4">
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="p-2 border rounded w-full"
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.courseTitle}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Duration (minutes)"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Total Marks"
              value={totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
              className="p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Passing Marks"
              value={passMarks}
              onChange={(e) => setPassMarks(Number(e.target.value))}
              className="p-2 border rounded"
            />
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <button
              onClick={handleAddQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full md:w-auto"
            >
              + Add Question
            </button>
            <button
              onClick={handleAIQuestionGeneration}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors w-full md:w-auto"
            >
              <Sparkles size={18} /> Generate with AI
            </button>
          </div>

          {questions.map((q, i) => (
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
                  <div
                    key={j}
                    className={`flex items-center gap-2 p-2 rounded border ${
                      q.correctAnswer === opt
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`correct-${i}`}
                      checked={q.correctAnswer === opt}
                      onChange={() =>
                        handleQuestionChange(i, "correctAnswer", opt)
                      }
                      className="accent-blue-600"
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
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded transition"
          >
            {loading ? "Submitting..." : "Create Certification Test"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCertificationTest;
