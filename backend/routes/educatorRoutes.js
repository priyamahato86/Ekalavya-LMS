import express from 'express'
import { addCourse, educatorDashboardData, getEducatorCourses, getEnrolledStudentsData, updateRoleToEducator } from '../controllers/educatorController.js';
import upload from '../configs/multer.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {requireEducator} from '../middlewares/requireEducator.js';


const educatorRouter = express.Router()

// Add Educator Role 
educatorRouter.get('/update-role',authMiddleware, updateRoleToEducator)

// Add Courses 
educatorRouter.post('/add-course', upload.single('image'), authMiddleware, requireEducator, addCourse)

// Get Educator Courses 
educatorRouter.get('/courses',authMiddleware, requireEducator, getEducatorCourses)

// Get Educator Dashboard Data
educatorRouter.get('/dashboard',authMiddleware, requireEducator, educatorDashboardData)

// Get Educator Students Data
educatorRouter.get('/enrolled-students', authMiddleware, requireEducator, getEnrolledStudentsData)


export default educatorRouter;