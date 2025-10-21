import React, { useState, useEffect } from "react";
import logo from "../../../assets/img/logo.png";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa"; // React Icons
import dashb from "../../../assets/img/dashb.png";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from 'react-hot-toast';

const NP = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState("");
  const [notification, setNotification] = useState(false);

  const [notificationVisible, setNotificationVisible] = useState(false);
  const [role, setRole] = useState("hospital");
    // Password validation states
    const [passwordRequirements, setPasswordRequirements] = useState({
      hasLowercase: false,
      hasUppercase: false,
      hasNumber: false,
      hasSymbol: false,
      hasMinLength: false,
    });
    const [isPasswordValid, setIsPasswordValid] = useState(false);
  
     // Password validation function
     const validatePassword = (password) => {
      const requirements = {
        hasLowercase: /[a-z]/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        hasMinLength: password.length >= 8,
      };
  
      setPasswordRequirements(requirements);
  
      // Check if all requirements are met
      const allRequirementsMet = Object.values(requirements).every(Boolean);
      setIsPasswordValid(allRequirementsMet);
    };
  
    // Password strength calculation
    const getPasswordStrength = (password) => {
      if (!password) return { strength: 0, label: '', color: '' };
  
      let score = 0;
      if (password.length >= 8) score += 1;
      if (/[a-z]/.test(password)) score += 1;
      if (/[A-Z]/.test(password)) score += 1;
      if (/\d/.test(password)) score += 1;
      if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  
      if (score <= 1) return { strength: score, label: 'Very Weak', color: 'bg-red-500' };
      if (score <= 2) return { strength: score, label: 'Weak', color: 'bg-orange-500' };
      if (score <= 3) return { strength: score, label: 'Fair', color: 'bg-yellow-500' };
      if (score <= 4) return { strength: score, label: 'Good', color: 'bg-blue-500' };
      return { strength: score, label: 'Strong', color: 'bg-green-500' };
    };
  useEffect(() => {
    const isMobile = window.innerWidth <= 768; // Adjust breakpoint as needed
    if (isMobile) {
      const timer = setTimeout(() => {
        setNotificationVisible(true);
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer); // Cleanup on component unmount
    }
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const { email } = location.state || {}; // Retrieve email from state

  const handleSubmit = async (e) => {
    setLoading("Resetting Password");
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error("Please enter a strong password");
      setLoading("Reset Password");
      return;
    }

    // Validate password and confirmPassword match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please try again.");
      setLoading("Reset Password");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      setLoading("Reset Password");
      return;
    }

    try {
      // Prepare data payload
      const payload = {
        email, // Replace with the user's email
        new_password: password, // New password entered by the user
        role: role, // Replace with dynamic role if applicable
      };

      // Make the POST request
      const response = await fetch(
        "https://docuhealth-backend-h03u.onrender.com/api/auth/reset_password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload), // Send payload as JSON
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success("Password reset successful!"); // Success toast
        setLoading("Reset Password");
        setNotification(true); // Trigger any other notification logic
        setNotificationVisible(false);
      } else {
        const errorData = await response.json();
        setLoading("Reset Password");
        toast.error(`Error: ${errorData.message}`); // Error toast
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later."); // Network or unexpected error toast
      console.error("Error resetting password:", error);
      setLoading("Reset Password");
    }
  };

  const handleNavigation = () => {
    setNotification(false);
    navigate("/hospital-login");
  };

  return (
    <div>
      <div className="min-h-screen">
        <div className="flex">
          {/* Left Side */}
          <div className=" hidden sm:flex flex-1 h-screen  items-center justify-center text-sm">
            <div className="w-3/4" id="temp">
              <div className="pb-10">
                <img src={logo} alt="Logo" className="" />
              </div>
              <h2 className="text-xl font-bold mb-2 ">
                Set Up A New Password
              </h2>
              <p className="text-gray-600 mb-6">
                Try to set up a password you won’t forget for easy access to
                your dashboard.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password Input */}
                <div className="relative">
                  <p className="font-semibold pb-1">Password:</p>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className={`w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-blue-500 ${
                        password && !isPasswordValid ? 'focus:border-red-500' : ''
                      }`}
                      value={password}
                      onChange={(e) => {setPassword(e.target.value)
                        validatePassword(e.target.value)
                      }}
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
                  {password && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    {/* Password Strength Indicator */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Password Strength:</span>
                        <span className={`text-sm font-medium ${getPasswordStrength(password).color.replace('bg-', 'text-')}`}>
                          {getPasswordStrength(password).label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(password).color}`}
                          style={{ width: `${(getPasswordStrength(password).strength / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                    <div className="space-y-1">
                      <div className={`flex items-center text-sm ${passwordRequirements.hasLowercase ? 'text-green-600' : 'text-red-500'}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.hasLowercase ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        Include lowercase letters (a-z)
                      </div>
                      <div className={`flex items-center text-sm ${passwordRequirements.hasUppercase ? 'text-green-600' : 'text-red-500'}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.hasUppercase ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        Include uppercase letters (A-Z)
                      </div>
                      <div className={`flex items-center text-sm ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-red-500'}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.hasNumber ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        Include at least one number (0-9)
                      </div>
                      <div className={`flex items-center text-sm ${passwordRequirements.hasSymbol ? 'text-green-600' : 'text-red-500'}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.hasSymbol ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        Include at least one symbol (!@#$%^&*)
                      </div>
                      <div className={`flex items-center text-sm ${passwordRequirements.hasMinLength ? 'text-green-600' : 'text-red-500'}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.hasMinLength ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        Be at least 8 characters long
                      </div>
                    </div>
                    {isPasswordValid && (
                      <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded">
                        <p className="text-sm text-green-700 font-medium">✓ Password meets all requirements!</p>
                      </div>
                    )}
                  </div>
                )}
                </div>

                {/* Confirm Password Input */}
                <div className="relative">
                  <p className="font-semibold pb-1">Confirm Password:</p>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-blue-500"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-[#0000FF] text-white py-3 rounded-full hover:bg-blue-700"
                >
                  {loading ? loading : "Reset Password"}
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
                No better way to attend to, and keep records of medical records.
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

        {/* Notification Modal */}
        {notification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-sm">
            <div className="bg-white py-6 px-14 rounded-lg shadow-lg flex flex-col justify-center items-center">
              <div className="pb-2">
              <svg width="70" height="71" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="50" cy="50.4014" r="50" fill="#0B6011"/>
<path d="M44.6659 58.857L69.1789 34.344L72.9501 38.1152L44.6659 66.3994L27.6953 49.429L31.4666 45.6578L44.6659 58.857Z" fill="white"/>
</svg>
              </div>
              <p className="text-[#0B6011] mb-4 text-sm ">
                You have successfully reset your password!
              </p>
              <div className="flex justify-center w-full">
                <button
                  className="bg-[#0000FF] w-full rounded-full text-white px-4 py-2"
                  onClick={handleNavigation}
                >
                  Go To SignIn
                </button>
              </div>
            </div>
          </div>
        )}

        {notificationVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 text-sm">
            <div className="fixed bottom-0 left-0 right-0 bg-white text-black  py-4 rounded-t-3xl shadow-md animate-slide-up ">
              <div className="flex justify-center items-center gap-1 pb-4">
                <div>
                  <img src={logo} alt="DocuHealth Logo" />
                </div>
                <h1 className="text-[#0000FF] text-2xl font-bold">
                  DocuHealth
                </h1>
              </div>
              <div className="px-5" id="temp">
                <h2 className="text-base sm:text-2xl  mb-2 ">
                  Set Up A New Password
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                  Try to set up a password you won’t forget for easy access to
                  your dashboard.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                  {/* Password Input */}
                  <div className="relative">
                    <p className="pb-1">Password:</p>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className={`w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-blue-500 ${
                          password && !isPasswordValid ? 'focus:border-red-500' : ''
                        }`}
                        value={password}
                        onChange={(e) => {setPassword(e.target.value)
                          validatePassword(e.target.value)
                        }}
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
                    {password && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    {/* Password Strength Indicator */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Password Strength:</span>
                        <span className={`text-sm font-medium ${getPasswordStrength(password).color.replace('bg-', 'text-')}`}>
                          {getPasswordStrength(password).label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(password).color}`}
                          style={{ width: `${(getPasswordStrength(password).strength / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                    <div className="space-y-1">
                      <div className={`flex items-center text-sm ${passwordRequirements.hasLowercase ? 'text-green-600' : 'text-red-500'}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.hasLowercase ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        Include lowercase letters (a-z)
                      </div>
                      <div className={`flex items-center text-sm ${passwordRequirements.hasUppercase ? 'text-green-600' : 'text-red-500'}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.hasUppercase ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        Include uppercase letters (A-Z)
                      </div>
                      <div className={`flex items-center text-sm ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-red-500'}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.hasNumber ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        Include at least one number (0-9)
                      </div>
                      <div className={`flex items-center text-sm ${passwordRequirements.hasSymbol ? 'text-green-600' : 'text-red-500'}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.hasSymbol ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        Include at least one symbol (!@#$%^&*)
                      </div>
                      <div className={`flex items-center text-sm ${passwordRequirements.hasMinLength ? 'text-green-600' : 'text-red-500'}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.hasMinLength ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        Be at least 8 characters long
                      </div>
                    </div>
                    {isPasswordValid && (
                      <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded">
                        <p className="text-sm text-green-700 font-medium">✓ Password meets all requirements!</p>
                      </div>
                    )}
                  </div>
                )}
                  </div>

                  {/* Confirm Password Input */}
                  <div className="relative">
                    <p className="pb-1">Confirm Password:</p>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-blue-500"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-[#0000FF] text-white py-3 rounded-full hover:bg-blue-700"
                  >
                    {loading ? loading : "Reset Password"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NP;
