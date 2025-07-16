import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";

const CertificationTestPage = () => {
  const { courseId } = useParams();
  const { backendUrl } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);
  const [lastAttempt, setLastAttempt] = useState(null);
  const [retakeCountdown, setRetakeCountdown] = useState(null);

  const [testStarted, setTestStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);

  const formatHMS = (totSec) => {
    const h = Math.floor(totSec / 3600);
    const m = Math.floor((totSec % 3600) / 60);
    const s = totSec % 60;
    return [
      h.toString().padStart(2, "0"),
      m.toString().padStart(2, "0"),
      s.toString().padStart(2, "0"),
    ].join(":");
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${backendUrl}/api/user/certification-test/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTest(data.test);
      setLastAttempt(data.lastSubmission || null);
      setRetakeCountdown(
        typeof data.retakeSeconds === "number" ? data.retakeSeconds : null
      );

      if (data.test) {
        setAnswers(new Array(data.test.questions.length).fill(""));
        setTimeLeft(data.durationSecs || 3600);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load test");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  useEffect(() => {
    if (retakeCountdown == null) return;
    const id = setInterval(() => {
      setRetakeCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [retakeCountdown]);

  useEffect(() => {
    if (!testStarted || submitted) return;
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [testStarted, submitted]);

  useEffect(() => {
    const handler = (e) => {
      if (testStarted && !submitted) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [testStarted, submitted]);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${backendUrl}/api/user/certification-test/submit`,
        {
          courseId,
          testId: test._id,
          answers: test.questions.map((q, i) => ({
            question: q.question,
            selectedAnswer: answers[i],
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Test submitted");
      setSubmitted(true);
      setScore(data.score);
      setPassed(data.passed);

      await fetchData();
      setTestStarted(false);
    } catch (err) {
      console.error(err);
      toast.error("Submission failed");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!testStarted) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          {test?.courseTitle || "Certification Test"}
        </h1>

        {lastAttempt && (
          <div className="mb-4">
            <p>
              Last Attempt: {new Date(lastAttempt.attemptedAt).toLocaleString()}
            </p>
            <p>
              Score: {lastAttempt.score}/{lastAttempt.totalMarks} —{" "}
              <span
                className={
                  lastAttempt.passed
                    ? "text-green-600 font-bold"
                    : "text-red-600 font-bold"
                }
              >
                {lastAttempt.passed ? "Passed" : "Failed"}
              </span>
            </p>
          </div>
        )}

        <button
          onClick={() => setTestStarted(true)}
          disabled={retakeCountdown != null || !test}
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {retakeCountdown != null
            ? `Retake in ${formatHMS(retakeCountdown)}`
            : test
            ? "Start Test"
            : "No Test Available"}
        </button>
      </div>
    );
  }
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-center text-blue-600 mb-4">
        {test.courseTitle} Certification Test
      </h1>

      {!submitted && (
        <div className="text-right font-medium mb-4 text-red-600">
          Time Left: {formatHMS(timeLeft)}
        </div>
      )}

      {!submitted ? (
        <>
          <div className="mb-6">
            <p className="font-medium mb-2">
              {currentQuestion + 1}. {test.questions[currentQuestion].question}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {test.questions[currentQuestion].options.map((opt, idx) => (
                <label
                  key={idx}
                  className={`flex items-center gap-2 border p-2 rounded cursor-pointer ${
                    answers[currentQuestion] === opt
                      ? "border-blue-500 bg-blue-50"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={`q${currentQuestion}`}
                    value={opt}
                    checked={answers[currentQuestion] === opt}
                    onChange={() => {
                      const copy = [...answers];
                      copy[currentQuestion] = opt;
                      setAnswers(copy);
                    }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentQuestion((q) => Math.max(q - 1, 0))}
              disabled={currentQuestion === 0}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
            >
              Previous
            </button>

            {currentQuestion < test.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion((q) => q + 1)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Submit Test
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="text-center mt-8">
          <h2 className="text-xl font-semibold">
            Your Score: {score}/{test.totalMarks}
          </h2>
          <p
            className={`mt-2 font-semibold ${
              passed ? "text-green-600" : "text-red-600"
            }`}
          >
            {passed
              ? "✅ Assessment Cleared!"
              : "❌ Assessment Failed. Retake in 24 hours."}
          </p>
        </div>
      )}
    </div>
  );
};

export default CertificationTestPage;
