
import { assets } from '../../assets/assets'

const CallToAction = () => {
  return (

 <div className="flex flex-col items-center gap-4 pt-10 pb-24  px-8 md:px-0 ">
      <h2 className="text-xl md:text-4xl text-gray-800 font-semibold">
        Learn anything, anytime, anywhere
      </h2>
      <p className="text-gray-500 sm:text-sm">
        Join our platform and unlock your potential with a wide range of courses
        and resources.
      </p>
      <div className="flex items-center font-medium gap-6 mt-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 hover:scale-105 hover:shadow-md transition-all duration-300">
          Get Started
        </button>
        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-300 hover:scale-105 hover:shadow-md transition-all duration-300">
          Learn More <img src={assets.arrow_icon} alt="arrow icon" />
        </button>
      </div>
    </div>
  );
};

export default CallToAction