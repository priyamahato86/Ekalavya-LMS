// import { useContext, useEffect, useState } from 'react';
// import { AppContext } from '../../context/AppContext';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import Loading from '../../components/student/Loading';

// const AddAssignments = () => {
//   const { backendUrl, isEducator } = useContext(AppContext);

//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [assignmentsLoading, setAssignmentsLoading] = useState(true);


//   const [form, setForm] = useState({
//     title: '',
//     totalMarks: '',
//     courseTitle: '',
//   });

//   const fetchEducatorAssignments = async () => {
//     setAssignmentsLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const { data } = await axios.get(`${backendUrl}/api/educator/add-assignments`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (data.success) {
//         setAssignments(data.assignments);
//       } else {
//         toast.error('Failed to fetch assignments');
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }finally {
//     setAssignmentsLoading(false);
//   }
//   };

//   const handleInputChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!form.title || !form.totalMarks || !form.courseTitle) {
//       toast.error('Please fill all fields');
//       return;
//     }

//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       const { data } = await axios.post(
//         `${backendUrl}/api/educator/add-assignments`,
//         form,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (data.success) {
//         toast.success('Assignment created');
//         setForm({ title: '', totalMarks: '', courseTitle: '' });
//         fetchEducatorAssignments();
//       } else {
//         toast.error('Failed to create assignment');
//       }
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       const token = localStorage.getItem('token');
//       const { data } = await axios.delete(`${backendUrl}/api/educator/add-assignments/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (data.success) {
//         toast.success('Assignment deleted');
//         fetchEducatorAssignments();
//       } else {
//         toast.error('Delete failed');
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   useEffect(() => {
//     if (isEducator) {
//       fetchEducatorAssignments();
//     }
//   }, [isEducator]);

//   return (
//     <div className="min-h-screen flex flex-col md:p-8 p-4 pt-8 pb-0 gap-6">
//       {/* Form to add assignment */}
//       <div className="max-w-4xl w-full bg-white p-6 rounded-lg shadow border">
//         <h2 className="text-xl font-semibold mb-4">Add New Assignment</h2>
//         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <input
//             type="text"
//             name="title"
//             value={form.title}
//             onChange={handleInputChange}
//             placeholder="Assignment Title"
//             className="p-2 border rounded-md"
//           />
//           <input
//             type="number"
//             name="totalMarks"
//             value={form.totalMarks}
//             onChange={handleInputChange}
//             placeholder="Total Marks"
//             className="p-2 border rounded-md"
//           />
//           <input
//             type="text"
//             name="courseTitle"
//             value={form.courseTitle}
//             onChange={handleInputChange}
//             placeholder="Course Title"
//             className="p-2 border rounded-md"
//           />
//           <button
//             type="submit"
//             disabled={loading}
//             className="col-span-1 md:col-span-3 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
//           >
//             {loading ? 'Creating...' : 'Create Assignment'}
//           </button>
//         </form>
//       </div>

//       {/* List of assignments */}
//       {assignmentsLoading ? (
//         <Loading />
//       ) :(
//         <div className="max-w-4xl w-full">
//           <h2 className="pb-4 text-lg font-medium">My Assignments</h2>
//           <div className="overflow-hidden rounded-md bg-white border border-gray-500/20">
//             <table className="table-auto w-full">
//               <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
//                 <tr>
//                   <th className="px-4 py-3 font-semibold">Course</th>
//                   <th className="px-4 py-3 font-semibold">Title</th>
//                   <th className="px-4 py-3 font-semibold">Marks</th>
//                   <th className="px-4 py-3 font-semibold">Date</th>
//                   <th className="px-4 py-3 font-semibold text-center">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="text-sm text-gray-500">
//                 {assignments.length > 0 ? (
//                     assignments.map((assignment) => (
//                   <tr key={assignment._id} className="border-b border-gray-500/20">
//                     <td className="px-4 py-3">{assignment.courseTitle}</td>
//                     <td className="px-4 py-3">{assignment.title}</td>
//                     <td className="px-4 py-3">{assignment.totalMarks}</td>
//                     <td className="px-4 py-3">
//                       {new Date(assignment.createdAt).toLocaleDateString()}
//                     </td>
//                     <td className="px-4 py-3 text-center">
//                       <button
//                         onClick={() => handleDelete(assignment._id)}
//                         className="text-red-500 hover:text-red-700 transition"
//                       >
//                         Delete
//                       </button>
//                       {/* Future: Add Edit Button here */}
//                     </td>
//                   </tr>
//                 ))
//             ) :(
//                  <tr>
//       <td colSpan="5" className="text-center py-4 text-gray-400">No assignments yet.</td>
//     </tr>
//             )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AddAssignments;
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddAssignments = () => {
  const { backendUrl, isEducator } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
   const [editingAssignmentId, setEditingAssignmentId] = useState(null);

  const [form, setForm] = useState({
    courseId: '',
    chapterId: '',
    title: '',
    description: '',
    resourceUrl: '',
    dueDate: ''
  });

  useEffect(() => {
    if (isEducator) {
      axios.get(`${backendUrl}/api/educator/course`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        .then(res => setCourses(res.data.courses))
        .catch(err => toast.error(err.message));
    }
  }, [isEducator]);

  useEffect(() => {
    const course = courses.find(c => c._id === form.courseId);
    setChapters(course?.courseContent || []);
  }, [form.courseId, courses]);

  const fetchAssignments = async () => {
    setAssignmentsLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/educator/assignment`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setAssignments(data.assignments);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  useEffect(() => { if (isEducator) fetchAssignments(); }, [isEducator]);

  const handleSubmit = async e => {
    e.preventDefault();
    const { courseId, chapterId, title } = form;
    if (!courseId || !chapterId || !title) return toast.error('Required fields missing');

 try {
      setLoading(true);
      const endpoint = editingAssignmentId
        ? `${backendUrl}/api/educator/edit-assignment/${editingAssignmentId}`
        : `${backendUrl}/api/educator/add-assignments`;
      const method = editingAssignmentId ? 'put' : 'post';

      const { data } = await axios[method](endpoint, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (data.success) {
        toast.success(editingAssignmentId ? 'Assignment updated' : 'Assignment added');
        setForm({
          courseId: '', chapterId: '', title: '', description: '', resourceUrl: '', dueDate: ''
        });
        setEditingAssignmentId(null);
        fetchAssignments();
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6">
      <div className="max-w-4xl bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">{editingAssignmentId ? 'Edit Assignment' : 'Add Assignment'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <select value={form.courseId} onChange={e => setForm(prev => ({ ...prev, courseId: e.target.value, chapterId: '' }))} className="p-2 border rounded flex-1">
              <option value="">Select Course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.courseTitle}</option>)}
            </select>
            <select value={form.chapterId} onChange={e => setForm(prev => ({ ...prev, chapterId: e.target.value }))} className="p-2 border rounded flex-1">
              <option value="">Select Chapter</option>
              {chapters.map(ch => <option key={ch.chapterId} value={ch.chapterId}>{ch.chapterTitle}</option>)}
            </select>
          </div>
          <input type="text" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Assignment Title" className="p-2 border rounded w-full" />
          <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Description" className="p-2 border rounded w-full" />
          <input type="url" value={form.resourceUrl} onChange={e => setForm(prev => ({ ...prev, resourceUrl: e.target.value }))} placeholder="Resource URL (optional)" className="p-2 border rounded w-full" />
          <input type="date" value={form.dueDate} onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))} className="p-2 border rounded w-full" />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
            {loading ? 'Saving...' : (editingAssignmentId ? 'Update Assignment' : 'Create Assignment')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAssignments;
