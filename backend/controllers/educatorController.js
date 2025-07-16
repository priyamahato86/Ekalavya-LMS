import { v2 as cloudinary } from 'cloudinary'
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js';
import AssignmentSubmission from "../models/AssignmentSubmission.js";
import CertificationTest from '../models/CertificationTest.js';
import mongoose from 'mongoose';
import axios from 'axios';

export const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req.user.id; 
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.role = 'educator';
    await user.save();

    res.json({ success: true, message: 'You can publish a course now' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}


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

        const imageUpload = await cloudinary.uploader.upload(imageFile.path);

        parsedCourseData.educator = educatorId;
        parsedCourseData.courseThumbnail = imageUpload.secure_url;
        console.log(' Final Course:', JSON.stringify(parsedCourseData, null, 2));
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


// Update or Delete a Quiz 
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

export const getEducatorCourses = async (req, res) => {
    try {

        const educator = req.user.id;

        const courses = await Course.find({ educator })

        res.json({ success: true, courses })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Educator Dashboard Data 
export const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.user.id;

        const courses = await Course.find({ educator });

        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        });

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
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

export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.user.id;

        const courses = await Course.find({ educator });

        const courseIds = courses.map(course => course._id);

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

export const generateQuizWithAI = async (req, res) => {
  const { courseId, chapterId, difficulty = "medium", numQuestions = 5 } = req.body;

  try {
    const course = await Course.findById(courseId);
    const chapter = course?.courseContent.find(ch => ch.chapterId === chapterId);

    if (!course || !chapter) {
      return res.status(400).json({ success: false, message: "Invalid course or chapter ID" });
    }

    const prompt = `Generate a quiz for the course '${course.courseTitle}', module '${chapter.chapterTitle}', difficulty level '${difficulty}',number of questions ${numQuestions}. The quiz should be in the format: [{"question": "string", "options": ["string1", "string2", "string3", "string4"], "answer": number}] where the answer is the index of the correct option (0-based).`;

    const data = JSON.stringify({
      system_instruction: {
        parts: [
          {
            text:
              "You are a quiz generation AI. Your task is to create a quiz consisting  exactly ${numQuestions} quiz questions based on the provided course name and module name. " +
              "Optionally, you may also receive a difficulty level. Each question should be formatted as follows: " +
              "[{\"question\": \"string\", \"options\": [\"string1\", \"string2\", \"string3\", \"string4\"], \"answer\": number}]. " +
              "The answer key is index of the correct option (0-based)"
          }
        ]
      },
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              question: { type: "STRING" },
              options: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              answer: { type: "NUMBER" }
            },
            propertyOrdering: ["question", "options", "answer"]
          }
        }
      }
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      headers: {
        'x-goog-api-key': process.env.GEMINI_API_KEY,
        'Content-Type': 'application/json'
      },
      data: data
    };

    const response = await axios.request(config);
    const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    let quizData;
    try {
      quizData = JSON.parse(raw);
    } catch (err) {
      return res.status(500).json({ success: false, message: "Invalid JSON returned by AI" });
    }

    const quizQuestions = quizData.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.options[q.answer]
    }));

    return res.json({ success: true, quizQuestions });
  } catch (err) {
    console.error("AI quiz generation failed:", err);
    res.status(500).json({ success: false, message: "AI quiz generation failed" });
  }
};


export const getAssignmentSubmissions = async (req, res) => {
  try {
    const educatorId = req.user.id;
    const courses    = await Course.find({ educator: educatorId });
    const courseMap  = Object.fromEntries(
      courses.map(c => [c._id.toString(), c])
    );

    const submissions = await AssignmentSubmission.find({
      courseId: { $in: Object.keys(courseMap) },
    }).sort({ submittedAt: -1 });

    const studentIds = submissions.map(s => s.studentId.toString());
    const students   = await User.find({ _id: { $in: studentIds } });
    const studentMap = Object.fromEntries(
      students.map(u => [u._id.toString(), u.name])
    );

    const enriched = submissions.map(s => {
      const course  = courseMap[s.courseId.toString()];
      if (!course) {
        return {
          ...s.toObject(),
          studentName: studentMap[s.studentId.toString()] || "Unknown",
          courseTitle: "Unknown Course",
          chapterTitle: "Unknown Chapter",
          assignmentTitle: "Unknown Assignment",
        };
      }

      const chapId   = s.chapterId  ? s.chapterId.toString()  : null;
      const assignId = s.assignmentId ? s.assignmentId.toString() : null;
      let chapter = chapId
        ? course.courseContent.find(ch => ch.chapterId === chapId)
        : null;

      if (!chapter && assignId) {
        chapter = course.courseContent.find(ch =>
          Array.isArray(ch.assignments) &&
          ch.assignments.some(a => a.assignmentId === assignId)
        );
      }
      const assignment = chapter?.assignments.find(
        a => a.assignmentId === assignId
      );

      return {
        ...s.toObject(),
        studentName:     studentMap[s.studentId.toString()] || "Unknown",
        courseTitle:     course.courseTitle || "Unknown Course",
        chapterTitle:    chapter?.chapterTitle      || "Unknown Chapter",
        assignmentTitle:
          assignment?.title   ||  
          s.assignmentTitle   ||  
          "Unknown Assignment",
      };
    });

    return res.json({ success: true, submissions: enriched });
  }
  catch (error) {
    console.error("Error in getAssignmentSubmissions:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching submissions" });
  }
};

