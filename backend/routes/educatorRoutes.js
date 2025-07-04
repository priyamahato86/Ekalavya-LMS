import express from "express";
import {
  addCourse,
  educatorDashboardData,
  getEducatorCourses,
  getEnrolledStudentsData,
  addAssignmentToChapter,
  addQuizToChapter,
  updateRoleToEducator,
  getAllAssignments,
  getAllQuizzes,
  quizController,
  assignmentController,
  publishCourse,
  deleteCourse,
  updateCourse,
  getSingleCourse,
  getQuizByCourseAndChapter
} from "../controllers/educatorController.js";
import upload from "../configs/multer.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireEducator } from "../middlewares/requireEducator.js";

const educatorRouter = express.Router();
educatorRouter.use(authMiddleware);

// Add Educator Role
educatorRouter.get("/update-role", updateRoleToEducator);

// Add Courses
educatorRouter.post(
  "/course/add",
  upload.single("image"),
  requireEducator,
  addCourse
);
educatorRouter.get(
  "/course/:id",
  requireEducator,
  getSingleCourse
);
educatorRouter.put('/publish-course/:courseId', requireEducator, publishCourse);
educatorRouter.delete('/delete-course/:courseId', requireEducator, deleteCourse);
educatorRouter.put('/course/:id', requireEducator, updateCourse);


// Get Educator Courses
educatorRouter.get("/course", requireEducator, getEducatorCourses);

// Add Assignments
educatorRouter.post(
  "/assignment/add",
  requireEducator,
  addAssignmentToChapter
);
educatorRouter.get("/assignment", requireEducator, getAllAssignments);
educatorRouter
  .route("/assignment/:courseId/:chapterId/:assignmentId")
  .put(requireEducator, assignmentController)
  .delete(requireEducator, assignmentController);

// Add Quizz
educatorRouter.post("/quiz/add", requireEducator, addQuizToChapter);
educatorRouter.get("/quiz", requireEducator, getAllQuizzes);
educatorRouter.get(
  "/quiz/:courseId/:chapterId",
  requireEducator,
  getQuizByCourseAndChapter
);

educatorRouter
  .route("/quiz/:courseId/:chapterId")
  .put(requireEducator, quizController)
  .delete(requireEducator, quizController);



// Get Educator Dashboard Data
educatorRouter.get("/dashboard", requireEducator, educatorDashboardData);

// Get Educator Students Data
educatorRouter.get(
  "/enrolled-students",
  requireEducator,
  getEnrolledStudentsData
);

export default educatorRouter;
