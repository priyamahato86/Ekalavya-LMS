import { v2 as cloudinary } from 'cloudinary'
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
//import { clerkClient } from '@clerk/express'

// update role to educator
// export const updateRoleToEducator = async (req, res) => {

//     try {

//         const userId = req.user.id;

//         await clerkClient.users.updateUserMetadata(userId, {
//             publicMetadata: {
//                 role: 'educator',
//             },
//         })

//         res.json({ success: true, message: 'You can publish a course now' })

//     } catch (error) {
//         res.json({ success: false, message: error.message })
//     }

// }
export const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req.user.id; // updated
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.role = 'educator';
    await user.save();

    res.json({ success: true, message: 'You can publish a course now' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}


// Add New Course
// export const addCourse = async (req, res) => {

//     try {

//         const { courseData } = req.body

//         const imageFile = req.file

//         const educatorId = req.auth.userId

//         if (!imageFile) {
//             return res.json({ success: false, message: 'Thumbnail Not Attached' })
//         }

//         const parsedCourseData = await JSON.parse(courseData)

//         parsedCourseData.educator = educatorId

//         const newCourse = await Course.create(parsedCourseData)

//         const imageUpload = await cloudinary.uploader.upload(imageFile.path)

//         newCourse.courseThumbnail = imageUpload.secure_url

//         await newCourse.save()

//         res.json({ success: true, message: 'Course Added' })

//     } catch (error) {

//         res.json({ success: false, message: error.message })

//     }
// }
export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body;
        const imageFile = req.file;
        const educatorId = req.user.id;

        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail Not Attached' });
        }

        const parsedCourseData = JSON.parse(courseData);
       console.log(parsedCourseData)

        // Upload the thumbnail first
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);

        // Assign educator and thumbnail after parsing
        parsedCourseData.educator = educatorId;
        parsedCourseData.courseThumbnail = imageUpload.secure_url;
        console.log(' Final Course:', JSON.stringify(parsedCourseData, null, 2));
        // Now create course after all data is ready
        const newCourse = await Course.create(parsedCourseData);

        res.json({ success: true, message: 'Course Added', course: newCourse });

    } catch (error) {
        console.error('Error adding course:', error);
        res.json({ success: false, message: error.message });
    }
};

