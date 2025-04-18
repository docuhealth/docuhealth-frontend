import React, { useState, useEffect } from "react";
import logo from "../../assets/img/logo.png";
import dashb from "../../assets/img/dashb.png";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const SAU = () => {
  const [email, setEmail] = useState("");
  const [hin, setHin] = useState("");
  const [state, setState] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const[loading, setLoading] = useState("")

  const [notification, setnotification] = useState(false);

  const [notificationVisible, setNotificationVisible] = useState(false);

  const isFormValid = hin && state && email && number && password;

  const navigate = useNavigate();

  // const handleSubmit = (e) => {
  //   e.preventDefault();

  //   if (!hin || !state || !email || !number || !password) {
  //     toast.error("All fields must be filled before submission.");
  //     return;
  //   }


  //   console.log(hin, state, email, password, number);
  //   setEmail("");
  //   setPassword("");
  //   setNumber("");

  //   setnotification(true);
  //   setNotificationVisible(false);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
  setLoading('Upgrading sub account')

    if (!hin || !state || !email || !number || !password) {
      toast.error("All fields must be filled before submission.");
      return;
    }

 
  
    const requestData = {
      subaccount_HIN: hin,
      subaccount_email: email,
      subaccount_phone_num: number,
      subaccount_password: password,
      subaccount_state: state,
    };

    console.log(requestData)
  
    try {
         const token = localStorage.getItem("jwtToken");
            if (!token) {
              toast.error("Authentication error. Please log in again.");
              return;
            }

      const response = await axios.post("https://docuhealth-backend-h03u.onrender.com/api/patient/subaccounts/upgrade", requestData, {
        headers: {
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json",
        },
      });
  
      if (response.status === 200 || response.status === 201) {
        toast.success("subaccount upgraded successfully!");
        setEmail("");
        setPassword("");
        setNumber("");
        setHin("");
        setState("");
  
        setLoading('Upgrade Now')
        localStorage.removeItem('jwtToken')
        localStorage.removeItem('userlogin')
        setnotification(true);
        setNotificationVisible(false);
      }
    } catch (error) {
      console.error("Error upgrading subaccount:", error);
      toast.error(
        error.response?.data?.message || "Failed to upgrading subaccount. Try again."
      );
    }finally{
      
      setLoading('Upgrade Now')
      setEmail("");
      setPassword("");
      setNumber("");
      setHin("");
      setState("");
    }
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

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Left Side */}
        <div className="hidden sm:flex flex-1 min-h-screen  items-center justify-center ">
          <div className="w-3/4 py-10" id="temp">
            <div className="pb-10">
              <img src={logo} alt="Logo" className="" />
            </div>
            <h2 className="text-2xl font-bold mb-2 "> Account Upgrade</h2>
            <p className="text-gray-600  mb-6">
              Simply upgrade this account to a standard with the necessary
              information below
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <p className="font-semibold pb-1">HIN (Mandatory) :</p>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded-lg pl-3 outline-none focus:border-blue-500"
                    value={hin}
                    onChange={(e) => setHin(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <p className="font-semibold pb-1">Phone Number (Mandatory) :</p>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full px-4 py-3 border rounded-lg pl-3 outline-none focus:border-blue-500"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    required
                  />
                </div>

                {/* Password Input */}
              </div>

              <div className="relative">
                <p className="font-semibold pb-1">Password:</p>
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
                {loading ? loading : 'Upgrade Now'}
              </button>
            </form>
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
              Account Upgraded Successfully
            </p>
            <div className="flex justify-center w-full">
              <button
                className="bg-[#0000FF] w-full rounded-full text-white px-4 py-2 "
                onClick={() => {
                  setnotification(false)
                  navigate('/user-login')
                }}
              >
                Go To Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
      {notificationVisible && (
        <div className=" fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 ">
          <div className="fixed bottom-0 left-0 right-0 bg-white text-black py-4 rounded-t-3xl shadow-md animate-slide-up">
            <div className="flex justify-center items-center px-5 pb-4">
              <div className="flex items-center gap-1">
                <img src={logo} alt="DocuHealth Logo" className="h-8" />
                <h1 className="text-[#0000FF] text-3xl font-bold">
                  DocuHealth
                </h1>
              </div>
            </div>

            <div className="px-5">
              <h2 className="text-xl sm:text-2xl mb-2">Upgrade Your Account</h2>
              <p className="text-gray-600 mb-6">
                Fill in all details correctly before proceeding.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                <p className="font-semibold pb-1">HIN (Mandatory) :</p>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded-lg pl-3 outline-none focus:border-blue-500"
                    value={hin}
                    onChange={(e) => setHin(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <p className="font-semibold pb-1">Phone Number (Mandatory) :</p>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full px-4 py-3 border rounded-lg pl-3 outline-none focus:border-blue-500"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    required
                  />
                </div>

                {/* Password Input */}
              </div>

              <div className="relative">
                <p className="font-semibold pb-1">Password:</p>
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
                <button
                  type="submit"
                  className={`w-full py-3 rounded-full ${
                    isFormValid
                      ? "bg-[#0000FF] text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!isFormValid}
                  onClick={handleSubmit}
                >
                 {loading ? loading : 'Upgrade Now'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SAU;
