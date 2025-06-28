import  { useContext,useState} from 'react';
import { Menu, X, BookOpen } from "lucide-react";
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
//import { useClerk, UserButton, useUser } from '@clerk/clerk-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {

  //const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

 // const isCoursesListPage = location.pathname.includes('/course-list');

  const { backendUrl, isEducator, setIsEducator, navigate } = useContext(AppContext)

  // const { openSignIn } = useClerk()
  // const { user } = useUser()
  const token = localStorage.getItem('token');
  const handleLogout = () => {
  localStorage.removeItem('token');
  navigate('/signin');
};


  const becomeEducator = async () => {

    try {

      if (isEducator) {
        navigate('/educator')
        return;
      }

      const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Please log in first");
      return;
    }
      const { data } = await axios.get(backendUrl + '/api/educator/update-role', { headers: { Authorization: `Bearer ${token}` } })
      if (data.success) {
        toast.success(data.message)
        setIsEducator(true)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  return (

<header className="shadow-sm sticky top-0 bg-white z-50">
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center h-16">
        <div className="absolute left-4 flex items-center">
          <BookOpen
            onClick={() => navigate("/")}
            className="h-8 w-8 text-blue-600"
          />{" "}
          
          <span
            onClick={() => navigate("/")}
            className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Ekalavya
          </span>
        </div>

       

        <div className="absolute right-4 hidden md:flex items-center space-x-4">
          
            {token?  (
              <>
                <button
                  onClick={becomeEducator}
                  className="text-gray-800 font-medium hover:text-blue-600 transition-colors"
                >
                  {isEducator ? "Educator Dashboard" : "Become Educator"}
                </button>
                |{" "}
                <Link
                  to="/my-enrollments"
                  className="text-gray-800 font-medium hover:text-blue-600 transition-colors"
                >
                  My Enrollments
                </Link>{" "}
                <button
            onClick={handleLogout}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Logout
          </button>
              </>
            ):(
        <>
          <Link to="/signin" className="text-gray-800 font-medium hover:text-blue-600 transition-colors">Login</Link>
          <Link
            to="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-colors"
          >
            Create Account
          </Link>
        </>
      )}
    </div>

        <button
          className="md:hidden text-gray-800 absolute right-4"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      {/* {isMenuOpen && (
        <div className="md:hidden bg-white px-4 pt-2 pb-4 space-y-4">
          
          <div className=" md:hidden flex items-center gap-2 sm:gap-5 ">
            <div className="flex items-center gap-1 sm:gap-2 max:sm:text-xs">
              {user && (
                <>
                  <button
                    onClick={becomeEducator}
                    className="text-gray-800 font-medium hover:text-blue-600 transition-colors"
                  >
                    {isEducator ? "Educator Dashboard" : "Become Educator"}
                  </button>
                  |{" "}
                  <Link
                    to="/my-enrollment"
                    className="text-gray-800 font-medium hover:text-blue-600 transition-colors"
                  >
                    My Enrollments
                  </Link>{" "}
                </>
              )}
            </div>
            {user ? (
              <UserButton />
            ) : (
              <button
                onClick={() => openSignIn()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-colors"
              >
                Create Account
              </button>
            )}
          </div>
        </div>
      )} */}
      {isMenuOpen && (
    <div className="md:hidden bg-white px-4 pt-2 pb-4 space-y-4">
      {token ? (
        <>
          <button
            onClick={becomeEducator}
            className="text-gray-800 font-medium hover:text-blue-600 transition-colors block w-full text-left"
          >
            {isEducator ? "Educator Dashboard" : "Become Educator"}
          </button>
          <Link to="/my-enrollments" className="block text-gray-800 font-medium hover:text-blue-600">My Enrollments</Link>
          <button
            onClick={handleLogout}
            className="w-full bg-blue-600 hover:bg-blue-700 text-black py-2 rounded"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/signin" className="block text-gray-800 font-medium hover:text-blue-600">Login</Link>
          <Link to="/signup" className="block bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700">Create Account</Link>
        </>
      )}
    </div>
  )}
    </header>
  );
};

export default Navbar;