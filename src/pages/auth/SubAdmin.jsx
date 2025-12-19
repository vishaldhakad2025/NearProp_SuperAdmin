// src/pages/Login.jsx
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaMobileAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { ClipLoader } from "react-spinners";
import gsap from "gsap";
import loginImg from "../../assets/image/login.jpg";
import { sendOtp } from "../../redux/slices/authSlice";

const SubAdminLogin = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  const validateMobile = (number) => /^[6-9]\d{9}$/.test(number);

  const handleSendOtp = async (e) => {
    e.preventDefault(); // ✅ prevent page reload
    if (!validateMobile(mobileNumber)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      await dispatch(sendOtp(mobileNumber)).unwrap();
      navigate("/sub-verify-otp", { state: { mobileNumber } });
    } catch (err) {
      setError("Error sending OTP. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-200 px-4">
      <div className="flex bg-white shadow-2xl rounded-2xl overflow-hidden w-full max-w-5xl">
        {/* Left Side Image */}
        <div className="hidden md:block md:w-1/2">
          <img
            src={loginImg}
            alt="Sub Admin Login"
            title="Sub Admin Login"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Right Side Form */}
        <div
          className="w-full md:w-1/2 flex flex-col justify-center p-8"
          ref={formRef}
        >
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-4">
            Sub Admin Login
          </h2>
          <p className="text-center text-gray-500 text-sm mb-6">
            Please sign in with your registered mobile number to access your
            dashboard.
          </p>

          {/* Error Alert */}
          {error && (
            <div className="relative bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
              <span className="text-sm">{error}</span>
              <button
                onClick={() => setError("")}
                className="ml-2 text-red-600 hover:text-red-800"
                aria-label="Close error"
              >
                <IoMdClose size={18} />
              </button>
            </div>
          )}

          {/* ✅ Form with proper submit handling */}
          <form onSubmit={handleSendOtp}>
            {/* Input Field */}
            <div className="relative mb-4">
              <input
                type="tel"
                inputMode="numeric"
                value={mobileNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setMobileNumber(value);
                  setError("");
                }}
                autoFocus
                placeholder="Enter mobile number"
                aria-label="Mobile Number"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <FaMobileAlt className="absolute left-3 top-3 text-blue-500 text-lg" />
            </div>

            {/* Sign In Button */}
            <button
              type="submit" // ✅ submit form on Enter
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 !text-white py-2 rounded-lg font-semibold transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <ClipLoader size={20} color="#fff" /> Sending OTP...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubAdminLogin;
