
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye, CheckCircle } from "lucide-react";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";

const SubmittedAssignments = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const { backendUrl, isEducator,  } = useContext(AppContext);

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

  const markAsReviewed = async (submissionId) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/educator/assignment-submissions/${submissionId}/review`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (data.success) {
        toast.success("Marked as reviewed");
        fetchSubmissions();
      }
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
                <th className="px-4 py-3 font-semibold truncate">Chapter</th>
                <th className="px-4 py-3 font-semibold truncate">Title</th>
                <th className="px-4 py-3 font-semibold truncate">Submitted At</th>
                <th className="px-4 py-3 font-semibold truncate">Status</th>
                <th className="px-4 py-3 font-semibold truncate">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {submissions.map((s) => {
                const course = courses.find((c) => c._id === s.courseId);
                const chapter = course?.courseContent.find((ch) => ch.chapterId === s.chapterId);

                return (
                  <tr key={s._id} className="border-b border-gray-500/20">
                    <td className="px-4 py-3 truncate">{s.studentName || s.studentId}</td>
                    <td className="px-4 py-3 truncate">{course?.courseTitle || s.courseId}</td>
                    <td className="px-4 py-3 truncate">{chapter?.chapterTitle || s.chapterId}</td>
                    <td className="px-4 py-3 truncate">{s.assignmentTitle}</td>
                    <td className="px-4 py-3 truncate">{new Date(s.submittedAt).toLocaleString()}</td>
                    <td className="px-4 py-3 truncate">
                      {s.reviewed ? (
                        <span className="text-green-600 font-medium">Reviewed</span>
                      ) : (
                        <span className="text-yellow-600 font-medium">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => window.open(s.submissionFileUrl, "_blank")}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!s.reviewed && (
                          <button
                            onClick={() => markAsReviewed(s._id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
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

