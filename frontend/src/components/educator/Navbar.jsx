import { useContext } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { UserButton, useUser } from '@clerk/clerk-react';
import { BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom';

const Navbar = ( ) => {

  const { isEducator } = useContext(AppContext)
  const { user } = useUser()
  const navigate = useNavigate()

  return isEducator && user && (

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
            <p>Hi! {user ? user.fullName : 'Developers'}</p>
            {user ? <UserButton/> : <img src={assets.profile_img} alt="profile" className='max-w-8'/>}
        </div>
          </div>
        </header>
  )
}
export default Navbar;