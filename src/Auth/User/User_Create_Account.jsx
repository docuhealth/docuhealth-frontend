import React, { useState, useEffect } from "react";
import docuhealth_logo from "../../assets/img/docuhealth_logo.png";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa"; // React Icons
import dashb from "../../assets/img/dashb.png";
import { Link } from "react-router-dom";
import { authAPI } from "../../utils/authAPI";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ULP = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone_num, setPhone_Num] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // To manage steps

  // Password validation states
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSymbol: false,
    hasMinLength: false,
  });
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [gender, setGender] = useState("");
  const [referred_by, setReferred_by] = useState("");
  const [role, setRole] = useState("patient");
  const [DOB, setDOB] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [houseNO, setHouseNO] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (showToast) {
      timer = setTimeout(() => {
        toast.success(
          "Kindly exercise patience, while your account is being created!"
        );
        setShowToast(false); // Reset state after toast is shown
      }, 3000);
    }

    return () => clearTimeout(timer); // Cleanup timeout on unmount
  }, [showToast]);

  // Fetch all countries + states
  useEffect(() => {
    const fetchCountriesStates = async () => {
      try {
        const response = await axios.get(
          "https://countriesnow.space/api/v0.1/countries/states"
        );
        setCountries(response.data.data);
      } catch (error) {
        console.error("Error fetching countries & states:", error);
      }
    };
    fetchCountriesStates();
  }, []);

  // Update states when country changes
  useEffect(() => {
    if (country) {
      const selected = countries.find((c) => c.name === country);
      setStates(selected?.states || []);
      setState("");
      setCities([]);
    }
  }, [country, countries]);

  // Fetch cities when state changes
  useEffect(() => {
    if (country && state) {
      const fetchCities = async () => {
        try {
          const response = await axios.post(
            "https://countriesnow.space/api/v0.1/countries/state/cities",
            { country, state }
          );
          setCities(response.data.data);
        } catch (error) {
          console.error("Error fetching cities:", error);
        }
      };
      fetchCities();
    }
  }, [state, country]);

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
    if (!password) return { strength: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

    if (score <= 1)
      return { strength: score, label: "Very Weak", color: "bg-red-500" };
    if (score <= 2)
      return { strength: score, label: "Weak", color: "bg-orange-500" };
    if (score <= 3)
      return { strength: score, label: "Fair", color: "bg-yellow-500" };
    if (score <= 4)
      return { strength: score, label: "Good", color: "bg-[#3E4095]" };
    return { strength: score, label: "Strong", color: "bg-green-500" };
  };

  const handleNextStep = () => {
    // Check if the form is completed before allowing to move to next step
    if (
      email &&
      password &&
      confirmPassword &&
      password === confirmPassword &&
      isPasswordValid
    ) {
      setStep(2); // Move to Step 2
    } else if (!isPasswordValid && password) {
      toast.error("Please ensure your password meets all requirements.");
    } else {
      toast.error("Please fill all fields correctly.");
    }
  };
  const handleFinalStep = () => {
    // Check if the form is completed before allowing to move to next step
    if (firstName && lastName && gender) {
      setStep(3); // Move to Step 2
    } else {
      toast.error("Please fill all fields correctly.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowToast(true);

    const payload = {
      email,
      password,
      profile: {
        dob: DOB,
        gender,
        phone_num,
        firstname: firstName,
        lastname: lastName,
        middlename: middleName,
        role,
        street,
        city,
        state,
        country,
        house_no: houseNO,
      },

      // ...(referred_by && { referred_by }), // only include if exists
    };
    // console.log(payload)
    try {
      const response = await authAPI("POST", "api/patients", payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log(response);
      toast.success("Registration successful!");
      toast.success("Kindly check your email for OTP verification!");
      setTimeout(() => {
        navigate("/user-create-account-verify-otp");
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error.message || "Something went wrong. Please refresh and try again."
      );
    } finally {
      setIsSubmitting(false);

      // reset step
      setStep(1);

      // Step 1 fields
      setEmail("");
      setPhone_Num("");
      setPassword("");
      setConfirmPassword("");

      // Step 2 fields
      setFirstName("");
      setLastName("");
      setMiddleName("");
      setDOB("");
      setGender("");

      // Step 3 fields
      setCountry("");
      setState("");
      setCity("");
      setStreet("");
      setHouseNO("");
      setReferred_by("");
    }
  };

  return (
    <>
      <div className=" hidden h-screen sm:flex">
        {/* Left Side */}
        <div className="  w-1/2 h-full overflow-y-scroll hide-scrollbar flex-1 ">
          <div className="hidden sm:flex flex-col  items-start justify-center  py-10 ">
            <Link to="/">
              <div className="pl-10 pb-10 flex gap-1 items-center font-semibold text-[#3E4095]">
                <img src={docuhealth_logo} alt="Logo" className="w-6" />
                <h1 className="text-xl">DocuHealth</h1>
              </div>
            </Link>

            {step === 1 ? (
              <>
                <div className="w-full px-10 " id="temp">
                  <h2 className="text-xl font-semibold pb-1">
                    Create Your Account
                  </h2>
                  <p className="text-gray-600  mb-6 text-sm">
                    Create your account with your correct credentials to get
                    started
                  </p>

                  <form className=" text-sm">
                    {/* Email Input */}
                    <div className="relative pb-3">
                      <p className="font-semibold pb-1">Email address :</p>
                      <div className="relative">
                        <input
                          type="email"
                          className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-[#3E4095]"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                        <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="relative pb-3">
                      <p className="font-semibold pb-1">
                        Phone number (optional) :
                      </p>
                      <div className="relative">
                        <input
                          type="number"
                          className="w-full px-4 py-3 border rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                          value={phone_num}
                          onChange={(e) => setPhone_Num(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="relative pb-3">
                      <p className="font-semibold pb-1">Password :</p>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder=""
                          className={`w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-[#3E4095] ${password && !isPasswordValid
                              ? "focus:border-red-500"
                              : ""
                            }`}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            validatePassword(e.target.value);
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

                      {/* Password Requirements Checker */}
                      {password && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          {/* Password Strength Indicator */}
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-700">
                                Password Strength:
                              </span>
                              <span
                                className={`text-sm font-medium ${getPasswordStrength(
                                  password
                                ).color.replace("bg-", "text-")}`}
                              >
                                {getPasswordStrength(password).label}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(password).color
                                  }`}
                                style={{
                                  width: `${(getPasswordStrength(password).strength /
                                      5) *
                                    100
                                    }%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Password Requirements:
                          </p>
                          <div className="space-y-1">
                            <div
                              className={`flex items-center text-sm ${passwordRequirements.hasLowercase
                                  ? "text-green-600"
                                  : "text-red-500"
                                }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.hasLowercase
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                  }`}
                              ></span>
                              Include lowercase letters (a-z)
                            </div>
                            <div
                              className={`flex items-center text-sm ${passwordRequirements.hasUppercase
                                  ? "text-green-600"
                                  : "text-red-500"
                                }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.hasUppercase
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                  }`}
                              ></span>
                              Include uppercase letters (A-Z)
                            </div>
                            <div
                              className={`flex items-center text-sm ${passwordRequirements.hasNumber
                                  ? "text-green-600"
                                  : "text-red-500"
                                }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.hasNumber
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                  }`}
                              ></span>
                              Include at least one number (0-9)
                            </div>
                            <div
                              className={`flex items-center text-sm ${passwordRequirements.hasSymbol
                                  ? "text-green-600"
                                  : "text-red-500"
                                }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.hasSymbol
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                  }`}
                              ></span>
                              Include at least one symbol (!@#$%^&*)
                            </div>
                            <div
                              className={`flex items-center text-sm ${passwordRequirements.hasMinLength
                                  ? "text-green-600"
                                  : "text-red-500"
                                }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.hasMinLength
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                  }`}
                              ></span>
                              Be at least 8 characters long
                            </div>
                          </div>
                          {isPasswordValid && (
                            <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded-sm">
                              <p className="text-sm text-green-700 font-medium">
                                ✓ Password meets all requirements!
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Confirm Password Input */}
                    <div className="relative pb-8">
                      <p className="font-semibold pb-1">Confirm Password :</p>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder=""
                          className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-[#3E4095]"
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
                      className={`w-full py-3  rounded-full transition-colors ${isPasswordValid &&
                          email &&
                          confirmPassword &&
                          password === confirmPassword
                          ? "bg-[#3E4095] text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      disabled={
                        !isPasswordValid ||
                        !email ||
                        !confirmPassword ||
                        password !== confirmPassword
                      }
                    >
                      {isPasswordValid &&
                        email &&
                        confirmPassword &&
                        password === confirmPassword
                        ? "Move to Step 2 / 3"
                        : "Complete all fields to continue"}
                    </button>
                  </form>

                  {/* Sign-In Prompt */}
                  <p className="text-center text-sm text-gray-600 mt-3">
                    Already have an account?{" "}
                    <Link
                      to="/user-login"
                      className="text-[#3E4095] hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            ) : step === 2 ? (
              <>
                <div className="w-full px-10 " id="temp">
                  <h2 className="text-xl font-semibold pb-1 ">
                    Create Your Account
                  </h2>
                  <p className="text-gray-600  mb-6 text-sm">
                    Create your account with your correct credentials to get
                    started
                  </p>

                  <form className="text-sm">
                    <div className="relative pb-3">
                      <p className="font-semibold pb-1">First Name :</p>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full px-4 py-3 border rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="relative pb-3">
                      <p className="font-semibold pb-1">Last Name :</p>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full px-4 py-3 border rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="relative pb-3">
                      <p className="font-semibold pb-1">Middle Name :</p>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full px-4 py-3 border rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                          value={middleName}
                          onChange={(e) => setMiddleName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="relative pb-3">
                      <p className="font-semibold pb-1">Date Of Birth :</p>
                      <div className="relative">
                        <input
                          type="date"
                          className="w-full px-4 py-3 border rounded-lg outline-hidden focus:border-[#3E4095] appearance-none pr-10"
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
                    <div className="relative pb-8">
                      <p className="font-semibold pb-1">Gender :</p>
                      <div className="relative">
                        <select
                          className="w-full px-4 py-3 border rounded-lg outline-hidden focus:border-[#3E4095] appearance-none pr-10"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          required
                        >
                          <option value="" disabled>
                            Select Gender
                          </option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
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
                      onClick={handleFinalStep}
                      className={`w-full transition-colors py-3 rounded-full  ${firstName && lastName && middleName && DOB && gender
                          ? "bg-[#3E4095] text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      disabled={
                        !firstName ||
                        !lastName ||
                        !middleName ||
                        !DOB ||
                        !gender
                      }
                    >
                      Move to step 3 / 3
                    </button>
                  </form>

                  {/* Sign-In Prompt */}
                  <p className="text-center text-sm text-gray-600 mt-3">
                    Already have an account?{" "}
                    <Link
                      to="/user-login"
                      className="text-[#3E4095] hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            ) : step === 3 ? (
              <>
                <div
                  className="w-full px-10"
                  id="temp"
                  style={{ display: step === 3 ? "block" : "none" }}
                >
                  <h2 className="text-xl font-semibold pb-1 ">
                    Create Your Account
                  </h2>
                  <p className="text-gray-600  mb-6 text-sm">
                    Create your account with your correct credentials to get
                    started
                  </p>

                  <form className="text-sm">
                    <div className="relative pb-3">
                      <p className="font-semibold pb-1">Country :</p>
                      <div className="relative w-full">
                        <select
                          className="border border-gray-300 px-4 py-3 rounded-lg w-full focus:border-[#3E4095] outline-hidden appearance-none pr-10"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          required
                        >
                          <option value="" selected>
                            -- Select a country --
                          </option>
                          {countries.map((c) => (
                            <option key={c.iso2} value={c.name}>
                              {c.name}
                            </option>
                          ))}
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
                    <div className="relative pb-3">
                      <p className="font-semibold pb-1">State Of Residence :</p>
                      <div className="relative w-full">
                        <select
                          className="border border-gray-300 px-4 py-3 rounded-lg w-full focus:border- outline-hidden appearance-none pr-10"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          disabled={!states.length}
                          required
                        >
                          <option value="" seleceted>
                            -- Select your state --
                          </option>
                          {states.map((s) => (
                            <option key={s.name} value={s.name}>
                              {s.name}
                            </option>
                          ))}
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
                    <div className="relative pb-3">
                      <p className="font-semibold pb-1">City :</p>
                      <div className="relative w-full">
                        <select
                          className="border border-gray-300 px-4 py-3 rounded-lg w-full focus:border- outline-hidden appearance-none pr-10"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                        >
                          <option value="" selected>
                            -- Select City --
                          </option>
                          {cities.map((c, i) => (
                            <option key={i} value={c}>
                              {c}
                            </option>
                          ))}
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
                    <div className="relative pb-3">
                      <p className="font-semibold pb-1">Name of Street :</p>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                          placeholder="e.g olorunda street"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="relative pb-3">
                      <p className="font-semibold pb-1">
                        House Number (optional):
                      </p>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                          placeholder="e.g No. 1234"
                          value={houseNO}
                          onChange={(e) => setHouseNO(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="relative pb-4">
                      <p className="font-semibold pb-1">
                        Referred By (optional) :
                      </p>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full px-4 py-3 border rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                          value={referred_by}
                          onChange={(e) => setReferred_by(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 pb-6">
                      By Signing up, you agree to our{" "}
                      <Link
                        to="/privacy-policy"
                        className="text-[#3E4095] hover:underline"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </p>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className={`w-full transition-colors py-3 rounded-full ${country &&
                          state &&
                          city &&
                          street &&
                          houseNO &&
                          !isSubmitting
                          ? "bg-[#3E4095] text-white "
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        } `}
                      disabled={
                        !country ||
                        !state ||
                        !city ||
                        !street ||
                        !houseNO ||
                        isSubmitting
                      }
                    >
                 {isSubmitting ? (     <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </div> ): ("Sign Up Now")}
                    </button>
                  </form>

                  <p className="text-center text-sm text-gray-600 mt-3">
                    Already have an account?{" "}
                    <Link
                      to="/user-login"
                      className="text-[#3E4095] hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>
        {/* Right Side */}
        <div
          className="w-1/2 h-screen flex flex-col justify-center items-center p-4 flex-1"
          style={{
            background: "linear-gradient(to bottom, #3E4095, #718FCC)",
          }}
        >
          <div className="">
            <p className="text-white font-semibold text-xl sm:text-2xl pb-1">
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

      <div className="h-screen sm:hidden">
        <div className="h-full overflow-y-scroll hide-scrollbar py-10">
          <div className="pl-5 flex gap-1 items-center font-semibold text-[#3E4095]">
            <img src={docuhealth_logo} alt="Logo" className="w-6" />
            <h1 className="text-xl">DocuHealth</h1>
          </div>
          {step === 1 ? (
            <>
              <div className="w-full px-5 flex  flex-col justify-center h-screen " id="temp">
                <h2 className="text-xl font-semibold pb-1">
                  Create Your Account
                </h2>
                <p className="text-gray-600  mb-6 text-sm">
                  Create your account with your correct credentials to get
                  started
                </p>

                <form className=" text-sm">
                  {/* Email Input */}
                  <div className="relative pb-3">
                    <p className="font-semibold pb-1">Email address :</p>
                    <div className="relative">
                      <input
                        type="email"
                        className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-[#3E4095]"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="relative pb-3">
                    <p className="font-semibold pb-1">
                      Phone number (optional) :
                    </p>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full px-4 py-3 border rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                        value={phone_num}
                        onChange={(e) => setPhone_Num(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="relative pb-3">
                    <p className="font-semibold pb-1">Password :</p>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder=""
                        className={`w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-[#3E4095] ${password && !isPasswordValid
                            ? "focus:border-red-500"
                            : ""
                          }`}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          validatePassword(e.target.value);
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

                    {/* Password Requirements Checker */}
                    {password && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        {/* Password Strength Indicator */}
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              Password Strength:
                            </span>
                            <span
                              className={`text-sm font-medium ${getPasswordStrength(
                                password
                              ).color.replace("bg-", "text-")}`}
                            >
                              {getPasswordStrength(password).label}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(password).color
                                }`}
                              style={{
                                width: `${(getPasswordStrength(password).strength / 5) *
                                  100
                                  }%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Password Requirements:
                        </p>
                        <div className="space-y-1">
                          <div
                            className={`flex items-center text-sm ${passwordRequirements.hasLowercase
                                ? "text-green-600"
                                : "text-red-500"
                              }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.hasLowercase
                                  ? "bg-green-500"
                                  : "bg-red-500"
                                }`}
                            ></span>
                            Include lowercase letters (a-z)
                          </div>
                          <div
                            className={`flex items-center text-sm ${passwordRequirements.hasUppercase
                                ? "text-green-600"
                                : "text-red-500"
                              }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.hasUppercase
                                  ? "bg-green-500"
                                  : "bg-red-500"
                                }`}
                            ></span>
                            Include uppercase letters (A-Z)
                          </div>
                          <div
                            className={`flex items-center text-sm ${passwordRequirements.hasNumber
                                ? "text-green-600"
                                : "text-red-500"
                              }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.hasNumber
                                  ? "bg-green-500"
                                  : "bg-red-500"
                                }`}
                            ></span>
                            Include at least one number (0-9)
                          </div>
                          <div
                            className={`flex items-center text-sm ${passwordRequirements.hasSymbol
                                ? "text-green-600"
                                : "text-red-500"
                              }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.hasSymbol
                                  ? "bg-green-500"
                                  : "bg-red-500"
                                }`}
                            ></span>
                            Include at least one symbol (!@#$%^&*)
                          </div>
                          <div
                            className={`flex items-center text-sm ${passwordRequirements.hasMinLength
                                ? "text-green-600"
                                : "text-red-500"
                              }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.hasMinLength
                                  ? "bg-green-500"
                                  : "bg-red-500"
                                }`}
                            ></span>
                            Be at least 8 characters long
                          </div>
                        </div>
                        {isPasswordValid && (
                          <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded-sm">
                            <p className="text-sm text-green-700 font-medium">
                              ✓ Password meets all requirements!
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Input */}
                  <div className="relative pb-8">
                    <p className="font-semibold pb-1">Confirm Password :</p>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder=""
                        className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-[#3E4095]"
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
                    className={`w-full py-3  rounded-full transition-colors ${isPasswordValid &&
                        email &&
                        confirmPassword &&
                        password === confirmPassword
                        ? "bg-[#3E4095] text-white "
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    disabled={
                      !isPasswordValid ||
                      !email ||
                      !confirmPassword ||
                      password !== confirmPassword
                    }
                  >
                    {isPasswordValid &&
                      email &&
                      confirmPassword &&
                      password === confirmPassword
                      ? "Move to Step 2 / 3"
                      : "Complete all fields to continue"}
                  </button>
                </form>

                {/* Sign-In Prompt */}
                <p className="text-center text-sm text-gray-600 mt-3">
                  Already have an account?{" "}
                  <Link
                    to="/user-login"
                    className="text-[#3E4095] hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          ) : step === 2 ? (
            <>
              <div className="w-full px-5 flex  flex-col justify-center h-screen " id="temp">
                <h2 className="text-xl font-semibold pb-1 ">
                  Create Your Account
                </h2>
                <p className="text-gray-600  mb-6 text-sm">
                  Create your account with your correct credentials to get
                  started
                </p>

                <form className="text-sm">
                  <div className="relative pb-3">
                    <p className="font-semibold pb-1">First Name :</p>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-3 border rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="relative pb-3">
                    <p className="font-semibold pb-1">Last Name :</p>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-3 border rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="relative pb-3">
                    <p className="font-semibold pb-1">Middle Name :</p>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-3 border rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="relative pb-3">
                    <p className="font-semibold pb-1">Date Of Birth :</p>
                    <div className="relative">
                      <input
                        type="date"
                        className="w-full px-4 py-3 border rounded-lg outline-hidden focus:border-[#3E4095] appearance-none pr-10"
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
                  <div className="relative pb-8">
                    <p className="font-semibold pb-1">Gender :</p>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 border rounded-lg outline-hidden focus:border-[#3E4095] appearance-none pr-10"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          Select Gender
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
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
                    onClick={handleFinalStep}
                    className={`w-full transition-colors py-3 rounded-full  ${firstName && lastName && middleName && DOB && gender
                        ? "bg-[#3E4095] text-white "
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    disabled={
                      !firstName || !lastName || !middleName || !DOB || !gender
                    }
                  >
                    Move to step 3 / 3
                  </button>
                </form>

                {/* Sign-In Prompt */}
                <p className="text-center text-sm text-gray-600 mt-3">
                  Already have an account?{" "}
                  <Link
                    to="/user-login"
                    className="text-[#3E4095] hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          ) : step === 3 ? (
            <>
              <div
                className="w-full px-5 flex  flex-col justify-center h-screen"
                id="temp"
                style={{ display: step === 3 ? "block" : "none" }}
              >
                <h2 className="text-xl font-semibold pb-1 ">
                  Create Your Account
                </h2>
                <p className="text-gray-600  mb-6 text-sm">
                  Create your account with your correct credentials to get
                  started
                </p>

                <form className="text-sm">
                  <div className="relative pb-3">
                    <p className="font-semibold pb-1">Country :</p>
                    <div className="relative w-full">
                      <select
                        className="border border-gray-300 px-4 py-3 rounded-lg w-full focus:border-[#3E4095] outline-hidden appearance-none pr-10"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                      >
                        <option value="" selected>
                          -- Select a country --
                        </option>
                        {countries.map((c) => (
                          <option key={c.iso2} value={c.name}>
                            {c.name}
                          </option>
                        ))}
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
                  <div className="relative pb-3">
                    <p className="font-semibold pb-1">State Of Residence :</p>
                    <div className="relative w-full">
                      <select
                        className="border border-gray-300 px-4 py-3 rounded-lg w-full focus:border-[#3E4095] outline-hidden appearance-none pr-10"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        disabled={!states.length}
                        required
                      >
                        <option value="" seleceted>
                          -- Select your state --
                        </option>
                        {states.map((s) => (
                          <option key={s.name} value={s.name}>
                            {s.name}
                          </option>
                        ))}
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
                  <div className="relative pb-3">
                    <p className="font-semibold pb-1">City :</p>
                    <div className="relative w-full">
                      <select
                        className="border border-gray-300 px-4 py-3 rounded-lg w-full focus:border-[#3E4095] outline-hidden appearance-none pr-10"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      >
                        <option value="" selected>
                          -- Select City --
                        </option>
                        {cities.map((c, i) => (
                          <option key={i} value={c}>
                            {c}
                          </option>
                        ))}
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
                  <div className="relative pb-3">
                    <p className="font-semibold pb-1">Name of Street :</p>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                        placeholder="e.g olorunda street"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="relative pb-3">
                    <p className="font-semibold pb-1">
                      House Number (optional):
                    </p>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                        placeholder="e.g No. 1234"
                        value={houseNO}
                        onChange={(e) => setHouseNO(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="relative pb-4">
                    <p className="font-semibold pb-1">
                      Referred By (optional) :
                    </p>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-3 border rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                        value={referred_by}
                        onChange={(e) => setReferred_by(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 pb-6">
                    By Signing up, you agree to our{" "}
                    <Link
                      to="/privacy-policy"
                      className="text-[#3E4095] hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className={`w-full transition-colors py-3 rounded-full ${country &&
                        state &&
                        city &&
                        street &&
                        houseNO &&
                        !isSubmitting
                        ? "bg-[#3E4095] text-white "
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      } `}
                    disabled={
                      !country ||
                      !state ||
                      !city ||
                      !street ||
                      !houseNO ||
                      isSubmitting
                    }
                  >
                    {isSubmitting ? (     <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </div> ): ("Sign Up Now")}
                  </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-3">
                  Already have an account?{" "}
                  <Link
                    to="/user-login"
                    className="text-[#3E4095] hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default ULP;
