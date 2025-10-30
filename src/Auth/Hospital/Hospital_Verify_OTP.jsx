import React, { useState, useEffect } from "react";
import logo from "../../assets/img/logo.png";
import dashb from "../../assets/img/dashb.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [role, setRole] = useState("hospital");
  const [loading, setLoading] = useState("");

  const location = useLocation();
    const navigate = useNavigate();
  const { email } = location.state || {}; // Retrieve email from state

  useEffect(() => {
    const isMobile = window.innerWidth <= 768; // Adjust breakpoint as needed
    if (isMobile) {
      const timer = setTimeout(() => {
        setNotificationVisible(true);
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer); // Cleanup on component unmount
    }
  }, []);

  const handleChange = (value, index) => {
    // Allow only numeric values
    if (!/^\d?$/.test(value)) return;
  
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
  
    // Move focus to the next input if a digit is entered
    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };
  
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move focus to the previous input if the current one is empty
        const previousInput = document.getElementById(`otp-${index - 1}`);
        if (previousInput) previousInput.focus();
      } else {
        // Clear the current input value
        const updatedOtp = [...otp];
        updatedOtp[index] = "";
        setOtp(updatedOtp);
      }
    }
  };

  const handleSubmit = async (e) => {
    setLoading("Verifying Otp");
    e.preventDefault();

    try {
      // Combine the OTP array into a single string
      const enteredOtp = otp.join("");
      console.log("Entered OTP:", enteredOtp, email);

      // Send the OTP and email to the API
      const response = await axios.post(
        "https://docuhealth-backend-h03u.onrender.com/api/auth/verify_otp",
        {
          otp: enteredOtp,
          email: email,
          role: role
        }
      );

      // Check if the request was successful
      if (response.status === 200) {
        console.log("OTP verified successfully:", response.data);
        setLoading("Proceed");
        // Perform further actions based on response
        toast.success(response.data.message || "OTP Verified!");
        setTimeout(() => {
          navigate("/hospital-set-new-password",  { state: { email } });
        }, 1000);
      } else {
        console.error("OTP verification failed:", response.data);
        setLoading("Proceed");
        toast.error("OTP Verification Failed.");
      }
    } catch (error) {
      console.error("Error during OTP verification:", error.message);
      setLoading("Proceed");
      toast.error("OTP Verification Failed, Try Again");
    }
  };

  const handleResend = async () => {
    console.log("Resend OTP");

    try {
      const response = await fetch(
        "https://docuhealth-backend-h03u.onrender.com/api/auth/forgot_password",
        {
          method: "POST", // Use POST method for sending data
          headers: {
            "Content-Type": "application/json", // Indicate the payload format
          },
          body: JSON.stringify({ email, role }), // Send the email as JSON
        }
      );

      if (response.ok) {
        toast.success("Email sent successfully!");
      } else {
        toast.error(`Failed to send email, try again`);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <div className="min-h-screen">
        <div className="flex">
          {/* Left Side */}
          <div className="hidden sm:flex flex-1 h-screen  items-center justify-center text-sm">
            <div className="w-3/4" id="temp">
              <div className="pb-10">
                <img src={logo} alt="Logo" className="" />
              </div>
              <h2 className="text-xl font-bold mb-2">Verify OTP</h2>
              <p className="text-gray-600 mb-6">
                Please enter the 6 digit Pin we sent to your email address to
                proceed!
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* OTP Input Boxes */}
                <div id="otp" className="flex justify-center space-x-3 mb-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="w-12 h-12 text-center border-b-2  outline-hidden focus:border-[#0000FF] border-gray-400"
                      onBlur={(e) => {
                        if (e.target.value) {
                          e.target.classList.remove("border-blue-500");
                          e.target.classList.add("border-black");
                        }
                      }}
                    />
                  ))}
                </div>

                {/* Resend OTP Link */}
                <div>
                  <p className="text-center text-sm text-gray-600 mt-4">
                    You did not receive the OTP?{" "}
                    <span
                      onClick={handleResend}
                      className="text-[#0000FF] hover:underline cursor-pointer"
                    >
                      Click to resend
                    </span>
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#0000FF] text-white hover:bg-blue-700"
                >
                  {loading ? loading : "Proceed"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Side */}
          <div
            className="flex-1 h-screen flex flex-col justify-center items-center p-4"
            style={{
              background: "linear-gradient(to bottom, #0000FF, #718FCC)",
            }}
          >
            <div className="">
              <p className="text-white font-semibold text-2xl pb-1">
                The simplest way to manage <br /> medical records
              </p>
              <p className="text-white font-light">
                No better way to attend to, and keep records of medical records
              </p>
            </div>

            <div className="max-h-[470px] flex justify-center items-center pt-2">
              <img
                src={dashb}
                alt="Dashboard"
                className="object-contain w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
      {notificationVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-xs flex items-center justify-center z-50 text-sm">
          <div className="fixed bottom-0 left-0 right-0 bg-white text-black  py-4 rounded-t-3xl shadow-md animate-slide-up ">
            <div className="flex justify-center items-center gap-1 pb-4">
              <div>
                <img src={logo} alt="DocuHealth Logo" />
              </div>
              <h1 className="text-[#0000FF] text-2xl font-bold">DocuHealth</h1>
            </div>
            <div className="px-5" id="temp">
              <h2 className=" text-base sm:text-2xl  mb-2">Verify OTP</h2>
              <p className="text-gray-600 mb-6">
                Please enter the 6 digit Pin we sent to your email address to
                proceed!
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                {/* OTP Input Boxes */}
                <div id="otp" className="flex justify-center space-x-3 mb-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="w-8 h-12 text-center border-b-2  outline-hidden focus:border-[#0000FF] border-gray-400"
                      onBlur={(e) => {
                        if (e.target.value) {
                          e.target.classList.remove("border-blue-500");
                          e.target.classList.add("border-black");
                        }
                      }}
                    />
                  ))}
                </div>

                {/* Resend OTP Link */}
                <div>
                  <p className="text-center text-sm text-gray-600 mt-4">
                    You did not receive the OTP?{" "}
                    <span
                      onClick={handleResend}
                      className="text-[#0000FF] hover:underline cursor-pointer"
                    >
                      Click to resend
                    </span>
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#0000FF] text-white hover:bg-blue-700"
                >
                  {loading ? loading : "Proceed"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyOTP;
