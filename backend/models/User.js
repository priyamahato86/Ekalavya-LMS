//import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//     _id: { type: String, required: true },
//     name: { type: String, required: true },
//     email: { type: String, required: true },
//     imageUrl: { type: String, required: true },
//     enrolledCourses: [
//         {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Course'
//         }
//     ],
// }, { timestamps: true });

// const User = mongoose.model("User", userSchema);

// export default User

import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  imageUrl: { type: String, default: "" },
  role: { type: String, enum: ['student', 'educator'], default: 'student' },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);
export default User;
