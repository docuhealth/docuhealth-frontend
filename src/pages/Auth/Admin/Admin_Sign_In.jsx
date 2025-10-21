import React, { useState, useEffect } from "react";
import logo from "../../../assets/img/logo.png";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import dashb from "../../../assets/img/dashb.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from 'react-hot-toast';

const ALP = () => {
  const [email, setEmail] = useState("");
  const [phone_num, setPhone_Num] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("admin");
  const [rememberMe, setRememberMe] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [login, setLogin] = useState("");
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const isMobile = window.innerWidth <= 768; // Adjust breakpoint as needed
    if (isMobile) {
      const timer = setTimeout(() => {
        setNotificationVisible(true);
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer); // Cleanup on component unmount
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value.trim();
    setInputValue(value);

    if (/^\d+$/.test(value)) {
      // If the value is a valid number
      setPhone_Num(value);
      setEmail("");
    } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      // If the value is a valid email
      setEmail(value);
      setPhone_Num("");
    } else {
      // Reset if neither
      setEmail("");
      setPhone_Num("");
    }
  };

  useEffect(() => {
    let timer;
    if (showToast) {
      timer = setTimeout(() => {
        toast.success(
          "Kindly exercise patience, while you are being logged in!"
        );
        setShowToast(false); // Reset state after toast is shown
      }, 5000);
    }

    return () => clearTimeout(timer); // Cleanup timeout on unmount
  }, [showToast]);

  const isFormValid =
    (email.trim() !== "" || phone_num.trim() !== "") &&
    password.trim().length >= 1;

  const handleSubmit = async (e) => {
    setLogin("Logging In...");
    setShowToast(true);
    e.preventDefault();
    if (isFormValid) {
      console.log("Form Submitted");
      const userData = {
        ...(email ? { email } : { phone_num }),
        password,
        role,
      };
      
      try {
        const response = await axios.post(
          "https://docuhealth-backend-h03u.onrender.com/api/auth/login",
          userData, // Send data in the request body
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const token = response.data.access_token;
        localStorage.setItem("jwtToken", token);

        const detailLogin = "AdminloggedIn";
        localStorage.setItem("adminlogin", detailLogin);

        toast.success("Login successful");
        console.log(response.data);
        setLogin("Next");
        setEmail("");
        setPhone_Num("");
        setPassword("");

        setTimeout(() => {
          navigate("/admin-home-dashboard");
        }, 1000);
        // Handle success (e.g., save token, redirect user)
      } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        toast.error(
          error.response?.data?.message || "Login failed. Please try again."
        );
        setLogin("Next");
      }
    } else {
      toast.error(
        "Please ensure all fields are correct."
      );
    }

  };

  return (
    <div>
      <div className="min-h-screen">
        <div className="flex">
          {/* Left Side */}
          <div className=" hidden sm:flex flex-1 h-screen items-center justify-center">
            <div className="w-3/4" id="temp">
              <div className="pb-10">
                <img src={logo} alt="Logo" className="" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Sign Into Your Account
              </h2>
              <p className="text-gray-600 mb-6">
                Input your correct log-in credentials to get access into your
                dashboard
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="relative">
                  <p className="font-semibold">Email :</p>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-4 py-3 border rounded-lg pl-5 outline-none focus:border-blue-500"
                      value={inputValue}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="relative">
                  <p className="font-semibold">Password:</p>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-blue-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-4 w-4 text-gray-400" />
                      ) : (
                        <FaEye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex justify-between items-center">
                  <div id="checkbox">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Remember me
                    </label>
                  </div>
                  <div>
                    <Link
                      to="/admin-forgot-password"
                      className="underline text-[#0000FF]"
                    >
                      Forgot Password
                    </Link>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`w-full py-3 rounded-full ${
                    isFormValid
                      ? "bg-[#0000FF] text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  onClick={handleSubmit}
                  disabled={!isFormValid}
                >
                  {login ? login : "Next"}
                </button>
              </form>

              {/* Sign-Up Prompt */}
              <p className="text-center text-sm text-gray-600 mt-4">
                Haven't Registered Yet?{" "}
                <Link
                  to="/admin-create-account"
                  className="text-[#0000FF] hover:underline"
                >
                  Sign Up
                </Link>
              </p>
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

        {notificationVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="fixed bottom-0 left-0 right-0 bg-white text-black  py-4 rounded-t-3xl shadow-md animate-slide-up ">
              <div className="flex justify-center items-center gap-1 pb-4">
                <div>
                  <img src={logo} alt="DocuHealth Logo" />
                </div>
                <h1 className="text-[#0000FF] text-3xl font-bold">
                  DocuHealth
                </h1>
              </div>
              <div className="px-5" id="temp">
                <h2 className=" text-xl sm:text-2xl  mb-2">
                  Sign Into Your Account
                </h2>
                <p className="text-gray-600 mb-6">
                  Input your correct log-in credentials to get access into your
                  dashboard
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div className="relative">
                    <p className="pb-1">Email :</p>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-3 border rounded-lg pl-5 outline-none focus:border-blue-500"
                        value={inputValue}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <p className="pb-1">Password :</p>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-3 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <FaEyeSlash className="h-4 w-4 text-gray-400" />
                        ) : (
                          <FaEye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex justify-between items-center">
                    <div id="checkbox">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        Remember me
                      </label>
                    </div>
                    <div>
                      <Link
                        to="/admin-forgot-password"
                        className="underline text-[#0000FF]"
                      >
                        Forgot Password
                      </Link>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className={`w-full py-3 rounded-full ${
                      isFormValid
                        ? "bg-[#0000FF] text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                  >
                    {login ? login : "Next"}
                  </button>
                </form>

                {/* Sign-Up Prompt */}
                <p className="text-center text-sm text-gray-600 mt-4">
                  Haven't Registered Yet?{" "}
                  <Link
                    to="/admin-create-account"
                    className="text-[#0000FF] hover:underline"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ALP;
