import Loading from "../../components/student/Loading";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Assignments = () => {
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const { backendUrl, isEducator, navigate } = useContext(AppContext);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [form, setForm] = useState({
    courseId: "",
    chapterId: "",
    title: "",
    description: "",
    resourceUrl: "",
    dueDate: "",
  });

  const fetchAssignments = async () => {
    setAssignmentsLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/educator/assignment`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setAssignments(data.assignments);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAssignmentsLoading(false);
    }
  };
  useEffect(() => {
    if (isEducator) fetchAssignments();
  }, [isEducator]);

  const handleDelete = async (courseId, chapterId, assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?"))
      return;
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/educator/assignment/${courseId}/${chapterId}/${assignmentId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (data.success) {
        toast.success("Assignment deleted");
        fetchAssignments();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (a) => {
    setForm(a);
    setEditingAssignmentId(a.assignmentId);
  };
  return assignmentsLoading ? (
    <Loading />
  ) : (
    <div className="h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 ">
      <div className="w-full">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-medium">Assignments</h2>
          <button
            onClick={() => navigate("/educator/assignment/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            + Add Assignment
          </button>
        </div>

        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="md:table-auto table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">Course</th>
                <th className="px-4 py-3 font-semibold truncate">Chapter</th>
                <th className="px-4 py-3 font-semibold truncate">Title</th>
                <th className="px-4 py-3 font-semibold truncate">Due Date</th>
                <th className="px-4 py-3 font-semibold truncate">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {assignments.map((a) => (
                <tr
                  key={a.assignmentId}
                  className="border-b border-gray-500/20"
                >
                  <td className="px-4 py-3 truncate">
                    {courses.find((c) => c._id === a.courseId)?.courseTitle ||
                      a.courseId}
                  </td>
                  <td className="px-4 py-3 truncate">
                    {chapters.find((ch) => ch.chapterId === a.chapterId)
                      ?.chapterTitle || a.chapterId}
                  </td>
                  <td className="px-4 py-3 truncate">{a.title}</td>
                  <td className="px-4 py-3 truncate">
                    {new Date(a.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 truncate space-x-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/educator/assignment/edit/${a.courseId}/${a.chapterId}/${a.assignmentId}`
                        )
                      }
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(a.courseId, a.chapterId, a.assignmentId)
                      }
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
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

export default Assignments;
