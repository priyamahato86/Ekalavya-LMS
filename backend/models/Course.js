
import mongoose from "mongoose";

//  Lecture Schema
const lectureSchema = new mongoose.Schema(
  {
    lectureId: { type: String, required: true },
    lectureTitle: { type: String, required: true },
    lectureDuration: { type: Number, required: true },
    lectureType: {
      type: String,
      enum: ["video", "document"],
      default: "video",
      required: true,
    },
    lectureUrl: {
      type: String,
      required: function () {
        return this.lectureType === "video";
      },
    },
    documentUrl: {
      type: String,
      required: function () {
        return this.lectureType === "document";
      },
    },

    isPreviewFree: { type: Boolean, required: true },
    lectureOrder: { type: Number, required: true },
  },
  { _id: false }
);

//  Assignment Schema
const assignmentSchema = new mongoose.Schema(
  {
    assignmentId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    resourceUrl: { type: String },
    dueDate: { type: Date },
  },
  { _id: false }
);

//  Quiz Question Schema
const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
  },
  { _id: false }
);

//  Chapter Schema
const chapterSchema = new mongoose.Schema(
  {
    chapterId: { type: String, required: true },
    chapterOrder: { type: Number, required: true },
    chapterTitle: { type: String, required: true },
    chapterContent: [lectureSchema],
    assignments: {
      type: [assignmentSchema],
      default: [], 
    },
    quiz: {
      quizType: {
        type: String,
        enum: ["manual", "ai"],
        default: "manual",
      },
      quizQuestions: {
        type: [quizQuestionSchema],
        default: [],
      },
    },
  },
  { _id: false, minimize: false }
);

//  Course Schema
const courseSchema = new mongoose.Schema(
  {
    courseTitle: { type: String, required: true },
    courseDescription: { type: String, required: true },
    courseThumbnail: { type: String },
    coursePrice: { type: Number, required: true },
    isPublished: { type: Boolean, default: false },
    discount: { type: Number, required: true, min: 0, max: 100 },
    courseContent: [chapterSchema],
    educator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseRatings: [
      {
        userId: { type: String },
        rating: { type: Number, min: 1, max: 5 },
      },
    ],
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true, minimize: false }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
