import jwt from "jsonwebtoken";
import User from "../models/User.js";
import mongoose from "mongoose";

export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ message: "Invalid user ID in token" });
    }
    req.user = await User.findById(decoded.id); 
    if (!req.user) return res.status(401).json({ message: "Invalid user" });
    next();
  } catch (err) {
    console.error("Auth Middleware Error: ", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const protectStudent = (req, res, next) => {
  if (!req.user || req.user.role !== "student") {
    return res.status(403).json({ message: "Student access only" });
  }
  next();
};

