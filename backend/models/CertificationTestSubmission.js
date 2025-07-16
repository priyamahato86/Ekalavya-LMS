import mongoose from "mongoose";

const CertificationTestSubmissionSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "CertificationTest", required: true },
  answers: [
    {
      question: String,
      selectedAnswer: String,
      correctAnswer: String,
      isCorrect: Boolean,
    },
  ],
  score: Number,
  totalMarks: Number,
  passed: Boolean,
  attemptedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("CertificationTestSubmission", CertificationTestSubmissionSchema);
