import React, { useState, useEffect } from "react";
import logo from "../../assets/logo.png";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import dashb from "../../assets/dashb.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const USI = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("patient");
  const [phone_num, setPhone_Num] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [login, setLogin] = useState("");
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

  const isFormValid =
  (email.trim() !== "" || phone_num.trim() !== "") &&
  password.trim().length >= 6 &&
  rememberMe;


  const handleSubmit = async (e) => {
    setLogin("Logging In...");
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
          "https://docuhealth-backend.onrender.com/api/auth/login",
          userData, // Send data in the request body
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const token = response.data.access_token;
        localStorage.setItem("jwtToken", token);

        const detailLogin = "UserloggedIn";
        localStorage.setItem("userlogin", detailLogin);

        toast.success("Login successful");
        console.log(response.data);
        setLogin("Next");
        setEmail("");
        setPhone_Num("");
        setPassword("");

        setTimeout(() => {
          navigate("/user-home-dashboard");
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
        "Please ensure all fields are correct and 'Remember me' is checked."
      );
    }
  };
  return (
    <div>
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
                    <p className="font-semibold">Email / Phone Number :</p>
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
                        to="/user-forgot-password"
                        className="underline text-[#0000FF]"
                      >
                        Forgot Password
                      </Link>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && <p className="text-red-500 text-sm">{error}</p>}

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
                    to="/user-create-account"
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
                  No better way to attend to, and keep records of medical
                  records
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
                    <p className="pb-1">Email / Phone Number :</p>
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
                        to="/user-forgot-password"
                        className="underline text-[#0000FF]"
                      >
                        Forgot Password
                      </Link>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && <p className="text-red-500 text-sm">{error}</p>}

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
                    to="/user-create-account"
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

export default USI;
