// import { useContext, useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { AppContext } from "../../context/AppContext";
// import axios from "axios";
// import { toast } from "react-toastify";

// const CertificatePage = () => {
//   const { courseId } = useParams();
//   const { backendUrl, userData, enrolledCourses } = useContext(AppContext);
//   const [submission, setSubmission] = useState(null);
//   const [course, setCourse] = useState(null);

//   useEffect(() => {
//     async function fetchCert() {
//       try {
//         const token = localStorage.getItem("token");
//         const { data } = await axios.get(
//           `${backendUrl}/api/user/certification-test/last-submission/${courseId}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setSubmission(data.submission);
//         const c = enrolledCourses.find((c) => c._id === courseId);
//         setCourse(c);
//       } catch (err) {
//         console.error(err);
//         toast.error("Cannot load certificate data");
//       }
//     }
//     fetchCert();
//   }, [backendUrl, courseId, enrolledCourses]);

//   if (!submission || !course || !userData) {
//     return (
//       <div className="p-6 text-center">
//         <p className="text-lg">Loading certificate…</p>
//       </div>
//     );
//   }

//   const date = new Date(submission.attemptedAt).toLocaleDateString();

//   return (
//     <div>
//       {/* Inline print-CSS for this page */}
//       <style>
//         {`
//         @media print {
//           .no-print { display: none !important; }
//           body * { visibility: hidden; }
//           #certificate-content, #certificate-content * {
//             visibility: visible;
//           }
//           #certificate-content {
//             position: absolute;
//             left: 0; top: 0;
//             width: 100%;
//           }
//         }
//         `}
//       </style>

//       {/* PRINTABLE CERTIFICATE */}
//       <div
//         id="certificate-content"
//         className="min-h-screen bg-gray-100 flex items-center justify-center p-4"
//       >
//         <div className="bg-white w-full max-w-3xl p-8 rounded-lg shadow-lg border-4 border-yellow-400">
//           <h1 className=" text-center text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//             Certificate of Completion
//           </h1>

//           <p className="text-center text-xl mb-12">
//             This is to certify that
//           </p>

//           <h2 className="text-3xl font-semibold text-center mb-6 italic">
//             {userData.name}
//           </h2>

//           <p className="text-center text-xl mb-6">
//             has successfully completed the course
//           </p>

//           <h3 className="text-2xl font-medium text-center mb-12 ">
//             {course.courseTitle}
//           </h3>

//           <div className="flex justify-between px-4">
//             <div>
//               <p className="font-semibold">Date of Completion</p>
//               <p>{date}</p>
//             </div>
//             <div className="text-right">
//               <p className="font-semibold">Score</p>
//               <p>
//                 {submission.score}/{submission.totalMarks}
//               </p>
//             </div>
//           </div>

//           <p className="mt-12 text-gray-600 text-center text-sm">
//             Congratulations on your achievement!
//           </p>
//         </div>
//       </div>

//       {/* SCREEN-ONLY BUTTON (hidden in print) */}
//       <div className="no-print flex justify-center mt-6 mb-2">
//         <button
//           onClick={() => window.print()}
//           className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//         >
//           Print / Save as PDF
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CertificatePage;

// src/pages/student/CertificatePage.jsx
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { BookOpen, Award } from "lucide-react";
const CertificatePage = () => {
  const { courseId } = useParams();
  const { backendUrl, userData, enrolledCourses } = useContext(AppContext);
  const [submission, setSubmission] = useState(null);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    async function fetchCert() {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `${backendUrl}/api/user/certification-test/last-submission/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubmission(data.submission);
        const c = enrolledCourses.find((c) => c._id === courseId);
        setCourse(c);
      } catch (err) {
        console.error(err);
        toast.error("Cannot load certificate data");
      }
    }
    fetchCert();
  }, [backendUrl, courseId, enrolledCourses]);

  if (!submission || !course || !userData) {
    return (
      <div className="p-6 text-center">
        <p>Loading certificate…</p>
      </div>
    );
  }

  const date = new Date(submission.attemptedAt).toLocaleDateString();

  return (
    <div>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          #certificate-content, #certificate-content * {
            visibility: visible;
          }
          #certificate-content {
            position: absolute;
            left: 0; top: 0;
            width: 100%;
          }
        }
        /* Watermark background */
        #certificate-content {
          background-image: url('https://www.transparenttextures.com/patterns/white-paper.png');
          background-size: cover;
        }
      `}</style>

      <div
        id="certificate-content"
        className="min-h-screen flex items-center justify-center p-4"
      >
        <div className="relative bg-white w-full max-w-4xl p-10 rounded-lg shadow-2xl border-8 border-gray-300 overflow-hidden">
          {/* Faint watermark text */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <h1
              className="text-9xl font-bold text-gray-400"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              CERTIFIED
            </h1>
          </div>

          {/* Logo placeholder */}
          <div className="relative z-10 flex items-center justify-center mb-8">
            <BookOpen className="h-12 w-12 text-blue-600" />
            <span className="ml-2 text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ekalavya
            </span>
          </div>

          <div className="relative z-10 text-center">
            <h1
              className="text-5xl font-bold text-blue-600"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Certificate of Completion
            </h1>
            <div className="h-1 w-32 bg-blue-600 mx-auto my-4"></div>
          </div>

          <div className="relative z-10 mt-8 text-center">
            <p className="text-xl">This certifies that</p>
            <h2
              className="text-4xl font-semibold my-4"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {userData.name}
            </h2>
            <p className="text-xl">has successfully completed the course</p>
            <h3
              className="text-3xl italic my-4"
              style={{ fontFamily: "Great Vibes, cursive" }}
            >
              “{course.courseTitle}”
            </h3>
          </div>

          <div className="relative z-10 flex justify-between mt-8 px-8">
            <div className="text-left">
              <p className="uppercase text-sm text-gray-600">Date</p>
              <p className="text-lg">{date}</p>
            </div>
            <div className="text-right">
              <p className="uppercase text-sm text-gray-600">Score</p>
              <p className="text-lg">
                {submission.score}/{submission.totalMarks}
              </p>
            </div>
          </div>

          {/* Signature & seal */}
          <div className="relative z-10 mt-12 flex justify-between items-center px-8">
            <div className="text-center">
              <p className="mt-1 text-xl font-semibold italic">Priya Mahato</p>
              <div className="border-t border-gray-600 w-48 mx-auto"></div>

              <p className="text-sm text-gray-500">Instructor Signature</p>
            </div>
            <Award
              size={56}
              className="text-blue-600"
              title="Certificate Seal"
            />
          </div>

          {/* Screen-only */}
          <div className="no-print relative z-10 mt-10 text-center">
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Print / Save as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
