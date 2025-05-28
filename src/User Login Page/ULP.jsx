import React, { useState, useEffect } from "react";
import logo from "../assets/img/logo.png";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa"; // React Icons
import dashb from "../assets/img/dashb.png";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ULP = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone_num, setPhone_Num] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // To manage steps

  const [fullname, setFullName] = useState("");
  const [sex, setSex] = useState("");
  const [referred_by, setReferred_by] = useState("");
  const [DOB, setDOB] = useState("");
  const [state, setState] = useState("");
  const [signUp, setSignUp] = useState("");
  const [notification, setnotification] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [notificationVisible, setNotificationVisible] = useState(false);
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

  useEffect(() => {
    let timer;
    if (showToast) {
      timer = setTimeout(() => {
        toast.success(
          "Kindly exercise patience, while your account is being created!"
        );
        setShowToast(false); // Reset state after toast is shown
      }, 5000);
    }

    return () => clearTimeout(timer); // Cleanup timeout on unmount
  }, [showToast]);

  const handleSubmit = async (e) => {
    setSignUp("Submitting...");
    setShowToast(true);
    e.preventDefault();

    if (!fullname || !DOB || !state || !sex) {
      toast.error(
        "Please fill in all required fields: Full Name, DOB, State, and Sex."
      );
      
      setSignUp("Sign Up Now");
      setShowToast(false);
      return;
    }

    const userData = {
      fullname,
      password,
      email,
      phone_num,
      state,
      sex,
      DOB,
      ...(referred_by && { referred_by }), // Include referred_by only if it's not empty
    };
    try {
      const response = await axios.post(
        "https://docuhealth-backend-h03u.onrender.com/api/patient/register",
        userData, // Send data in the request body
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(response.data.message || "Registration successful!");
      // console.log(response.data.message);
      setnotification(true);
      setNotificationVisible(false);
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please refresh and try again."
      );

      setSignUp("Sign Up Now");
    }

    console.log(
      email,
      password,
      phone_num,
      confirmPassword,
      fullname,
      state,
      DOB,
      referred_by
    );

    setEmail("");
    setPassword("");
    setPhone_Num("");
    setConfirmPassword("");
    setDOB("");
    setFullName("");
    setSex("");
    setState("");
    setReferred_by("");
  };

  const handleNextStep = () => {
    // Check if the form is completed before allowing to move to next step
    if (
      email &&
      phone_num &&
      phone_num.length > 10 &&
      password &&
      confirmPassword &&
      password === confirmPassword
    ) {
      setStep(2); // Move to Step 2
    } else {
      toast.error("Please fill all fields correctly.");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Left Side */}
        <div className="hidden sm:flex flex-1 min-h-screen  items-center justify-center ">
          <div
            className="w-3/4 py-10"
            id="temp"
            style={{ display: step === 1 ? "block" : "none" }}
          >
            <div className="pb-10">
              <img src={logo} alt="Logo" className="" />
            </div>
            <h2 className="text-2xl font-bold mb-2 ">Create Your Account</h2>
            <p className="text-gray-600  mb-6">
              Create your account with your correct credentials to get started
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <p className="font-semibold pb-1">Email :</p>
                <div className="relative">
                  <input
                    type="email"
                    className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="relative">
                <p className="font-semibold pb-1">Phone Number :</p>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full px-4 py-3 border rounded-lg pl-3 outline-none focus:border-blue-500"
                    value={phone_num}
                    onChange={(e) => setPhone_Num(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative">
                <p className="font-semibold pb-1">Password :</p>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder=""
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

              {/* Confirm Password Input */}
              <div className="relative">
                <p className="font-semibold pb-1">Confirm Password :</p>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder=""
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

              {/* Move to next step button */}
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full bg-[#0000FF] text-white py-3 rounded-full hover:bg-blue-700"
              >
                Move to Step 2 / 3
              </button>
            </form>

            {/* Sign-In Prompt */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <Link to="/user-login" className="text-[#0000FF] hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div
            className="w-3/4 py-10"
            id="temp"
            style={{ display: step === 2 ? "block" : "none" }}
          >
            <div className="pb-10">
              <img src={logo} alt="Logo" className="" />
            </div>
            <h2 className="text-2xl font-bold mb-2 ">Create Your Account</h2>
            <p className="text-gray-600  mb-6">
              Create your account with your correct credentials to get started
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <p className="font-semibold pb-1">Full Name :</p>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded-lg pl-3 outline-none focus:border-blue-500"
                    value={fullname}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <p className="font-semibold pb-1">Referred By :</p>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded-lg pl-3 outline-none focus:border-blue-500"
                    placeholder="Referral email (optional)"
                    value={referred_by}
                    onChange={(e) => setReferred_by(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <p className="font-semibold pb-1">Date Of Birth :</p>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full px-4 py-3 border rounded-lg outline-none focus:border-blue-500 appearance-none pr-10"
                    value={DOB}
                    onChange={(e) => setDOB(e.target.value)}
                    required
                  />

                  {/* Custom dropdown arrow */}
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="relative">
                <p className="font-semibold pb-1">State Of Residence :</p>
                <div className="relative w-full">
                  <select
                    className="border border-gray-300 px-4 py-3 rounded w-full focus:border-blue-600 outline-none appearance-none pr-10"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  >
                    <option value=""> Select your State</option>
                    <option value="Abia">Abia</option>
                    <option value="Adamawa">Adamawa</option>
                    <option value="Akwa Ibom">Akwa Ibom</option>
                    <option value="Anambra">Anambra</option>
                    <option value="Bauchi">Bauchi</option>
                    <option value="Bayelsa">Bayelsa</option>
                    <option value="Benue">Benue</option>
                    <option value="Borno">Borno</option>
                    <option value="Cross River">Cross River</option>
                    <option value="Delta">Delta</option>
                    <option value="Ebonyi">Ebonyi</option>
                    <option value="Edo">Edo</option>
                    <option value="Ekiti">Ekiti</option>
                    <option value="Enugu">Enugu</option>
                    <option value="Gombe">Gombe</option>
                    <option value="Imo">Imo</option>
                    <option value="Jigawa">Jigawa</option>
                    <option value="Kaduna">Kaduna</option>
                    <option value="Kano">Kano</option>
                    <option value="Katsina">Katsina</option>
                    <option value="Kebbi">Kebbi</option>
                    <option value="Kogi">Kogi</option>
                    <option value="Kwara">Kwara</option>
                    <option value="Lagos">Lagos</option>
                    <option value="Nasarawa">Nasarawa</option>
                    <option value="Niger">Niger</option>
                    <option value="Ogun">Ogun</option>
                    <option value="Ondo">Ondo</option>
                    <option value="Osun">Osun</option>
                    <option value="Oyo">Oyo</option>
                    <option value="Plateau">Plateau</option>
                    <option value="Rivers">Rivers</option>
                    <option value="Sokoto">Sokoto</option>
                    <option value="Taraba">Taraba</option>
                    <option value="Yobe">Yobe</option>
                    <option value="Zamfara">Zamfara</option>
                    <option value="Abuja">Abuja (FCT)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="relative">
                <p className="font-semibold pb-1">Sex :</p>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 border rounded-lg outline-none focus:border-blue-500 appearance-none pr-10"
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select Sex
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>

                  {/* Custom dropdown arrow */}
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-[#0000FF] text-white py-3 rounded-full hover:bg-blue-700"
              >
                {signUp ? signUp : "Sign Up Now"}
              </button>
            </form>

            {/* Sign-In Prompt */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <Link to="/user-login" className="text-[#0000FF] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div
          className="flex-1 min-h-screen flex flex-col justify-center items-center p-4"
          style={{
            background: "linear-gradient(to bottom, #0000FF, #718FCC)",
          }}
        >
          <div className="">
            <p className="text-white font-semibold text-xl sm:text-2xl pb-1">
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
      {notification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white py-6 px-14 rounded-lg shadow-lg flex flex-col justify-center items-center">
            <div className="pb-2">
              <svg
                width="70"
                height="70"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50.4014" r="50" fill="#15C621" />
                <path
                  d="M44.6659 58.857L69.1789 34.344L72.9501 38.1152L44.6659 66.3994L27.6953 49.429L31.4666 45.6578L44.6659 58.857Z"
                  fill="white"
                />
              </svg>
            </div>
            <p className="text-[#15C621] mb-4 text-sm sm:text-base">
              You have successfully signed up
            </p>
            <div className="flex justify-center w-full">
              <button
                className="bg-[#0000FF] w-full rounded-full text-white px-4 py-2 "
                onClick={() => {
                  navigate("/user-login");
                }}
              >
                Go To Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
      {notificationVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="fixed bottom-0 left-0 right-0 bg-white text-black  py-4 rounded-t-3xl shadow-md animate-slide-up ">
            <div className="flex justify-center items-center gap-1 pb-4">
              <div>
                <img src={logo} alt="DocuHealth Logo" />
              </div>
              <h1 className="text-[#0000FF] text-3xl font-bold">DocuHealth</h1>
            </div>
            <div
              className="px-5"
              id="temp"
              style={{ display: step === 1 ? "block" : "none" }}
            >
              <h2 className="text-xl sm:text-2xl  mb-1 ">
                Create Your Account
              </h2>
              <p className="text-gray-600  mb-6">
                Create your account with your correct credentials to get started
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="relative">
                  <p className="font-semibold">Email :</p>
                  <div className="relative">
                    <input
                      type="email"
                      className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-blue-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="relative">
                  <p className="font-semibold">Phone Number :</p>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full px-4 py-3 border rounded-lg pl-3 outline-none focus:border-blue-500"
                      value={phone_num}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 11) {
                          setPhone_Num(value);
                        }
                      }}
                      required
                      minLength={11}
                      maxLength={11}
                      min="11111111111" // Minimum number with 11 digits
                      max="99999999999" // Maximum number with 11 digits
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="relative">
                  <p className="font-semibold">Password :</p>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder=""
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

                {/* Confirm Password Input */}
                <div className="relative">
                  <p className="font-semibold">Confirm Password :</p>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder=""
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

                {/* Move to next step button */}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-[#0000FF] text-white py-3 rounded-full hover:bg-blue-700"
                >
                  Move to Step 2 / 3
                </button>
              </form>

              {/* Sign-In Prompt */}
              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{" "}
                <Link
                  to="/user-login"
                  className="text-[#0000FF] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
            <div
              className=" px-5"
              id="temp"
              style={{ display: step === 2 ? "block" : "none" }}
            >
              <h2 className="text-xl sm:text-2xl mb-2 ">Create Your Account</h2>
              <p className="text-gray-600  mb-6">
                Create your account with your correct credentials to get started
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <p className="font-semibold">Full Name :</p>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-4 py-3 border rounded-lg pl-3 outline-none focus:border-blue-500"
                      value={fullname}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <p className="font-semibold pb-1">Referred By :</p>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Referral email (optional)"
                      className="w-full px-4 py-3 border rounded-lg pl-3 outline-none focus:border-blue-500"
                      value={referred_by}
                      onChange={(e) => setReferred_by(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <p className="font-semibold pb-1">Date Of Birth :</p>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full px-4 py-3 border rounded-lg outline-none focus:border-blue-500 appearance-none pr-10"
                      value={DOB}
                      onChange={(e) => setDOB(e.target.value)}
                      required
                    />

                    {/* Custom dropdown arrow */}
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <p className="font-semibold">State Of Residence :</p>
                  <div className="relative w-full">
                    <select
                      className="border border-gray-300 px-4 py-3 rounded w-full focus:border-blue-600 outline-none appearance-none pr-10"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                    >
                      <option value=""> Select your State</option>
                      <option value="Abia">Abia</option>
                      <option value="Adamawa">Adamawa</option>
                      <option value="Akwa Ibom">Akwa Ibom</option>
                      <option value="Anambra">Anambra</option>
                      <option value="Bauchi">Bauchi</option>
                      <option value="Bayelsa">Bayelsa</option>
                      <option value="Benue">Benue</option>
                      <option value="Borno">Borno</option>
                      <option value="Cross River">Cross River</option>
                      <option value="Delta">Delta</option>
                      <option value="Ebonyi">Ebonyi</option>
                      <option value="Edo">Edo</option>
                      <option value="Ekiti">Ekiti</option>
                      <option value="Enugu">Enugu</option>
                      <option value="Gombe">Gombe</option>
                      <option value="Imo">Imo</option>
                      <option value="Jigawa">Jigawa</option>
                      <option value="Kaduna">Kaduna</option>
                      <option value="Kano">Kano</option>
                      <option value="Katsina">Katsina</option>
                      <option value="Kebbi">Kebbi</option>
                      <option value="Kogi">Kogi</option>
                      <option value="Kwara">Kwara</option>
                      <option value="Lagos">Lagos</option>
                      <option value="Nasarawa">Nasarawa</option>
                      <option value="Niger">Niger</option>
                      <option value="Ogun">Ogun</option>
                      <option value="Ondo">Ondo</option>
                      <option value="Osun">Osun</option>
                      <option value="Oyo">Oyo</option>
                      <option value="Plateau">Plateau</option>
                      <option value="Rivers">Rivers</option>
                      <option value="Sokoto">Sokoto</option>
                      <option value="Taraba">Taraba</option>
                      <option value="Yobe">Yobe</option>
                      <option value="Zamfara">Zamfara</option>
                      <option value="Abuja">Abuja (FCT)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <p className="font-semibold pb-1">Sex :</p>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 border rounded-lg outline-none focus:border-blue-500 appearance-none pr-10"
                      value={sex}
                      onChange={(e) => setSex(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select Sex
                      </option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>

                    {/* Custom dropdown arrow */}
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Move to next step button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-[#0000FF] text-white py-3 rounded-full hover:bg-blue-700"
                >
                  {signUp ? signUp : "Sign Up Now"}
                </button>
              </form>

              {/* Sign-In Prompt */}
              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{" "}
                <Link
                  to="/user-login"
                  className="text-[#0000FF] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ULP;
