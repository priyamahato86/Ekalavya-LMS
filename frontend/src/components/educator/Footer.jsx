
import { assets } from '../../assets/assets';
import { BookOpen } from 'lucide-react'

const Footer = () => {
  return (

 <footer className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-4 border-t">
  
  <div className="flex items-center gap-4">
    <BookOpen className="h-8 w-8 text-blue-500" />
    <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
      Ekalavya
    </span>
    <div className="hidden md:block h-7 w-px bg-gray-500/60" />
    <p className="text-xs md:text-sm text-gray-500">
      &copy; 2025 Ekalavya. All rights reserved.
    </p>
  </div>

  
  <div className="flex items-center gap-3 mt-4 md:mt-0">
    <a href="#"><img src={assets.facebook_icon} alt="facebook" /></a>
    <a href="#"><img src={assets.twitter_icon} alt="twitter" /></a>
    <a href="#"><img src={assets.instagram_icon} alt="instagram" /></a>
  </div>
</footer>
  )
}

export default Footer;