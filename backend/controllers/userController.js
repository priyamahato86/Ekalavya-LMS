import Course from "../models/Course.js";
import { CourseProgress } from "../models/CourseProgress.js";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";
import AssignmentSubmission from "../models/AssignmentSubmission.js";
import QuizSubmission from "../models/QuizSubmission.js";
import stripe from "stripe";

// Get User Data
export const getUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    // console.log(user);

    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Purchase Course
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;

    const userId = req.user.id;

    const courseData = await Course.findById(courseId);
    const userData = await User.findById(userId);

    if (!userData || !courseData) {
      return res.json({ success: false, message: "Data Not Found" });
    }

    const purchaseData = {
      courseId: courseData._id,
      userId,
      amount: (
        courseData.coursePrice -
        (courseData.discount * courseData.coursePrice) / 100
      ).toFixed(2),
    };

    const newPurchase = await Purchase.create(purchaseData);

    // Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const currency = process.env.CURRENCY.toLocaleLowerCase();

    // Creating line items to for Stripe
    const line_items = [
      {
        price_data: {
          currency,
          product_data: {
            name: courseData.courseTitle,
          },
          unit_amount: Math.floor(newPurchase.amount) * 100,
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}/`,
      line_items: line_items,
      mode: "payment",
      metadata: {
        purchaseId: newPurchase._id.toString(),
      },
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Users Enrolled Courses With Lecture Links
export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const userData = await User.findById(userId).populate("enrolledCourses");
    // console.log("Fetched enrolledCourses from DB:", userData.enrolledCourses);

    res.json({ success: true, enrolledCourses: userData.enrolledCourses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Update User Course Progress
export const updateUserCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const { courseId, lectureId } = req.body;

    const progressData = await CourseProgress.findOne({ userId, courseId });

    if (progressData) {
      if (progressData.lectureCompleted.includes(lectureId)) {
        return res.json({
          success: true,
          message: "Lecture Already Completed",
        });
      }

      progressData.lectureCompleted.push(lectureId);
      await progressData.save();
    } else {
      await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId],
      });
    }

    res.json({ success: true, message: "Progress Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// get User Course Progress
export const getUserCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const { courseId } = req.body;

    const progressData = await CourseProgress.findOne({ userId, courseId });

    res.json({ success: true, progressData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Add User Ratings to Course
export const addUserRating = async (req, res) => {
  const userId = req.user.id;
  const { courseId, rating } = req.body;

  // Validate inputs
  if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
    return res.json({ success: false, message: "InValid Details" });
  }

  try {
    // Find the course by ID
    const course = await Course.findById(courseId);

    if (!course) {
      return res.json({ success: false, message: "Course not found." });
    }

    const user = await User.findById(userId);

    if (!user || !user.enrolledCourses.includes(courseId)) {
      return res.json({
        success: false,
        message: "User has not purchased this course.",
      });
    }

    // Check is user already rated
    const existingRatingIndex = course.courseRatings.findIndex(
      (r) => r.userId === userId
    );

    if (existingRatingIndex > -1) {
      // Update the existing rating
      course.courseRatings[existingRatingIndex].rating = rating;
    } else {
      // Add a new rating
      course.courseRatings.push({ userId, rating });
    }

    await course.save();

    return res.json({ success: true, message: "Rating added" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const { courseId, assignmentId, assignmentTitle, submissionFileUrl } =
      req.body;

    if (!courseId || !assignmentId || !assignmentTitle || !submissionFileUrl) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    // Check if user is enrolled in the course
    if (!user.enrolledCourses.includes(courseId)) {
      return res.json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    // Optional: prevent duplicate submissions
    const existing = await AssignmentSubmission.findOne({
      studentId: userId,
      assignmentId,
    });

    if (existing) {
      return res.json({
        success: false,
        message: "You have already submitted this assignment",
      });
    }

    const submission = await AssignmentSubmission.create({
      studentId: userId,
      studentName: user.name,
      courseId,
      assignmentId,
      assignmentTitle,
      submissionFileUrl,
      submittedAt: new Date(),
    });

    res.json({ success: true, message: "Assignment submitted", submission });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET /api/user/my-submissions/:courseId
export const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const submissions = await AssignmentSubmission.find({
      studentId: userId,
      courseId,
    });

    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/user/delete-submission/:id
export const deleteSubmission = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const submission = await AssignmentSubmission.findById(id);

    if (!submission || submission.studentId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await AssignmentSubmission.findByIdAndDelete(id);
    res.json({ success: true, message: "Submission deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/user/edit-submission/:id
export const editSubmission = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { submissionFileUrl } = req.body;

    const submission = await AssignmentSubmission.findById(id);
    if (!submission || submission.studentId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    submission.submissionFileUrl = submissionFileUrl;
    await submission.save();

    res.json({ success: true, message: "Submission updated", submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, chapterId, selectedAnswers, score } = req.body;

    if (!courseId || !chapterId || !selectedAnswers || score === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Missing quiz data" });
    }

    const answersMap = new Map(Object.entries(selectedAnswers));

    const submission = await QuizSubmission.findOneAndUpdate(
      { userId, courseId, chapterId },
      { selectedAnswers: answersMap, score },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.json({ success: true, submission });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkQuizSubmission = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, chapterId } = req.params;

    const submission = await QuizSubmission.findOne({
      userId,
      courseId,
      chapterId,
    });

    if (submission) {
      res.json({ submitted: true, submission });
    } else {
      res.json({ submitted: false });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
