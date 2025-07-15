// models/CertificationTest.js
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
});

const certificationTestSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  educatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  durationMinutes: { type: Number, default: 60 },
  totalMarks: { type: Number, required: true },
  passMarks: { type: Number, required: true },
  questions: [questionSchema],
  generatedByAI: { type: Boolean, default: false },
},
{ timestamps: true });

export default mongoose.model("CertificationTest", certificationTestSchema);
