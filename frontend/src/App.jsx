import { Routes, Route, useMatch } from "react-router-dom";
import Navbar from "./components/student/Navbar";
import Home from "./pages/student/Home";
import CourseDetails from "./pages/student/CourseDetails";
import CoursesList from "./pages/student/CoursesList";
import Dashboard from "./pages/educator/Dashboard";
import AddCourse from "./pages/educator/AddCourse";
import MyCourses from "./pages/educator/MyCourses";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled";
import Educator from "./pages/educator/Educator";
import "quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Player from "./pages/student/Player";
import MyEnrollments from "./pages/student/MyEnrollments";
import Loading from "./components/student/Loading";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import StudentRoute from "./components/ProtectedRoutes/StudentRoute";
import EducatorRoute from "./components/ProtectedRoutes/EducatorRoute";
import AddAssignments from "./pages/educator/AddAssignments";
import AddQuiz from "./pages/educator/AddQuiz";
import Quiz from "./pages/educator/Quiz";
import Assignments from "./pages/educator/Assignments";
import EditCourse from "./pages/educator/EditCourse";
import EditAssignment from "./pages/educator/EditAssignment";
import EditQuiz from "./pages/educator/EditQuiz";
import Submitted from "./pages/educator/Submitted";
import ReviewAssignment from "./pages/educator/ReviewAssignment";

const App = () => {
  const isEducatorRoute = useMatch("/educator/*");

  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer />
      {!isEducatorRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/course-list" element={<CoursesList />} />
        <Route path="/course-list/:input" element={<CoursesList />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        {/* <Route path="/my-enrollments" element={<MyEnrollments/>} /> */}
        <Route path="/player/:courseId" element={<Player />} />
        <Route path="/loading/:path" element={<Loading />} />
        {/* Protected student-only route */}
        <Route
          path="/my-enrollments"
          element={
            <StudentRoute>
              <MyEnrollments />
            </StudentRoute>
          }
        />

        {/* Protected educator-only routes */}
        <Route
          path="/educator"
          element={
            <EducatorRoute>
              <Educator />
            </EducatorRoute>
          }
        >
          {/* <Route path="/educator" element={<Educator/>} > */}
          <Route index element={<Dashboard />} />
          <Route path="course" element={<MyCourses />} />
          <Route path="course/add" element={<AddCourse />} />
          <Route path="assignment" element={<Assignments />} />
          <Route path="assignment/add" element={<AddAssignments />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="quiz/add" element={<AddQuiz />} />
          <Route path="quiz/edit/:courseId/:chapterId" element={<EditQuiz />} />

          <Route path="course/edit/:id" element={<EditCourse />} />
          <Route
            path="assignment/edit/:courseId/:chapterId/:assignmentId"
            element={<EditAssignment />}
          />

          <Route path="students-enrolled" element={<StudentsEnrolled />} />
          <Route path="submitted-assignments" element={<Submitted />} />
          <Route path="review-assignment/:submissionId" element={<ReviewAssignment />} />

        </Route>
      </Routes>
    </div>
  );
};

export default App;
