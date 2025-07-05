import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";
import { Pencil, Trash2 } from "lucide-react";

const MyCourses = () => {
  const { backendUrl, isEducator, currency, navigate } = useContext(AppContext);

  const [courses, setCourses] = useState(null);

  const fetchEducatorCourses = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(backendUrl + "/api/educator/course", {
        headers: { Authorization: `Bearer ${token}` },
      });

      data.success && setCourses(data.courses);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleMakeLive = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${backendUrl}/api/educator/publish-course/${courseId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Course is now live");
        fetchEducatorCourses();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (courseId) => {
  if (!window.confirm("Are you sure you want to delete this course?")) return;
  try {
    const token = localStorage.getItem("token");
    const { data } = await axios.delete(
      `${backendUrl}/api/educator/delete-course/${courseId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (data.success) {
      toast.success("Course deleted");
      fetchEducatorCourses();
    } else {
      toast.error(data.message);
    }
  } catch (err) {
    toast.error(err.message);
  }
};


  useEffect(() => {
    if (isEducator) {
      fetchEducatorCourses();
    }
  }, [isEducator]);

  return courses ? (
    <div className="h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 ">
      <div className="w-full">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-medium">Courses</h2>
          <button
            onClick={() => navigate("/educator/course/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            + Add Course
          </button>
        </div>
        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="md:table-auto table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">
                  All Courses
                </th>
                <th className="px-4 py-3 font-semibold truncate">Earnings</th>
                <th className="px-4 py-3 font-semibold truncate">Students</th>
                <th className="px-4 py-3 font-semibold truncate">
                  Published On
                </th>
                <th className="px-4 py-3 font-semibold truncate">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {courses.map((course) => (
                <tr key={course._id} className="border-b border-gray-500/20">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                    <img
                      src={course.courseThumbnail}
                      alt="Course Image"
                      className="w-16"
                    />
                    <span className="truncate hidden md:block">
                      {course.courseTitle}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {currency}{" "}
                    {Math.floor(
                      course.enrolledStudents.length *
                        (course.coursePrice -
                          (course.discount * course.coursePrice) / 100)
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {course.enrolledStudents.length}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {!course.isPublished ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleMakeLive(course._id)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs"
                        >
                          Make it Live
                        </button>
                        <button
                          onClick={() => navigate(`/educator/course/edit/${course._id}`)}
                          className="text-yellow-500 hover:text-yellow-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(course._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs">
                        Live
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default MyCourses;
