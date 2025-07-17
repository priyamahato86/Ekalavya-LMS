
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { Line } from "rc-progress";
import Footer from "../../components/student/Footer";
import { toast } from "react-toastify";

const MyEnrollments = () => {
  const {
    userData,
    enrolledCourses,
    fetchUserEnrolledCourses,
    navigate,
    backendUrl,
    calculateCourseDuration,
    calculateNoOfLectures,
  } = useContext(AppContext);

  const [progressArray, setProgressData] = useState([]);
  const [certificationStatuses, setCertificationStatuses] = useState({});

  // load progress
  const getCourseProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      const tempProgress = await Promise.all(
        enrolledCourses.map(async (course) => {
          const { data } = await axios.post(
            `${backendUrl}/api/user/get-course-progress`,
            { courseId: course._id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const totalLectures = calculateNoOfLectures(course);
          const lectureCompleted = data.progressData
            ? data.progressData.lectureCompleted.length
            : 0;
          return { totalLectures, lectureCompleted };
        })
      );
      setProgressData(tempProgress);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // load certification status
  const fetchCertificationStatuses = async () => {
    const token = localStorage.getItem("token");
    const statusData = {};
    await Promise.all(
      enrolledCourses.map(async (course) => {
        try {
          const res = await axios.get(
            `${backendUrl}/api/user/certification-status/${course._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          statusData[course._id] = res.data.hasPassed;
        } catch {
          statusData[course._id] = false;
        }
      })
    );
    setCertificationStatuses(statusData);
  };

  // initial fetch
  useEffect(() => {
    if (userData) fetchUserEnrolledCourses();
  }, [userData]);

  useEffect(() => {
    if (enrolledCourses.length) {
      getCourseProgress();
      fetchCertificationStatuses();
    }
  }, [enrolledCourses]);

  return (
    <>
      <div className="md:px-36 px-8 pt-10 pb-24">
        <h1 className="text-2xl font-semibold">My Enrollments</h1>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto mt-6">
          <table className="table-auto w-full border mt-4">
            <thead className="text-gray-900 border-b border-gray-300 text-sm text-left">
              <tr>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Certification</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {enrolledCourses.map((course, i) => {
                const prog = progressArray[i] || {
                  totalLectures: 0,
                  lectureCompleted: 0,
                };
                const percent =
                  prog.totalLectures > 0
                    ? (prog.lectureCompleted / prog.totalLectures) * 100
                    : 0;
                const passed = certificationStatuses[course._id];

                return (
                  <tr key={course._id} className="border-b border-gray-200">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img
                          src={course.courseThumbnail}
                          alt=""
                          className="w-16 h-16 rounded object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {course.courseTitle}
                          </p>
                          <div className="mt-1">
                            <Line
                              strokeWidth={2}
                              percent={percent}
                              className="bg-gray-200 rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {calculateCourseDuration(course)}
                    </td>
                    <td className="px-4 py-3">
                      {prog.lectureCompleted}/{prog.totalLectures} lectures
                    </td>
                    <td className="px-4 py-3 max-sm:hidden text-center">
                      <button
                        onClick={() => navigate(`/player/${course._id}`)}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded"
                      >
                        {prog.lectureCompleted === prog.totalLectures
                          ? "Completed"
                          : "On Going"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-2 space-y-2 sm:space-y-0">
                        <button
                          onClick={() =>
                            navigate(`/certification-test/${course._id}`)
                          }
                          className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          Take Test
                        </button>

                        {passed && (
                          <button
                            onClick={() =>
                              navigate(
                                `/certification/${course._id}/certificate`
                              )
                            }
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                            title="Download Certificate"
                          >
                            🎓 Certificate
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

        {/* Mobile Cards */}
        <div className="block md:hidden mt-6 space-y-4">
          {enrolledCourses.map((course, i) => {
            const prog = progressArray[i] || {
              totalLectures: 0,
              lectureCompleted: 0,
            };
            const percent =
              prog.totalLectures > 0
                ? (prog.lectureCompleted / prog.totalLectures) * 100
                : 0;
            const passed = certificationStatuses[course._id];

            return (
              <div
                key={course._id}
                className="bg-white rounded-lg shadow p-4 flex flex-col"
              >
                <div className="flex items-center">
                  <img
                    src={course.courseThumbnail}
                    alt=""
                    className="w-16 h-16 rounded object-cover flex-shrink-0"
                  />
                  <div className="ml-4 flex-1 overflow-hidden">
                    <h2 className="font-semibold text-lg truncate">
                      {course.courseTitle}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {calculateCourseDuration(course)}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <Line
                    strokeWidth={2}
                    percent={percent}
                    className="bg-gray-200 rounded-full"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    {prog.lectureCompleted}/{prog.totalLectures} lectures
                  </p>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                   <button
                        onClick={() => navigate(`/player/${course._id}`)}
                        className="w-full sm:w-auto px-4 py-2 text-sm bg-blue-600 text-white rounded text-center"
                      >
                        {prog.lectureCompleted === prog.totalLectures
                          ? "Completed"
                          : "On Going"}
                      </button>

                  <button
                    onClick={() =>
                      navigate(`/certification-test/${course._id}`)
                    }
                    className="w-full sm:w-auto px-4 py-2 text-sm bg-blue-600 text-white rounded text-center"
                  >
                    Take Test
                  </button>

                  {passed && (
                    <button
                      onClick={() =>
                        navigate(`/certification/${course._id}/certificate`)
                      }
                      className="w-full sm:w-auto px-4 py-2 text-sm bg-green-600 text-white rounded text-center hover:bg-green-700"
                    >
                      🎓 Certificate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyEnrollments;
