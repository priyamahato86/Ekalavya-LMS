

import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Pencil, Trash2 } from "lucide-react";
import Loading from "../../components/student/Loading";
import { AppContext } from "../../context/AppContext";

const CertificationTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const { backendUrl, isEducator, navigate } = useContext(AppContext);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/educator/certification-test`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTests(data.tests);
    } catch (err) {
      toast.error("Failed to fetch certification tests");
    } finally {
      setLoading(false);
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
      fetchTests();
    }
  }, [isEducator]);

  const handleDelete = async (testId) => {
    const confirm = window.confirm("Are you sure you want to delete this test?");
    if (!confirm) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/educator/certification-test/${testId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (data.success) {
        toast.success("Test deleted");
        fetchTests();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to delete test");
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <div className="h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 ">
      <div className="w-full">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-medium">Certification Tests</h2>
          <button
            onClick={() => navigate("/educator/certification-test/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            + Add Test
          </button>
        </div>

        <div className="flex flex-col items-center max-w-4xl w-full overflow-x-auto rounded-md bg-white border border-gray-500/20">
          <table className="min-w-[600px] table-auto w-full text-sm">
            <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">Course</th>
                <th className="px-4 py-3 font-semibold truncate">Duration</th>
                <th className="px-4 py-3 font-semibold truncate">Date</th>
                <th className="px-4 py-3 font-semibold truncate">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {tests.map((t) => (
                <tr key={t._id} className="border-b border-gray-500/20">
                  <td className="px-4 py-3 truncate">
                    {courses.find((c) => c._id === t.courseId)?.courseTitle || t.courseId}
                  </td>
                  <td className="px-4 py-3 truncate">{t.durationMinutes} mins</td>
                  <td className="px-4 py-3 truncate">
                    {new Date(t.updatedAt || new Date()).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 truncate">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/educator/certification-test/edit/${t._id}`)}
                        className="text-yellow-500 hover:text-yellow-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t._id)}
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

export default CertificationTests;




