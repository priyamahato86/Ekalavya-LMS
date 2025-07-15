import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";

const ReviewAssignment = () => {
  const { submissionId } = useParams();
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/educator/assignment-submissions/${submissionId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setSubmission(data.submission);
        setGrade(data.submission.grade || "");
        setFeedback(data.submission.feedback || "");
      } catch (err) {
        toast.error("Failed to fetch submission", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [backendUrl, submissionId]);

  const handleSubmit = async () => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/educator/assignment-submissions/${submissionId}/review-grade`,
        { grade, feedback },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (data.success) {
        toast.success("Reviewed successfully");
        navigate("/educator/submitted-assignments");
      } else {
        toast.error(data.message || "Review failed");
      }
    } catch (err) {
      toast.error("Error reviewing assignment", err.message);
    }
  };

  if (loading) return <Loading />;
  if (!submission) return <div className="p-8">Submission not found.</div>;

  return (
    <div className="w-full max-w-full sm:max-w-3xl mx-auto mt-8 p-4 sm:p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 sm:px-6 sm:py-4 rounded-t-lg">
        <h2 className="text-lg sm:text-2xl font-semibold text-white">
          Review Assignment
        </h2>
      </div>

      {/* Details Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {[
          ["Student", submission.studentName || submission.studentId],
          ["Course", submission.courseTitle],
          ["Chapter", submission.chapterTitle],
          ["Assignment", submission.assignmentTitle],
          ["Submitted At", new Date(submission.submittedAt).toLocaleString()],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-xs sm:text-sm text-gray-600">{label}</p>
            <p className="mt-1 text-sm sm:text-base font-medium text-gray-800">
              {value}
            </p>
          </div>
        ))}

        <div>
          <p className="text-xs sm:text-sm text-gray-600">File</p>
          <a
            href={submission.submissionFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-sm sm:text-base px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition"
          >
            View File
          </a>
        </div>
      </div>

      {/* Review Form */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Grade
          </label>
          <input
            type="text"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="e.g. 9/10"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2
                       focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Feedback
          </label>
          <textarea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Write feedback here..."
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2
                       focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <div className="text-center sm:text-right">
          <button
            onClick={handleSubmit}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2 
                       bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-md 
                       shadow hover:from-blue-700 hover:to-indigo-700 transition"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewAssignment;
