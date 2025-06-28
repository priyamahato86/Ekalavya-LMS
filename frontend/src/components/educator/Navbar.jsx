import { useContext } from 'react';
//import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom';

const Navbar = ( ) => {

  const {  user, logout } = useContext(AppContext)
  const navigate = useNavigate()

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

            <div className='ml-auto flex items-center gap-5 text-gray-500 relative'>
          {user ? <p>Hi! {user.fullName}</p> : <p>Hi! Developer</p>}

            <button
            onClick={logout}
            className="ml-2 px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
          >
            Logout
          </button>
        </div>
          </div>
        </header>
  )
}
export default Navbar;