export const getSingleAssignmentSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await AssignmentSubmission.findById(submissionId);
    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }

    const course  = await Course.findById(submission.courseId).lean();
    const student = await User.findById(submission.studentId).lean();
    const chapId   = submission.chapterId   ? submission.chapterId.toString()   : null;
    const assignId = submission.assignmentId ? submission.assignmentId.toString() : null;
    let chapter = chapId
      ? course.courseContent.find(ch => ch.chapterId === chapId)
      : null;
    if (!chapter && assignId) {
      chapter = course.courseContent.find(ch =>
        Array.isArray(ch.assignments) &&
        ch.assignments.some(a => a.assignmentId === assignId)
      );
    }

    const assignment = chapter?.assignments.find(
      a => a.assignmentId === assignId
    );

    const enriched = {
      ...submission.toObject(),  
      studentName:     student?.name           || "Unknown Student",
      courseTitle:     course?.courseTitle     || "Unknown Course",
      chapterTitle:    chapter?.chapterTitle   || "Unknown Chapter",
      assignmentTitle:
        assignment?.title      ||  
        submission.assignmentTitle ||  
        "Unknown Assignment",
    };

    return res.json({ success: true, submission: enriched });
  }
  catch (err) {
    console.error("Error in getSingleAssignmentSubmission:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};


export const reviewAndGradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    const updatedSubmission = await AssignmentSubmission.findByIdAndUpdate(
      submissionId,
      {
        reviewed: true,
        grade,
        feedback,
      },
      { new: true }
    );

    if (!updatedSubmission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    res.json({
      success: true,
      message: "Submission reviewed and graded",
      updatedSubmission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addCertificationTest = async (req, res) => {
  try {
    const {
      courseId,
      durationMinutes,
      totalMarks,
      passMarks,
      questions,
      generatedByAI,
    } = req.body;

    if (!courseId || !durationMinutes || !totalMarks || !passMarks || !questions || questions.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newTest = await CertificationTest.create({
      courseId,
      educatorId: req.user.id,
      durationMinutes,
      totalMarks,
      passMarks,
      questions,
      generatedByAI: generatedByAI || false,
    });

    res.status(201).json({ success: true, test: newTest });
  } catch (err) {
    console.error("Error creating test:", err);
    res.status(500).json({ message: "Failed to create certification test" });
  }
};
// GET all tests for educator
export const getCertificationTests = async (req, res) => {
  try {
    const educatorId = req.user?.id;

    if (!educatorId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const tests = await CertificationTest.find({ educatorId });

    res.status(200).json({ success: true, tests });
  } catch (err) {
    console.error("Error in getCertificationTests:", err);
    res.status(500).json({ success: false, message: "Failed to fetch certification tests" });
  }
};


// GET a single certification test by ID
export const getCertificationTest = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await CertificationTest.findOne({
      _id: testId,
      educatorId: req.user.id,
    });

    if (!test)
      return res.status(404).json({ success: false, message: "Test not found" });

    return res.json({ success: true, test });
  } catch (error) {
    console.error("Error in getCertificationTest:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT or DELETE controller for updating/deleting a certification test
export const certificationTestController = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await CertificationTest.findOne({
      _id: testId,
      educatorId: req.user.id,
    });

    if (!test)
      return res.status(404).json({ success: false, message: "Test not found" });

    // DELETE
    if (req.method === "DELETE") {
      await CertificationTest.deleteOne({ _id: testId });
      return res.json({ success: true, message: "Test deleted successfully" });
    }

    // UPDATE
    if (req.method === "PUT") {
      const {
        courseId,
        durationMinutes,
        totalMarks,
        passMarks,
        questions,
        generatedByAI,
      } = req.body;

      test.courseId = courseId || test.courseId;
      test.durationMinutes = durationMinutes ?? test.durationMinutes;
      test.totalMarks = totalMarks ?? test.totalMarks;
      test.passMarks = passMarks ?? test.passMarks;
      test.questions = questions || test.questions;
      test.generatedByAI = generatedByAI ?? test.generatedByAI;
      test.updatedAt = new Date();

      await test.save();

      return res.json({ success: true, message: "Test updated successfully", test });
    }

    res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error) {
    console.error("Error in certificationTestController:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateCertificationTestWithAI = async (req, res) => {
  const { courseId } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const allChapters = course.courseContent.map(ch => ch.chapterTitle).join(", ");

    const prompt = `Generate a certification test for the course titled '${course.courseTitle}' covering the following chapters: ${allChapters}. 
    The test should contain exactly 5 questions with a mix of medium and hard difficulty. 
    Each question must be in the format:
    [{"question": "string", "options": ["string1", "string2", "string3", "string4"], "answer": number}] 
    where 'answer' is the 0-based index of the correct option. Ensure all questions are relevant to the topics.`

    const data = JSON.stringify({
      system_instruction: {
        parts: [
          {
            text:
              "You are a quiz generation AI. Your task is to create a 30-question certification test for the given course name and list of chapters. " +
              "Each question should be in JSON format: " +
              `[{"question": "string", "options": ["string1", "string2", "string3", "string4"], "answer": number}]. ` +
              "Ensure a mix of medium and hard difficulty, avoid repetition, and cover all topics fairly."
          }
        ]
      },
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              question: { type: "STRING" },
              options: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              answer: { type: "NUMBER" }
            },
            propertyOrdering: ["question", "options", "answer"]
          }
        }
      }
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      headers: {
        'x-goog-api-key': process.env.GEMINI_API_KEY,
        'Content-Type': 'application/json'
      },
      data: data
    };

    const response = await axios.request(config);
    const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    let quizData;
    try {
      quizData = JSON.parse(raw);
    } catch (err) {
      return res.status(500).json({ success: false, message: "Invalid JSON returned by AI" });
    }

    const questions = quizData.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.options[q.answer]
    }));

    return res.json({ success: true, questions });
  } catch (err) {
    console.error("AI certification test generation failed:", err);
    res.status(500).json({ success: false, message: "AI certification test generation failed" });
  }
};
