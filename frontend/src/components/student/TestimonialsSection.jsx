
import { assets, dummyTestimonial } from '../../assets/assets';

const TestimonialsSection = () => {

  return (

<div className="pb-20 px-4 md:px-20">
      <h2 className="text-3xl font-semibold text-center text-gray-800">
        Testimonials
      </h2>
      <p className="text-base text-center text-gray-600 mt-3">
        Hear from our learners as they share their journeys of transformation,
        success, and how our <br /> platform has made a difference in their
        lives.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-14">
        {dummyTestimonial.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-5"
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src={testimonial.image}
                alt="User"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {testimonial.name}
                </h3>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>

            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src={
                    i < Math.floor(testimonial.rating)
                      ? assets.star
                      : assets.star_blank
                  }
                  alt=""
                  className="h-4 w-4"
                />
              ))}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">
              {testimonial.feedback}
            </p>
            <a href="#" className="text-blue-500 underline ">
              Read More
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSection;
