// src/pages/OtpVerify.jsx
import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { FaKey } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { ClipLoader } from "react-spinners";
import { Modal, Button } from "antd"; // ✅ Ant Design components
import gsap from "gsap";
import { sendOtp, verifyOtp } from "../../redux/slices/authSlice";

const OtpVerify = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [resendCount, setResendCount] = useState(0);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const formRef = useRef(null);

  const location = useLocation();
  const mobileNumber = location.state?.mobileNumber;

  // Animation
  useEffect(() => {
    gsap.fromTo(
      formRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault(); // ✅ Prevent page refresh
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const data = await dispatch(verifyOtp({ mobileNumber, otp })).unwrap();

      if (data.roles && data.roles.includes("ADMIN")) {
        navigate("/dashboard");
      } else {
        setIsModalVisible(true); // unauthorized access
      }
    } catch (err) {
      setError("Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCount >= 3) {
      return setError("Maximum resend limit reached. Please try again later.");
    }
    setLoading(true);
    try {
      await dispatch(sendOtp(mobileNumber)).unwrap();
      setResendCount((prev) => prev + 1);
      setTimer(30);
      setError("");
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-200 px-4">
      <div
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
        ref={formRef}
      >
        <h2 className="text-2xl font-bold mb-2 text-center text-green-600">
          Verify OTP
        </h2>
        <p className="text-center text-sm mb-6 text-gray-500">
          OTP sent to <span className="font-medium">{mobileNumber}</span>
        </p>

        {/* Error Alert */}
        {error && (
          <div className="relative bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-2 text-red-600 hover:text-red-800"
              aria-label="Dismiss error"
            >
              <IoMdClose size={18} />
            </button>
          </div>
        )}

        {/* ✅ Form wrapper so Enter submits */}
        <form onSubmit={handleVerify}>
          {/* OTP Input */}
          <div className="relative mb-4">
            <input
              type="tel"
              inputMode="numeric"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtp(value);
                setError("");
              }}
              maxLength={6}
              autoFocus
              placeholder="Enter 6-digit OTP"
              aria-label="OTP"
              className="w-full border rounded-lg pl-10 pr-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <FaKey className="absolute left-3 top-3 text-green-500 text-lg" />
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 !text-white py-2 rounded-lg font-semibold transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <ClipLoader size={20} color="#fff" /> Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        {/* Resend Section */}
        <div className="text-center mt-4 text-sm text-gray-500">
          {timer > 0 ? (
            <p>Resend OTP in {timer}s</p>
          ) : resendCount < 3 ? (
            <button
              onClick={handleResendOtp}
              disabled={loading}
              className="text-blue-600 hover:underline disabled:opacity-60"
            >
              Resend OTP
            </button>
          ) : (
            <p className="text-red-500">Max 3 attempts reached</p>
          )}
        </div>

        {/* Unauthorized Modal */}
        <Modal
          title="Access Denied"
          open={isModalVisible}
          onOk={() => setIsModalVisible(false)}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button
              key="ok"
              type="primary"
              onClick={() => setIsModalVisible(false)}
            >
              OK
            </Button>,
          ]}
        >
          <p>
            You are not authorized to access this dashboard. Only admins can log
            in.
          </p>
        </Modal>
      </div>
    </div>
  );
};

export default OtpVerify;
