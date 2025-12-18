import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
// import NotFoundAnimation from '../assets/404.json'; 

const NotFound = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
    );
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-tr from-blue-50 via-purple-100 to-pink-50">
      <div
        ref={containerRef}
        className="flex flex-col-reverse md:flex-row items-center justify-center gap-12 max-w-6xl w-full"
      >
        {/* Text Section */}
        <div className="text-center md:text-left max-w-lg">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist or has been moved. Let's get you back home!
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:scale-105 transition-transform duration-300"
          >
            ⬅ Back to Home
          </button>
        </div>

        {/* Lottie Animation Section */}
        <div className="w-full md:w-1/2 max-w-md">
          <Lottie  loop={true} />
        </div>
      </div>
    </section>
  );
};

export default NotFound;
