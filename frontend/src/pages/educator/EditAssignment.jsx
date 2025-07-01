import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

const EditAssignment = () => {
  const { backendUrl, isEducator } = useContext(AppContext);
  const navigate = useNavigate();
  const { courseId, chapterId, assignmentId } = useParams();

  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    courseId: "",
    chapterId: "",
    title: "",
    description: "",
    resourceUrl: "",
    dueDate: "",
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
    const course = courses.find((c) => c._id === form.courseId);
    setChapters(course?.courseContent || []);
  }, [form.courseId, courses]);

  // Prefill form using assignment info
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/educator/assignment`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const found = data.assignments.find(
          (a) =>
            a.assignmentId === assignmentId &&
            a.chapterId === chapterId &&
            a.courseId === courseId
        );

        if (!found) return toast.error("Assignment not found");

        setForm({
          courseId: found.courseId,
          chapterId: found.chapterId,
          title: found.title,
          description: found.description,
          resourceUrl: found.resourceUrl,
          dueDate: found.dueDate?.slice(0, 10),
        });
      } catch (err) {
        toast.error(err.message);
      }
    };

    if (isEducator) fetchAssignment();
  }, [isEducator, assignmentId, chapterId, courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, resourceUrl, dueDate } = form;
    if (!title || !form.courseId || !form.chapterId)
      return toast.error("All required fields must be filled.");

    try {
      setLoading(true);
      const { data } = await axios.put(
        `${backendUrl}/api/educator/assignment/${form.courseId}/${form.chapterId}/${assignmentId}`,
        { title, description, resourceUrl, dueDate },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (data.success) {
        toast.success("Assignment updated");
        navigate("/educator/assignment");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6">
      <div className="max-w-4xl bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Edit Assignment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <select
              value={form.courseId}
              disabled
              className="p-2 border rounded flex-1 bg-gray-100 cursor-not-allowed"
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
              disabled
              className="p-2 border rounded flex-1 bg-gray-100 cursor-not-allowed"
            >
              <option value="">Select Chapter</option>
              {chapters.map((ch) => (
                <option key={ch.chapterId} value={ch.chapterId}>
                  {ch.chapterTitle}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Assignment Title"
            className="p-2 border rounded w-full"
          />
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Description"
            className="p-2 border rounded w-full"
          />
          <input
            type="url"
            value={form.resourceUrl}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, resourceUrl: e.target.value }))
            }
            placeholder="Resource URL (optional)"
            className="p-2 border rounded w-full"
          />
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, dueDate: e.target.value }))
            }
            className="p-2 border rounded w-full"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            {loading ? "Updating..." : "Update Assignment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditAssignment;