export const publishCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.courseId,
      { isPublished: true },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.json({ success: true, message: "Course is now live", course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSingleCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.courseId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, course: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const addAssignmentToChapter = async (req, res) => {
  try {
    const { courseId, chapterId, title, description, resourceUrl, dueDate } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const chapter = course.courseContent.find(ch => ch.chapterId === chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

    const newAssignment = {
      assignmentId: new mongoose.Types.ObjectId().toString(),
      title,
      description,
      resourceUrl,
      dueDate,
    };

    chapter.assignments.push(newAssignment);
    await course.save();

    res.json({ success: true, message: 'Assignment added', assignment: newAssignment });

  } catch (error) {
    console.error("Error in addAssignment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Assignments of Educator's Courses
export const getAllAssignments = async (req, res) => {
  try {
    const educatorId = req.user.id;
    const courses = await Course.find({ educator: educatorId });

    const assignments = [];

    courses.forEach(course => {
      course.courseContent.forEach(chapter => {
        if (chapter.assignments && chapter.assignments.length > 0) {
          chapter.assignments.forEach(assign => {
            assignments.push({
              assignmentId: assign.assignmentId,
              title: assign.title,
              description: assign.description,
              dueDate: assign.dueDate,
              resourceUrl: assign.resourceUrl,
              courseId: course._id.toString(),
              chapterId: chapter.chapterId
            });
          });
        }
      });
    });

    res.json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignmentController = async (req, res) => {
  try {
    const { courseId, chapterId, assignmentId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const chapter = course.courseContent.find(ch => ch.chapterId === chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

    const assignmentIndex = chapter.assignments.findIndex(a => a.assignmentId === assignmentId);
    if (assignmentIndex === -1) return res.status(404).json({ success: false, message: 'Assignment not found' });

    if (req.method === 'DELETE') {
      // Delete assignment
      chapter.assignments.splice(assignmentIndex, 1);
      await course.save();
      return res.json({ success: true, message: 'Assignment deleted successfully' });
    }

    if (req.method === 'PUT') {
      const { title, description, resourceUrl, dueDate } = req.body;

      const assignment = chapter.assignments[assignmentIndex];
      assignment.title = title || assignment.title;
      assignment.description = description || assignment.description;
      assignment.resourceUrl = resourceUrl || assignment.resourceUrl;
      assignment.dueDate = dueDate || assignment.dueDate;

      await course.save();

      return res.json({ success: true, message: 'Assignment updated successfully', assignment });
    }

    res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const addQuizToChapter = async (req, res) => {
  try {
    const { courseId, chapterId, quizType, quizQuestions } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const chapter = course.courseContent.find(ch => ch.chapterId === chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

    // Replace any existing quiz
    chapter.quiz = {
      quizType,
      quizQuestions: quizType === 'manual' ? quizQuestions : [],
    };

    await course.save();

    res.json({ success: true, message: 'Quiz added', quiz: chapter.quiz });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Get All Quizzes of Educator's Courses
export const getAllQuizzes = async (req, res) => {
  try {
    const educatorId = req.user.id;
    const courses = await Course.find({ educator: educatorId });

    const quizzes = [];

    courses.forEach(course => {
      course.courseContent.forEach(chapter => {
        if (chapter.quiz && chapter.quiz.quizType) {
          quizzes.push({
            courseId: course._id.toString(),
            chapterId: chapter.chapterId,
            quizType: chapter.quiz.quizType,
            quizQuestions: chapter.quiz.quizQuestions || []
          });
        }
      });
    });

    res.json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getQuizByCourseAndChapter = async (req, res) => {
  try {
    const { courseId, chapterId } = req.params;

    const course = await Course.findById(courseId);
    if (!course)
      return res.status(404).json({ success: false, message: "Course not found" });

    const chapter = course.courseContent.find((ch) => ch.chapterId === chapterId);
    if (!chapter)
      return res.status(404).json({ success: false, message: "Chapter not found" });

    if (!chapter.quiz)
      return res.status(404).json({ success: false, message: "Quiz not found" });

    return res.json({
      success: true,
      quiz: {
        courseId,
        chapterId,
        quizType: chapter.quiz.quizType,
        quizQuestions: chapter.quiz.quizQuestions || [],
      },
    });
  } catch (error) {
    console.error("Error in getQuizByCourseAndChapter:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Update or Delete a Quiz (Unified Controller)
export const quizController = async (req, res) => {
  try {
    const { courseId, chapterId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const chapter = course.courseContent.find(ch => ch.chapterId === chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

    if (req.method === 'DELETE') {
      if (!chapter.quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

      chapter.quiz = undefined;
      await course.save();
      return res.json({ success: true, message: 'Quiz deleted successfully' });
    }

    if (req.method === 'PUT') {
      const { quizQuestions, quizType } = req.body;
      chapter.quiz = {
        quizType: quizType || chapter.quiz?.quizType || 'manual',
        quizQuestions: quizQuestions || [],
        updatedAt: new Date()
      };
      await course.save();
      return res.json({ success: true, message: 'Quiz updated successfully', quiz: chapter.quiz });
    }

    res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// Get Educator Courses
export const getEducatorCourses = async (req, res) => {
    try {

        const educator = req.user.id;

        const courses = await Course.find({ educator })

        res.json({ success: true, courses })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Educator Dashboard Data ( Total Earning, Enrolled Students, No. of Courses)
export const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.user.id;

        const courses = await Course.find({ educator });

        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);

        // Calculate total earnings from purchases
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        });

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

        // Collect unique enrolled student IDs with their course titles
        const enrolledStudentsData = [];
        for (const course of courses) {
            const students = await User.find({
                _id: { $in: course.enrolledStudents }
            }, 'name imageUrl');

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }

        res.json({
            success: true,
            dashboardData: {
                totalEarnings,
                enrolledStudentsData,
                totalCourses
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.user.id;

        // Fetch all courses created by the educator
        const courses = await Course.find({ educator });

        // Get the list of course IDs
        const courseIds = courses.map(course => course._id);

        // Fetch purchases with user and course data
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle');

        // enrolled students data
        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }));

        res.json({
            success: true,
            enrolledStudents
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};
