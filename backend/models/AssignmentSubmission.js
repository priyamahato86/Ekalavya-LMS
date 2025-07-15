
import mongoose from "mongoose";

const assignmentSubmissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  chapterId: { type: String, required: true },
  assignmentId: {
    type: String,
    required: true, 
  },
  assignmentTitle: {
    type: String,
    required: true,
  },
  submissionFileUrl: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  reviewed: {
    type: Boolean,
    default: false,
  },
  grade: {
    type: String,
    default: "",
  },
  feedback: {
    type: String,
    default: "",
  },
}, { timestamps: true });

export default mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);
