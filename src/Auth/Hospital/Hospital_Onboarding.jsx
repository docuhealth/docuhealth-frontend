import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import docuhealth_logo from "../../assets/img/docuhealth_logo.png";
import dashb from "../../assets/img/dashb.png";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";
import axios from "axios";
import { Link } from "react-router-dom";
import { authAPI } from "../../utils/authAPI";
import { Country, State, City } from 'country-state-city';

const Hospital_Onboarding = () => {
    const navigate = useNavigate();

    const [verification_token, setVerificationToken] = useState("");
    const [verification_request, setVerificationRequest] = useState("");
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const requestId = params.get("request_id");

        if (!token || !requestId) {
            toast.error("Invalid or missing onboarding parameters.");
            setTimeout(() => navigate("/"), 1500);
        } else {
            // ✅ Update state
            setVerificationToken(token);
            setVerificationRequest(requestId);
            console.log("✅ Token:", token);
            console.log("✅ Request ID:", requestId);
        }
    }, [navigate]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phone_num, setPhone_Num] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1); // To manage steps
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [passwordRequirements, setPasswordRequirements] = useState({
        hasLowercase: false,
        hasUppercase: false,
        hasNumber: false,
        hasSymbol: false,
        hasMinLength: false,
    });

    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [street, setStreet] = useState("");
    const [houseNO, setHouseNO] = useState("");
    const [state, setState] = useState("");
    const [country, setCountry] = useState("");

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);

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
        // Load all countries on mount
        const allCountries = Country.getAllCountries();
        setCountries(allCountries);
    }, []);

    // Update states when country changes
    useEffect(() => {
        if (country) {
            const selectedCountry = countries.find(c => c.name === country);
            if (selectedCountry) {
                const countryStates = State.getStatesOfCountry(selectedCountry.isoCode);
                setStates(countryStates);
            } else {
                setStates([]);
            }
            setState("");  // reset state
            setCities([]); // reset cities
            setCity("");   // reset city
        }
    }, [country, countries]);

    // Fetch cities when state changes
    useEffect(() => {
        if (country && state) {
            const selectedCountry = countries.find(c => c.name === country);
            if (!selectedCountry) return;

            const stateCities = selectedCountry ? City.getCitiesOfState(selectedCountry.isoCode, state) : [];
            setCities(stateCities || []);
            setCity(""); // reset city
        } else {
            setCities([]);
        }
    }, [state, country, countries]);

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
            email && name &&
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setShowToast(true);

        const payload = {
            email,
            password,
            profile: {
                name,
                country,
                state,
                city,
                street,
                house_no: houseNO,
            },
            verification_token,
            verification_request
        };
        console.log(payload)
        try {
            const response = await authAPI("POST", "api/hospitals", payload, {
                headers: { "Content-Type": "application/json" },
            });

            console.log(response);
            toast.success("Registration successful!");
            toast.success("Kindly check your email for your login link !");
            setTimeout(() => {
                navigate("/");
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
            setName("");
            setPhone_Num("");
            setPassword("");
            setConfirmPassword("");


            //   // Step 2 fields

            setCountry("");
            setState("");
            setCity("");
            setStreet("");
            setHouseNO("");
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
                                        Onboard Your Hospital
                                    </h2>
                                    <p className="text-gray-600  mb-6 text-sm">
                                        Create your account with your correct credentials to get
                                        onboarded
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
                                        {/* Hospital Name Input */}
                                        <div className="relative pb-3">
                                            <p className="font-semibold pb-1">Hospital Name :</p>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-3 border rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                                                    placeholder="e.g Jarus Hospital"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        {/* <div className="relative pb-3">
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
                                        </div> */}
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
                                        <div className="relative pb-6">
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
                                        <button
                                            type="button"
                                            onClick={handleNextStep}
                                            className={`w-full py-3  rounded-full transition-colors ${isPasswordValid &&
                                                email && name &&
                                                confirmPassword &&
                                                password === confirmPassword
                                                ? "bg-[#3E4095] text-white"
                                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                }`}
                                            disabled={
                                                !isPasswordValid || !name ||
                                                !email ||
                                                !confirmPassword ||
                                                password !== confirmPassword
                                            }
                                        >
                                            {isPasswordValid && name &&
                                                email &&
                                                confirmPassword &&
                                                password === confirmPassword
                                                ? "Move to Step 2 / 3"
                                                : "Complete all fields to continue"}
                                        </button>
                                    </form>
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
                                                        <option key={c.isoCode} value={c.name}>
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
                                                        <option key={s.isoCode} value={s.isoCode}>
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
                                                    {cities.map((c) => (
                                                        <option key={c.name} value={c.name}>
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
                                        <div className="relative pb-6">
                                            <p className="font-semibold pb-1">
                                                Hospital House Number (optional):
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
                                            {isSubmitting ? (<div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Submitting...
                                            </div>) : ("Sign Up Now")}
                                        </button>

                                    </form>

                                </div>
                            </>) : null}
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
                            <div className="w-full px-5 flex  flex-col justify-center min-h-screen " id="temp">
                                <h2 className="text-xl font-semibold pb-1">
                                    Onboard Your Hospital
                                </h2>
                                <p className="text-gray-600  mb-6 text-sm">
                                    Create your account with your correct credentials to get
                                    onboarded
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
                                    {/* Hospital Name Input */}
                                    <div className="relative pb-3">
                                        <p className="font-semibold pb-1">Hospital Name :</p>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 border rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                                                placeholder="e.g Jarus Hospital"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    {/* <div className="relative pb-3">
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
                                    </div> */}
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
                                    <div className="relative pb-6">
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
                                                    <option key={c.isoCode} value={c.name}>
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
                                                    <option key={s.isoCode} value={s.isoCode}>
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
                                                {cities.map((c) => (
                                                    <option key={c.name} value={c.name}>
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
                                    <div className="relative pb-6">
                                        <p className="font-semibold pb-1">
                                            Hospital House Number (optional):
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
                                        {isSubmitting ? (<div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Submitting...
                                        </div>) : ("Sign Up Now")}
                                    </button>

                                </form>

                            </div>
                        </>) : null}
                </div>
            </div>
        </>
    );
};

export default Hospital_Onboarding;
