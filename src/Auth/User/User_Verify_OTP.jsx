import React, { useState, useEffect } from "react";
import docuhealth_logo from "../../assets/img/docuhealth_logo.png";
import dashb from "../../assets/img/dashb.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../../utils/authAPI";
import { FaKey } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";

const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [mobileOTP, setMobileOTP] = useState("");
  const [role, setRole] = useState("patient");
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { email, phone_num } = location.state || {};

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
    setIsLoading(true);
    e.preventDefault();
    const enteredOtp = otp.join("");

    try {
      // Dynamically determine which field to send (email or phone_num)
      const payload = {
        otp: enteredOtp ? enteredOtp : mobileOTP,
        ...(email ? { email } : { phone_num }), // Send either email or phone_num
        // role: role, // Include the role in the request
      };

      // Send the request to the API
      const response = await authAPI(
        "POST",
        "api/auth/forgot-password/verify-otp",
        payload
      );

      // Handle the response
      setIsLoading(false);

      // Display success message
      toast.success(response.message || "OTP Verified!");
      // console.log(response)
      // Navigate and pass the appropriate data
      const navigateData = {
        ...(email ? { email } : { phone_num }),
        access_token: response.data.access_token,
      };
      setTimeout(() => {
        navigate("/user-set-new-password", { state: navigateData });
      }, 1000);
    } catch (error) {
      console.error("Error during OTP verification:", error);
      setIsLoading(false);
      toast.error("OTP Verification Failed, Try Again");
    }
  };

  const handleResend = async () => {
    console.log("Resend OTP");

    try {
      // Prepare the payload dynamically
      const payload = {
        role, // Include the role
        ...(email ? { email } : { phone_num }), // Dynamically add email or phone_num
      };

      // Make the POST request
      const response = await authAPI(
        "POST",
        "api/auth/forgot-password",
        payload
      );

      if (response.ok) {
        toast.success("OTP sent successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to resend OTP, try again.");
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      toast.error("An error occurred. Please try again later.");
    }
  };

  return (
    <div>
      <div className="hidden h-screen sm:flex">
        {/* Left Side */}

        <div className="w-full flex-1">
          <div className="hidden sm:flex justify-center items-center py-10 h-screen">
            <Link to="/">
                <div className=" fixed top-10 left-10  flex gap-1 items-center font-semibold text-[#3E4095]">
                                    <img src={docuhealth_logo} alt="Logo" className="w-6" />
                                    <h1 className="text-xl">DocuHealth</h1>
                                  </div>
            </Link>
            <div className="px-10 w-full">
              <h2 className="text-xl font-semibold pb-1">Verify OTP</h2>
              <p className="text-gray-600 mb-6 text-sm">
                Please enter the 6 digit Pin we sent to your email address to
                proceed!
              </p>

              <form onSubmit={handleSubmit} className="text-sm">
                {/* OTP Input Boxes */}
                <div id="otp" className="flex justify-center space-x-3 pb-8">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="w-12 h-12 text-center border-b-2  outline-hidden focus:border-[#3E4095] border-gray-400"
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
                  <p className="text-center text-sm text-gray-600 pb-5">
                    You did not receive the OTP?{" "}
                    <span
                      onClick={handleResend}
                      className="text-[#3E4095] hover:underline cursor-pointer"
                    >
                      Click to resend
                    </span>
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-full ${
                    isLoading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#3E4095] text-white "
                  }`}
                >
                  {isLoading ? "Verifying OTP..." : "Proceed"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div
          className="flex-1 h-screen flex flex-col justify-center items-center p-4"
          style={{
            background: "linear-gradient(to bottom, #3E4095, #718FCC)",
          }}
        >
          <div className="">
            <p className="text-white font-semibold text-2xl pb-1">
              The simplest way to manage <br /> medical records
            </p>
            <p className="text-white font-light text-sm">
              No better way to attend to, and keep records of medical records
            </p>
          </div>

          <div className="max-h-[420px] flex justify-center items-center pt-2">
            <img
              src={dashb}
              alt="Dashboard"
              className="object-contain w-full h-full"
            />
          </div>
        </div>
      </div>

      <div className="h-screen flex flex-col justify-center items-center sm:hidden py-10">
    <div className=" fixed top-10 left-5  flex gap-1 items-center font-semibold text-[#3E4095]">
          <img src={docuhealth_logo} alt="Logo" className="w-6" />
          <h1 className="text-xl">DocuHealth</h1>
        </div>
        <div>
          <div className="px-5 w-full">
            <h2 className="text-xl font-semibold pb-1">Verify OTP</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Please enter the 6 digit Pin we sent to your email address to
              proceed!
            </p>

            <form onSubmit={handleSubmit} className="text-sm">
              <div className="relative pb-5">
                <p className="font-semibold pb-1">Enter OTP :</p>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-[#3E4095]"
                    value={mobileOTP}
                    onChange={(e) => setMobileOTP(e.target.value)}
                    required
                  />
                  <FaKey className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Resend OTP Link */}
              <div>
                <p className="text-center text-sm text-gray-600 pb-5">
                  You did not receive the OTP?{" "}
                  <span
                    onClick={handleResend}
                    className="text-[#3E4095] hover:underline cursor-pointer"
                  >
                    Click to resend
                  </span>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-full ${
                  isLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#3E4095] text-white "
                }`}
              >
                {isLoading ? "Verifying OTP..." : "Proceed"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
