
import { ArrowRight } from "lucide-react";
import SearchBar from '../../components/student/SearchBar';

const Hero = () => {
  return (

<section className="pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-1/2 mb-12 lg:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Learn with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Personalized
              </span>{" "}
              Guidance
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg">
              Ekalavya uses AI to adapt to your learning style, providing a
              customized educational experience that helps you master concepts
              efficiently.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                Start Learning <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
            <div className="mt-8 flex items-center">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center overflow-hidden"
                  >
                    <span className="text-xs font-medium text-gray-600">
                      {i}
                    </span>
                  </div>
                ))}
              </div>
              <p className="ml-4 text-sm text-gray-600">
                <span className="font-semibold text-gray-800">5,000+</span>{" "}
                students already enrolled
              </p>
            </div>
          </div>
          <div className="w-full lg:w-1/2 relative">
            <div className="relative z-10 bg-white rounded-2xl shadow-xl overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="bg-gradient-to-tr from-blue-50 to-purple-50 p-1">
                <div className="bg-white rounded-xl p-4">
                  <div className="bg-gray-100 h-48 rounded-lg mb-4 flex items-center justify-center">
                    <img
                      src="img1.png"
                      alt="AI Illustration"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Master AI Concepts
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Personalized lessons, practical projects, and AI-driven
                    assessments — all in one place.
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <button className="text-blue-600 text-sm font-semibold hover:underline">
                      Explore More
                    </button>
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 flex justify-center">
          <SearchBar />
        </div>
      </div>
    </section>
  );
};

export default Hero;
