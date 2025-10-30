import React, { useState, useEffect } from "react";
import logo from "../assets/img/logo.png";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa"; // React Icons
import dashb from "../assets/img/dashb.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from 'react-hot-toast';

const HLP = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // To manage steps

  const [image, setImage] = useState(null);
  const [imagepreview, setImagePreview] = useState(null);

  const [hospitalName, sethospitalName] = useState("");
  const [hospitalAddress, sethospitalAddress] = useState("");
  const [doctors, setdoctors] = useState("");
  const [medpersonnel, setmedpersonnel] = useState("");
  const [notification, setnotification] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [notificationVisible, setNotificationVisible] = useState(false);
  const [signUp, setSignUp] = useState("");
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
            toast.success("Kindly exercise patience, while your account is being created!");
            setShowToast(false); // Reset state after toast is shown
          }, 5000);
        }
    
        return () => clearTimeout(timer); // Cleanup timeout on unmount
      }, [showToast]);

  const handleSubmit = async (e) => {
    setSignUp("Submitting...");
    setShowToast(true);
    e.preventDefault();
    // Construct hospital info as a JSON object
    const hospitalInfo = {
      email,
      password,
      hospitalName,
      hospitalAddress,
      doctors,
      medpersonnel,
    };

    // Reformat hospital info to match API requirements
    const formattedHospitalInfo = {
      email: hospitalInfo.email,
      name: hospitalInfo.hospitalName,
      password: hospitalInfo.password,
      address: hospitalInfo.hospitalAddress,
      doctors: hospitalInfo.doctors,
      others: hospitalInfo.medpersonnel,
    };

    console.log(formattedHospitalInfo)

    // Create FormData object
    const formData = new FormData();

    // Append the JSON stringified object with a key
    formData.append("info", JSON.stringify(formattedHospitalInfo));

    // Append the image if provided
    if (image) {
      formData.append("image", image); // Validate image if necessary
    }
    
    console.log(image)
    console.log(imagepreview)
    try {
      const response = await axios.post(
        `https://docuhealth-backend-h03u.onrender.com/api/hospital/register`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Response:", response.data);
      toast.success(response.data.message || "Registration successful!");
      setnotification(true); // Assuming this manages a notification state
      setNotificationVisible(false); // Assuming this hides the notification
    } catch (error) {
      // Error handling
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
      console.error(
        "Error submitting data:",
        error.response?.data || error.message
      );
    } finally {
      // Reset the submit button state
      setSignUp("Sign Up Now");
    }
  };

  const handleNextStep = () => {
    // Check if the form is completed before allowing to move to next step
    if (email && password && confirmPassword && password === confirmPassword) {
      setStep(2); // Move to Step 2
    } else {
      toast.error("Please fill all fields correctly.");
    }
  };
  const handleLastStep = () => {
    // Check if the form is completed before allowing to move to next step
    if (hospitalName && hospitalAddress && doctors && medpersonnel) {
      setStep(3);
    } else {
      toast.error("Please fill all fields correctly.");
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file); // Preview the selected image
      setImagePreview(URL.createObjectURL(file))
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Left Side */}
        <div className="hidden sm:flex flex-1 min-h-screen  items-center justify-center ">
          <div
            className="w-3/4 "
            id="temp"
            style={{ display: step === 1 ? "block" : "none" }}
          >
            <div className="pb-10">
              <img src={logo} alt="Logo" className="" />
            </div>
            <h2 className="text-xl font-bold mb-2 ">Create Your Account</h2>
            <p className="text-gray-600  mb-6 text-sm">
              Create your account with your correct credentials to get started
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {/* Email Input */}
              <div className="relative">
                <p className="font-semibold pb-1">Email :</p>
                <div className="relative">
                  <input
                    type="email"
                    className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative">
                <p className="font-semibold pb-1">Password:</p>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder=""
                    className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-blue-500"
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
                <p className="font-semibold pb-1">Confirm Password:</p>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder=""
                    className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-blue-500"
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
                to="/hospital-login"
                className="text-[#0000FF] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div
            className="w-3/4 py-10 "
            id="temp"
            style={{ display: step === 2 ? "block" : "none" }}
          >
            <div className="pb-10">
              <img src={logo} alt="Logo" className="" />
            </div>
            <h2 className="text-xl font-bold mb-2 ">Create Your Account</h2>
            <p className="text-gray-600  mb-6 text-sm">
              Create your account with your correct credentials to get started
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {/* Email Input */}
              <div className="relative">
                <p className="font-semibold pb-1">Name Of Hospital :</p>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded-lg pl-4 outline-hidden focus:border-blue-500"
                    value={hospitalName}
                    placeholder="Jarus Hospital"
                    onChange={(e) => sethospitalName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="relative">
                <p className="font-semibold pb-1">Hospital Address :</p>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded-lg pl-4 outline-hidden focus:border-blue-500"
                    value={hospitalAddress}
                    onChange={(e) => sethospitalAddress(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="relative">
                <p className="font-semibold pb-1">Number Of Doctors :</p>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full px-4 py-3 border rounded-lg pl-4 outline-hidden focus:border-blue-500"
                    value={doctors}
                    onChange={(e) => setdoctors(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="relative">
                <p className="font-semibold pb-1">
                  Number Of Other Medical Personnel :
                </p>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full px-4 py-3 border rounded-lg pl-4 outline-hidden focus:border-blue-500"
                    value={medpersonnel}
                    onChange={(e) => setmedpersonnel(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Move to next step button */}
              <button
                type="button"
                onClick={handleLastStep}
                className="w-full bg-[#0000FF] text-white py-3 rounded-full hover:bg-blue-700"
              >
                Move to Step 3 / 3
              </button>
            </form>

            {/* Sign-In Prompt */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <Link
                to="/hospital-login"
                className="text-[#0000FF] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
          <div
            className="w-3/4  "
            id="temp"
            style={{ display: step === 3 ? "block" : "none" }}
          >
            <div className="pb-10">
              <img src={logo} alt="Logo" className="" />
            </div>
            <h2 className="text-xl font-bold mb-2 ">
              Upload Hospital Logo/Picture
            </h2>
            <div className="flex flex-col justify-center items-center text-sm">
              <p className="text-gray-600  mb-6 text-sm">
                Add up a picture or logo of your hospital to complete your sign
                up process
              </p>

              <div className="pb-5">
                <form onSubmit={handleSubmit}>
                  <div className="relative">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="w-64 h-64 bg-gray-200 flex justify-center items-center rounded-full relative">
                        {image ? (
                          <img
                            src={imagepreview}
                            alt="Uploaded preview"
                            className="w-full h-full object-cover rounded-full "
                          />
                        ) : (
                          <div className="text-3xl text-gray-500">
                            <svg
                              width="115"
                              height="103"
                              viewBox="0 0 115 103"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M45.3344 11.9671L33.9984 23.3031H12.2989V91.319H102.987V23.3031H81.2874L69.9514 11.9671H45.3344ZM40.6388 0.631104H74.6468L85.9828 11.9671H108.655C111.785 11.9671 114.323 14.5048 114.323 17.6351V96.987C114.323 100.117 111.785 102.655 108.655 102.655H6.63088C3.50056 102.655 0.962891 100.117 0.962891 96.987V17.6351C0.962891 14.5048 3.50056 11.9671 6.63088 11.9671H29.3029L40.6388 0.631104ZM57.6428 85.651C40.4259 85.651 26.4689 71.6941 26.4689 54.477C26.4689 37.2601 40.4259 23.3031 57.6428 23.3031C74.8599 23.3031 88.8168 37.2601 88.8168 54.477C88.8168 71.6941 74.8599 85.651 57.6428 85.651ZM57.6428 74.315C68.599 74.315 77.4808 65.4333 77.4808 54.477C77.4808 43.5208 68.599 34.6391 57.6428 34.6391C46.6866 34.6391 37.8048 43.5208 37.8048 54.477C37.8048 65.4333 46.6866 74.315 57.6428 74.315Z"
                                fill="white"
                              />
                            </svg>
                            <span className="absolute right-0 text-white bg-[#0000FF] w-8 h-8 flex items-center justify-center rounded-full">
                              +
                            </span>
                          </div>
                        )}
                      </div>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </form>
              </div>
                      <p className="text-sm text-gray-600">
                            By Signing up, you agree to our{" "}
                            <Link
                              to="/privacy-policy"
                              className="text-[#0000FF] hover:underline"
                            >
                              Privacy Policy
                            </Link>
                            .
                          </p>

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-[#0000FF] text-white py-3 rounded-full hover:bg-blue-700"
              >
                {signUp ? signUp : "Sign Up Now"}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{" "}
                <Link
                  to="/hospital-login"
                  className="text-[#0000FF] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
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
            <p className="text-[#15C621] mb-4 text-sm ">
              You have successfully signed up
            </p>
            <div className="flex justify-center w-full">
              <button
                className="bg-[#0000FF] w-full rounded-full text-white px-4 py-2 "
                onClick={() => {
                  setnotification(false);
                  navigate("/hospital-login");
                }}
              >
                Go To Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
      {notificationVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="fixed bottom-0 left-0 right-0 bg-white text-black  py-4 rounded-t-3xl shadow-md animate-slide-up ">
            <div className="flex justify-center items-center gap-1 pb-4">
              <div>
                <img src={logo} alt="DocuHealth Logo" />
              </div>
              <h1 className="text-[#0000FF] text-2xl font-bold">DocuHealth</h1>
            </div>
            <div
              className="px-5"
              id="temp"
              style={{ display: step === 1 ? "block" : "none" }}
            >
              <h2 className="text-base sm:text-2xl  mb-1 ">
                Create Your Account
              </h2>
              <p className="text-gray-600  mb-6 text-sm">
                Create your account with your correct credentials to get started
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                {/* Email Input */}
                <div className="relative">
                  <p className="pb-1">Email :</p>
                  <div className="relative">
                    <input
                      type="email"
                      className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-blue-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Password Input */}
                <div className="relative">
                  <p className="pb-1">Password:</p>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder=""
                      className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-blue-500"
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
                  <p className="pb-1">Confirm Password:</p>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder=""
                      className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-blue-500"
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
                  to="/hospital-login"
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
              <h2 className="text-base sm:text-2xl mb-2 ">Create Your Account</h2>
              <p className="text-gray-600  mb-6 text-sm">
                Create your account with your correct credentials to get started
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="relative">
                  <p className="pb-1">Name Of Hospital :</p>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-4 py-3 border rounded-lg pl-4 outline-hidden focus:border-blue-500"
                      value={hospitalName}
                      placeholder="Jarus Hospital"
                      onChange={(e) => sethospitalName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="relative">
                  <p className=" pb-1">Hospital Address :</p>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-4 py-3 border rounded-lg pl-4 outline-hidden focus:border-blue-500"
                      value={hospitalAddress}
                      onChange={(e) => sethospitalAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="relative">
                  <p className="pb-1">Number Of Doctors :</p>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full px-4 py-3 border rounded-lg pl-4 outline-hidden focus:border-blue-500"
                      value={doctors}
                      onChange={(e) => setdoctors(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="relative">
                  <p className="pb-1">Number Of Other Medical Personnel :</p>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full px-4 py-3 border rounded-lg pl-4 outline-hidden focus:border-blue-500"
                      value={medpersonnel}
                      onChange={(e) => setmedpersonnel(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Move to next step button */}
                <button
                  type="button"
                  onClick={handleLastStep}
                  className="w-full bg-[#0000FF] text-white py-3 rounded-full hover:bg-blue-700"
                >
                  Move to Step 3 / 3
                </button>
              </form>

              {/* Sign-In Prompt */}
              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{" "}
                <Link
                  to="/hospital-login"
                  className="text-[#0000FF] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
            <div
              className="px-5 "
              id="temp"
              style={{ display: step === 3 ? "block" : "none" }}
            >
              <h2 className="text-base sm:text-2xl font-bold mb-2 ">
                Upload Hospital Logo/Picture
              </h2>
              <div className="flex flex-col justify-center items-center text-sm">
                <p className="text-gray-600  mb-6">
                  Add up a picture or logo of your hospital to complete your
                  sign up process
                </p>

                <div className="pb-5">
                  <form onSubmit={handleSubmit}>
                    <div className="relative">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="w-64 h-64 bg-gray-200 flex justify-center items-center rounded-full relative">
                          {image ? (
                            <img
                              src={imagepreview}
                              alt="Uploaded preview"
                              className="w-full h-full object-cover rounded-full "
                            />
                          ) : (
                            <div className="text-3xl text-gray-500">
                              <svg
                                width="115"
                                height="103"
                                viewBox="0 0 115 103"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M45.3344 11.9671L33.9984 23.3031H12.2989V91.319H102.987V23.3031H81.2874L69.9514 11.9671H45.3344ZM40.6388 0.631104H74.6468L85.9828 11.9671H108.655C111.785 11.9671 114.323 14.5048 114.323 17.6351V96.987C114.323 100.117 111.785 102.655 108.655 102.655H6.63088C3.50056 102.655 0.962891 100.117 0.962891 96.987V17.6351C0.962891 14.5048 3.50056 11.9671 6.63088 11.9671H29.3029L40.6388 0.631104ZM57.6428 85.651C40.4259 85.651 26.4689 71.6941 26.4689 54.477C26.4689 37.2601 40.4259 23.3031 57.6428 23.3031C74.8599 23.3031 88.8168 37.2601 88.8168 54.477C88.8168 71.6941 74.8599 85.651 57.6428 85.651ZM57.6428 74.315C68.599 74.315 77.4808 65.4333 77.4808 54.477C77.4808 43.5208 68.599 34.6391 57.6428 34.6391C46.6866 34.6391 37.8048 43.5208 37.8048 54.477C37.8048 65.4333 46.6866 74.315 57.6428 74.315Z"
                                  fill="white"
                                />
                              </svg>
                              <span className="absolute right-0 text-white bg-[#0000FF] w-8 h-8 flex items-center justify-center rounded-full">
                                +
                              </span>
                            </div>
                          )}
                        </div>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                  </form>
                </div>

        <p className="text-sm text-gray-600">
              By Signing up, you agree to our{" "}
              <Link
                to="/privacy-policy"
                className="text-[#0000FF] hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
            
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-[#0000FF] text-white py-3 rounded-full hover:bg-blue-700"
                >
                  {signUp ? signUp : "Sign Up Now"}
                </button>
                <p className="text-center text-sm text-gray-600 mt-4">
                  Already have an account?{" "}
                  <Link
                    to="/hospital-login"
                    className="text-[#0000FF] hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HLP;
