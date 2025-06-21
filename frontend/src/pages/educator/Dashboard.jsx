import  { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';

const Dashboard = () => {

  const { backendUrl, isEducator, currency, getToken } = useContext(AppContext)

  const [dashboardData, setDashboardData] = useState(null)

  const fetchDashboardData = async () => {
    try {

      const token = await getToken()

      const { data } = await axios.get(backendUrl + '/api/educator/dashboard',
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setDashboardData(data.dashboardData)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {

    if (isEducator) {
      fetchDashboardData()
    }

  }, [isEducator])



  return dashboardData ? (

 <div className="flex flex-col min-h-screen items-center justify-start gap-10 px-4 pt-10 md:px-8">
  <div className="w-full max-w-6xl space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      
      <div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-lg border border-blue-500 transition-transform hover:scale-105 duration-300">
        <img src={assets.patients_icon} alt="patient-icon" className="w-12 h-12 object-contain" />
        <div>
          <p className="text-3xl font-semibold text-gray-700">{dashboardData.enrolledStudentsData.length}</p>
          <p className="text-sm sm:text-base text-gray-500">Total Enrollments</p>
        </div>
      </div>

      <div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-lg border border-green-500 transition-transform hover:scale-105 duration-300">
        <img src={assets.appointments_icon} alt="appointments-icon" className="w-12 h-12 object-contain" />
        <div>
          <p className="text-3xl font-semibold text-gray-700">{dashboardData.totalCourses}</p>
          <p className="text-sm sm:text-base text-gray-500">Total Courses</p>
        </div>
      </div>

      <div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-lg border border-yellow-500 transition-transform hover:scale-105 duration-300">
        <img src={assets.earning_icon} alt="earning-icon" className="w-12 h-12 object-contain" />
        <div>
          <p className="text-3xl font-semibold text-gray-700">{currency}{dashboardData.totalEarnings}</p>
          <p className="text-sm sm:text-base text-gray-500">Total Earnings</p>
        </div>
      </div>

    </div>
    <div>
      <h2 className="pb-4 text-lg font-medium">Latest Enrollments</h2>
      <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
      <table className="table-fixed md:table-auto w-full overflow-hidden">
        <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
        <tr>
          <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">#</th>
          <th className="px-4 py-3 font-semibold">Student Name</th>
          <th className="px-4 py-3 font-semibold">Course Title</th>
        </tr>

        </thead>
        <tbody className="text-sm text-gray-500">
          {dashboardData.enrolledStudentsData.map((item, index) => (
    <tr key={index} className="border-b border-gray-500/20">
      <td className="px-4 py-3 text-center hidden sm:table-cell">
        {index + 1}
      </td>
      <td className="md:px-4 px-2 py-3 flex items-center space-x-3">
        <img
          src={item.student.imageUrl}
          alt="Profile"
          className="w-9 h-9 rounded-full"
        />
        <span className="truncate">{item.student.name}</span>
      </td>
      <td className="px-4 py-3 truncate">{item.courseTitle}</td>
    </tr>
  ))}

        </tbody>

      </table>

      </div>
    </div>
  </div>
</div>

  ) : <Loading/>
}

export default Dashboard