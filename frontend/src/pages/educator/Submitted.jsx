import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import { User } from "lucide-react";
const SubmittedAssignments = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const { backendUrl, isEducator, navigate } = useContext(AppContext);

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
                <th className="px-4 py-3 font-semibold">Chapter</th>
                <th className="px-4 py-3 font-semibold">Assignment</th>
                <th className="px-4 py-3 font-semibold truncate">
                  Submitted At
                </th>
                <th className="px-4 py-3 font-semibold truncate">Status</th>
                <th className="px-4 py-3 font-semibold truncate">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {submissions.map((s) => (
                <tr key={s._id} className="border-b border-gray-300">
                  <td className="md:px-4 px-2 py-3 flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="truncate">{s.studentName}</span>
                  </td>
                  <td className="px-4 py-3">{s.courseTitle}</td>
                  <td className="px-4 py-3">{s.chapterTitle}</td>
                  <td className="px-4 py-3">{s.assignmentTitle}</td>
                  <td className="px-4 py-3">
                    {new Date(s.submittedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
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
                    {!s.reviewed ? (
                      <button
                        onClick={() =>
                          navigate(`/educator/review-assignment/${s._id}`)
                        }
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Review
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-gray-300 text-gray-700 px-3 py-1 rounded"
                      >
                        Reviewed
                      </button>
                    )}
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

export default SubmittedAssignments;
