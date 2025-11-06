import React, { useState, useEffect } from "react";
import docuhealth_logo from "../../assets/img/docuhealth_logo.png";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import dashb from "../../assets/img/dashb.png";
import { Link, useNavigate } from "react-router-dom";
import { login, setToken } from "../../services/authService";
import toast from "react-hot-toast";

const USI = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone_num, setPhone_Num] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();


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
    setIsSubmitting(true);
    setShowToast(true);
    e.preventDefault();
    if (isFormValid) {
      console.log("Form Submitted");
      const userData = {
        ...(email ? { email } : { phone_num }),
        password,
      };

      try {
        const data = await login(userData);

        setToken(data.data.access_token, data.data.role);
        // Send token to sessionStorage
        // console.log(data)
        // console.log(data.access_token)

        toast.success("Login successful");
        setIsSubmitting(false);
        setEmail("");
        setPhone_Num("");
        setPassword("");

        setTimeout(() => {
          navigate("/user-home-dashboard");
        }, 1000);
        // Handle success (e.g., save token, redirect user)
      } catch (error) {
        console.log(error);
        toast.error(error.message || "Login failed. Please try again.");
        setIsSubmitting(false);
      } finally {
        setEmail("");
        setPhone_Num("");
        setInputValue("");
        setPassword("");
      }
    } else {
      toast.error("Please ensure all fields are correct.");
    }
  };
  return (
    <>
      <div className="hidden h-screen sm:flex">
        {/* Left Side */}
        <div className="  w-full flex-1">
          <div className=" hidden sm:flex justify-center items-center py-10 h-screen ">
            <Link to="/">
              <div className=" fixed top-10 left-10  flex gap-1 items-center font-semibold text-[#3E4095]">
                <img src={docuhealth_logo} alt="Logo" className="w-6" />
                <h1 className="text-xl">DocuHealth</h1>
              </div>
            </Link>
            <div className="w-full ">
              <div className="px-10 w-full">
                <h2 className="text-xl font-semibold pb-1">
                  Sign Into Your Account
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                  Input your correct log-in credentials to get access into your
                  dashboard
                </p>

                <form onSubmit={handleSubmit} className="text-sm">
                  {/* Email Input */}
                  <div className="relative pb-3">
                    <p className="font-semibold pb-1">Email :</p>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-[#3E4095]"
                        value={inputValue}
                        onChange={handleInputChange}
                        required
                      />
                      <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="relative pb-5">
                    <p className="font-semibold pb-1">Password:</p>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-[#3E4095]"
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
                  <div className="flex justify-between items-center pb-5">
                    <div id="checkbox">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        Remember me
                      </label>
                    </div>
                    <div>
                      <Link
                        to="/user-forgot-password"
                        className="underline text-[#3E4095]"
                      >
                        Forgot Password
                      </Link>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className={`w-full py-3 rounded-full ${isFormValid && !isSubmitting
                        ? "bg-[#3E4095] text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    onClick={handleSubmit}
                    disabled={!isFormValid || isSubmitting}
                  >
                    {isSubmitting ? (     <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Logging In...
                    </div> ): ("Next")}
                  </button>
                </form>

                {/* Sign-Up Prompt */}
                <p className="text-center text-sm text-gray-600 mt-4">
                  Haven't Registered Yet?{" "}
                  <Link
                    to="/user-create-account"
                    className="text-[#3E4095] hover:underline"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
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
            <p className="text-white font-semibold text-xl pb-1 sm:text-2xl">
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
   
          <div className="px-5 w-full">
            <h2 className="text-xl font-semibold pb-1">
              Sign Into Your Account
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Input your correct log-in credentials to get access into your
              dashboard
            </p>

            <form onSubmit={handleSubmit} className="text-sm">
              {/* Email Input */}
              <div className="relative pb-3">
                <p className="font-semibold pb-1">Email :</p>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-[#3E4095]"
                    value={inputValue}
                    onChange={handleInputChange}
                    required
                  />
                  <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative pb-5">
                <p className="font-semibold pb-1">Password:</p>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-[#3E4095]"
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
              <div className="flex justify-between items-center pb-5">
                <div id="checkbox">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Remember me
                  </label>
                </div>
                <div>
                  <Link
                    to="/user-forgot-password"
                    className="underline text-[#3E4095]"
                  >
                    Forgot Password
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-3 rounded-full ${isFormValid && !isSubmitting
                    ? "bg-[#3E4095] text-white "
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
              >
               {isSubmitting ? (     <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Logging In...
                    </div> ): ("Next")}
              </button>
            </form>

            {/* Sign-Up Prompt */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Haven't Registered Yet?{" "}
              <Link
                to="/user-create-account"
                className="text-[#3E4095] hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
      </div>
    </>
  );
};

export default USI;
