import express from "express";
import {
  addUserRating,
  getUserCourseProgress,
  getUserData,
  purchaseCourse,
  updateUserCourseProgress,
  userEnrolledCourses,
  submitAssignment,
  getUserSubmissions,
  deleteSubmission,
  editSubmission,
  submitQuiz,
  checkQuizSubmission,
  generateQuizFeedbackWithAI,
  getCertificationTestForStudent,
  submitCertificationTest,
  getLastCertificationSubmission,
  getCertificationStatus
} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const userRouter = express.Router();
userRouter.use(authMiddleware);

// Get user Data
userRouter.get("/data", getUserData);
userRouter.post("/purchase", purchaseCourse);
userRouter.get("/enrolled-courses", userEnrolledCourses);
userRouter.post("/update-course-progress", updateUserCourseProgress);
userRouter.post("/get-course-progress", getUserCourseProgress);
userRouter.post("/add-rating", addUserRating);
userRouter.post("/submit-assignment", submitAssignment);
userRouter.get("/my-submissions/:courseId", getUserSubmissions);
userRouter.delete("/delete-submission/:id", deleteSubmission);
userRouter.put("/edit-submission/:id", editSubmission);
userRouter.post("/submit-quiz", submitQuiz);
userRouter.get("/check-quiz-submission/:courseId/:chapterId", checkQuizSubmission);
userRouter.post("/generate-feedback", generateQuizFeedbackWithAI);
userRouter.get("/my-submissions/:courseId", getUserSubmissions);
userRouter.get("/certification-test/:courseId", getCertificationTestForStudent);
userRouter.post("/certification-test/submit", submitCertificationTest);
userRouter.get("/certification-test/last-submission/:courseId",  getLastCertificationSubmission);
userRouter.get('/certification-status/:courseId', getCertificationStatus);

export default userRouter;
