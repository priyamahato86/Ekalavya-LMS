import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import CourseCard from './CourseCard';
import { Link } from 'react-router-dom';

const CoursesSection = () => {

  const { allCourses } = useContext(AppContext)

  return (

<div className="py-16 md:px-40 px-8">
      <h2 className="text-3xl font-medium text-gray-800 text-center">
        Learn from the best
      </h2>
      <p className="text-sm md:text-base text-gray-500 mt-3 text-center">
        Discover our top-rated courses across various categories. From coding
        and design to <br /> business and wellness, our courses are crafted to
        deliver results.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 md:px-0 my-10 md:my-16 ">
        {allCourses.slice(0, 4).map((course, index) => (
          <CourseCard key={index} course={course} />
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <Link
          to={"/course-list"}
          onClick={() => scrollTo(0, 0)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-3 rounded-lg shadow-md hover:shadow-xl hover:from-blue-600 hover:to-purple-700 transition duration-300 font-semibold"
        >
          Show all courses
        </Link>
      </div>
    </div>
  );
};


export default CoursesSection;
