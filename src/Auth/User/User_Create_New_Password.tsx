import React, { useState } from "react";
import docuhealth_logo from "../../assets/img/docuhealth_logo.png";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa"; // React Icons
import dashb from "../../assets/img/dashb.png";
import AuthRightSide from "../AuthRightSide";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../../utils/authAPI";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getPasswordRequirements, isPasswordValid as checkPasswordValid } from "../../utils/passwordStrength";
import PasswordStrengthMeter from "../../Components/ui/PasswordStrengthMeter";
import Button from "../../Components/ui/Button";

const NPU = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(false);

  const passwordValid = checkPasswordValid(getPasswordRequirements(password));

  const navigate = useNavigate();
  const location = useLocation();

  const { email, phone_num, access_token } = location.state || {};

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();

    if (!passwordValid) {
      toast.error("Please enter a strong password");
      setIsLoading(false);
      return;
    }

    // Validate password and confirmPassword match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please try again.");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      // Prepare data payload dynamically
      const payload = {
        // ...(email ? { email } : { phone_num }), // Dynamically add email or phone_num
        new_password: password, // New password entered by the user
        // role: role, // Include role in the payload
      };

      // Make the PATCH request
      const response = await authAPI(
        "PATCH",
        "api/auth/reset-password",
        payload,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const data = await response;
      toast.success(data.message || "Password reset successful!"); // Success toast
      setIsLoading(false);
      setNotification(true); // Trigger any other notification logic
    } catch (error: any) {
      console.error("Error resetting password:", error);

      const errorMessage =
        error?.detail ||                 // custom thrown error
        "An error occurred. Please try again later.";

      toast.error(errorMessage);
      setIsLoading(false);
    }finally{
      setPassword('')
      setConfirmPassword('')
    }

  };

  const handleNavigation = () => {
    setNotification(false);
    navigate("/user-login");
  };

  return (
    <div>
      <div className="hidden h-screen sm:flex">
        {/* Left Side */}
        <div className=" w-1/2 h-full overflow-y-scroll hide-scrollbar flex-1">
          <div className="hidden sm:flex flex-col  items-start justify-center py-10 ">
            <Link to="/">
            <div className="pl-10 pb-10 flex gap-1 items-center font-semibold text-docuhealth-primary">
                <img src={docuhealth_logo} alt="Logo" className="w-6" />
                <h1 className="text-xl">DocuHealth</h1>
              </div>
            </Link>
            <div className="px-10 w-full">
              <h2 className="text-xl font-semibold pb-1 ">
                Set Up A New Password
              </h2>
              <p className="text-gray-600 mb-6 text-sm">
                Try to set up a password you won’t forget for easy access to
                your dashboard.
              </p>

              <form onSubmit={handleSubmit} className="text-sm">
                {/* Password Input */}
                <div className="relative pb-3">
                  <p className="font-semibold pb-1">Password:</p>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className={`w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-docuhealth-primary ${password && !passwordValid
                        ? "focus:border-red-500"
                        : ""
                        }`}
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

                  <PasswordStrengthMeter password={password} />
                </div>

                {/* Confirm Password Input */}
                <div className="relative pb-5">
                  <p className="font-semibold pb-1">Confirm Password:</p>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-docuhealth-primary"
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
                <Button type="submit" fullWidth loading={isLoading} loadingText="Resetting Password">
                  Reset Password
                </Button>
              </form>
            </div>
          </div>
        </div>

        <AuthRightSide />
      </div>
      {/* Notification Modal */}
      {notification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-sm px-5">
          <div className="bg-white py-6 px-8 rounded-lg shadow-lg flex flex-col justify-center items-center ">
            <div className="pb-2">
              <svg
                width="70"
                height="71"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50.4014" r="50" fill="var(--color-docuhealth-green-dark)" />
                <path
                  d="M44.6659 58.857L69.1789 34.344L72.9501 38.1152L44.6659 66.3994L27.6953 49.429L31.4666 45.6578L44.6659 58.857Z"
                  fill="white"
                />
              </svg>
            </div>
            <p className="text-docuhealth-green-dark mb-4 text-sm text-center ">
              You have successfully reset your password!
            </p>
            <div className="flex justify-center w-full">
              <button
                className="bg-docuhealth-primary w-full rounded-full text-white px-4 py-2 cursor-pointer"
                onClick={handleNavigation}
              >
                Go To SignIn
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-screen flex flex-col justify-center items-center sm:hidden py-10">
        <Link to="/">
          <div className=" fixed top-10 left-5  flex gap-1 items-center font-semibold text-docuhealth-primary">
            <img src={docuhealth_logo} alt="Logo" className="w-6" />
            <h1 className="text-xl">DocuHealth</h1>
          </div>
        </Link>
        <div>
          <div className="px-5 w-full">
            <h2 className="text-xl font-semibold pb-1 ">
              Set Up A New Password
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Try to set up a password you won’t forget for easy access to your
              dashboard.
            </p>

            <form onSubmit={handleSubmit} className="text-sm">
              {/* Password Input */}
              <div className="relative pb-3">
                <p className="font-semibold pb-1">Password:</p>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-docuhealth-primary ${password && !passwordValid ? "focus:border-red-500" : ""
                      }`}
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

                <PasswordStrengthMeter password={password} />
              </div>

              {/* Confirm Password Input */}
              <div className="relative pb-5">
                <p className="font-semibold pb-1">Confirm Password:</p>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-docuhealth-primary"
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
              <Button type="submit" fullWidth loading={isLoading} loadingText="Resetting Password">
                Reset Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NPU;
