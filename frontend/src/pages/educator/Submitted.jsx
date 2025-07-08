import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye } from "lucide-react";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";

const SubmittedAssignments = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const { backendUrl, isEducator } = useContext(AppContext);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/educator/assignment-submissions`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSubmissions(data.submissions);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/educator/course`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCourses(data.courses);
    } catch (err) {
      toast.error(err.message);
    }
  };


  useEffect(() => {
    if (isEducator) {
      fetchSubmissions();
      fetchCourses();
    }
  }, [isEducator]);

  const saveGradeFeedback = async (submissionId, grade, feedback) => {
  try {
    const { data } = await axios.put(
      `${backendUrl}/api/educator/assignment-submissions/${submissionId}/review-grade`,
      { grade, feedback },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    if (data.success) {
      toast.success("Reviewed and graded successfully");
      fetchSubmissions();
    }
  } catch (err) {
    toast.error("Failed to review and grade submission", err.message);
  }
};


  return loading ? (
    <Loading />
  ) : (
    <div className="h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <div className="w-full">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-medium">Submitted Assignments</h2>
        </div>

        <div className="flex flex-col items-center max-w-6xl w-full overflow-x-auto rounded-md bg-white border border-gray-500/20">
          <table className="min-w-[800px] table-auto w-full text-sm">
            <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">Student</th>
                <th className="px-4 py-3 font-semibold truncate">Course</th>
                <th className="px-4 py-3 font-semibold truncate">Title</th>
                <th className="px-4 py-3 font-semibold truncate">
                  Submitted At
                </th>
                <th className="px-4 py-3 font-semibold truncate">Status</th>
                <th className="px-4 py-3 font-semibold truncate">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {submissions.map((s) => {
                const course = courses.find((c) => c._id === s.courseId);

                return (
                  <tr key={s._id} className="border-b border-gray-500/20">
                    <td className="px-4 py-3 truncate">
                      {s.studentName || s.studentId}
                    </td>
                    <td className="px-4 py-3 truncate">
                      {course?.courseTitle || s.courseId}
                    </td>
                    <td className="px-4 py-3 truncate">{s.assignmentTitle}</td>
                    <td className="px-4 py-3 truncate">
                      {new Date(s.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 truncate">
                      {s.reviewed ? (
                        <span className="text-green-600 font-medium">
                          Reviewed
                        </span>
                      ) : (
                        <span className="text-yellow-600 font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">

                        <button
                          onClick={() =>
                            window.open(s.submissionFileUrl, "_blank")
                          }
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        </div>

                      <div className="flex flex-col md:flex-row gap-2">

                      <input
                        type="text"
                        placeholder="Grade"
                        value={s.grade || ""}
                        onChange={(e) =>
                          setSubmissions((prev) =>
                            prev.map((sub) =>
                              sub._id === s._id
                                ? { ...sub, grade: e.target.value }
                                : sub
                            )
                          )
                        }
                        className="border px-2 py-1 rounded text-xs w-full md:w-24"
                      />
                      <textarea
                        rows={1}
                        placeholder="Feedback"
                        value={s.feedback || ""}
                        onChange={(e) =>
                          setSubmissions((prev) =>
                            prev.map((sub) =>
                              sub._id === s._id
                                ? { ...sub, feedback: e.target.value }
                                : sub
                            )
                          )
                        }
                        className="border px-2 py-1 rounded text-xs w-full md:w-48"
                      />
                      <button
                        onClick={async () =>
                          await saveGradeFeedback(s._id, s.grade, s.feedback)
                        }
                        className="text-sm text-white bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Save
                      </button>
                      </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubmittedAssignments;
