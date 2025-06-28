//import { clerkClient } from "@clerk/express"

// Middleware ( Protect Educator Routes )
// export const protectEducator = async (req,res,next) => {

//     try {

//         const userId = req.auth.userId
        
//         const response = await clerkClient.users.getUser(userId)

//         if (response.publicMetadata.role !== 'educator') {
//             return res.json({success:false, message: 'Unauthorized Access'})
//         }
        
//         next ()

//     } catch (error) {
//         res.json({success:false, message: error.message})
//     }

// }

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async(req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.userDetails = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const protectStudent = (req, res, next) => {
  if (!req.user || req.user.role !== "student") {
    return res.status(403).json({ message: "Student access only" });
  }
  next();
};

//export default authMiddleware;
