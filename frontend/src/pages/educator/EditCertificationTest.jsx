import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

const EditCertificationTest = () => {
  const { backendUrl, isEducator, navigate } = useContext(AppContext);
  const { testId } = useParams();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    courseId: "",
    durationMinutes: 60,
    totalMarks: 100,
    passMarks: 40,
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
      },
    ],
  });

  // Fetch courses
  useEffect(() => {
    if (isEducator) {
      axios
        .get(`${backendUrl}/api/educator/course`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setCourses(res.data.courses))
        .catch((err) => toast.error("Failed to load courses"));
    }
  }, [isEducator]);

  // Fetch test data
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/educator/certification-test/${testId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!data.test) return toast.error("Test not found");

        setForm({
          courseId: data.test.courseId,
          durationMinutes: data.test.durationMinutes,
          totalMarks: data.test.totalMarks,
          passMarks: data.test.passMarks,
          questions: data.test.questions || [],
        });
      } catch (err) {
        console.log(err);
        toast.error("Failed to fetch certification test");
      }
    };

    if (testId && isEducator) fetchTest();
  }, [testId, isEducator]);

  const handleQuestionChange = (index, field, value, optIndex) => {
    const updated = [...form.questions];
    const q = updated[index];

    if (field === "option") {
      q.options[optIndex] = value;
      if (q.correctAnswer === q.options[optIndex]) {
        q.correctAnswer = value;
      }
    } else {
      q[field] = value;
    }

    updated[index] = q;
    setForm((prev) => ({ ...prev, questions: updated }));
  };

  const handleAddQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        { question: "", options: ["", "", "", ""], correctAnswer: "" },
      ],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.courseId ||
      form.questions.some(
        (q) =>
          !q.question ||
          q.options.some((opt) => !opt) ||
          !q.correctAnswer
      )
    ) {
      return toast.error("Please complete all questions properly");
    }

    try {
      setLoading(true);
      const { data } = await axios.put(
        `${backendUrl}/api/educator/certification-test/${testId}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (data.success) {
        toast.success("Certification test updated!");
        navigate("/educator/certification-test");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to update test");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6">
      <div className="max-w-4xl bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Edit Certification Test</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={form.courseId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, courseId: e.target.value }))
            }
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
              value={form.durationMinutes}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  durationMinutes: Number(e.target.value),
                }))
              }
              className="p-2 border rounded"
              placeholder="Duration (minutes)"
            />
            <input
              type="number"
              value={form.totalMarks}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  totalMarks: Number(e.target.value),
                }))
              }
              className="p-2 border rounded"
              placeholder="Total Marks"
            />
            <input
              type="number"
              value={form.passMarks}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  passMarks: Number(e.target.value),
                }))
              }
              className="p-2 border rounded"
              placeholder="Passing Marks"
            />
          </div>

          {form.questions.map((q, i) => (
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
            {loading ? "Updating..." : "Update Certification Test"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditCertificationTest;
