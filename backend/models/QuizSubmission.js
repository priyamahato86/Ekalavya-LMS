import mongoose from "mongoose";

const quizSubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
 courseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Course",
  },
  chapterId: {
    type: String,
    required: true,
  },

  selectedAnswers: {
    type: Map,
    of: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
},
{
  timestamps: true 
}
);

export default mongoose.model("QuizSubmission", quizSubmissionSchema);
