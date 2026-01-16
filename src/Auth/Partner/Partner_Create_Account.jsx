import React, { useState, useEffect } from "react";
import docuhealth_logo from "../../assets/img/docuhealth_logo.png";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa"; // React Icons
import dashb from "../../assets/img/dashb.png";
import { Link } from "react-router-dom";
import { authAPI } from "../../utils/authAPI";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Country, State, City } from 'country-state-city';

const Partner_Create_Account = () => {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const[step, setStep] = useState(1)



    const [passwordRequirements, setPasswordRequirements] = useState({
        hasLowercase: false,
        hasUppercase: false,
        hasNumber: false,
        hasSymbol: false,
        hasMinLength: false,
    });
    const [isPasswordValid, setIsPasswordValid] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);

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
        // Validation for Step 2: Personal Information
        if (email && password && password === confirmPassword) {
            setStep(2); // Move to Step 3 (Address & Submit)
        } else {
            toast.error("Please provide the correct credentials.");
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
                address,
                phone
            }
        }

        try {

            console.log(payload)
        } catch (error) {
            console.error("Error:", error);
            toast.error(
                error.detail || "Something went wrong. Please refresh and try again."
            );
        } finally {
            setIsSubmitting(false);

            setEmail('')
            setName('')
            setPhone('')
            setPassword('')
            setConfirmPassword('')
            setAddress('')

        }

    }


    return (
        <>
            <div className=" hidden h-screen sm:flex">
                <div className="  w-1/2 h-full overflow-y-scroll hide-scrollbar flex-1 ">
                    <div className="hidden sm:flex flex-col  items-start justify-center  py-10 ">
                        <Link to="/">
                            <div className="pl-10 pb-10 flex gap-1 items-center font-semibold text-[#3E4095]">
                                <img src={docuhealth_logo} alt="Logo" className="w-6" />
                                <h1 className="text-xl">DocuHealth</h1>
                            </div>
                        </Link>

                        <div className="w-full px-10 " id="temp">
                            <h2 className="text-xl font-semibold pb-1">
                                Create Your Account
                            </h2>
                            <p className="text-gray-600  mb-6 text-sm">
                                Create your account with your correct credentials to get
                                started
                            </p>

                            <form className="text-sm">
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
                                    <p className="font-semibold pb-1">Full Name :</p>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="relative pb-3">
                                    <p className="font-semibold pb-1">
                                        Phone number :
                                    </p>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 border rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="relative pb-3">
                                    <p className="font-semibold pb-1">Address :</p>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
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
                                    className={`w-full transition-colors py-3 rounded-full ${name &&
                                        email &&
                                        phone && address &&
                                        isPasswordValid &&
                                        confirmPassword === password &&
                                        !isSubmitting
                                        ? "bg-[#3E4095] text-white hover:bg-[#33357a]"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}

                                    disabled={
                                        !name ||
                                        !email ||
                                        !phone ||
                                        !address ||
                                        !isPasswordValid ||
                                        confirmPassword !== password ||
                                        isSubmitting
                                    }
                                >
                                    {isSubmitting ? (<div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Submitting...
                                    </div>) : ("Sign Up Now")}
                                </button>

                            </form>

                            <p className="text-center text-sm text-gray-600 mt-3">
                                Already have an account?{" "}
                                <Link
                                    to="/partner-login"
                                    className="text-[#3E4095] hover:underline"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
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
                    <Link to="/">
                        <div className="pl-5 flex gap-1 items-center font-semibold text-[#3E4095]">
                            <img src={docuhealth_logo} alt="Logo" className="w-6" />
                            <h1 className="text-xl">DocuHealth</h1>
                        </div>
                    </Link>

                    <div className="w-full px-5 flex  flex-col justify-center h-screen " id="temp">
                        <h2 className="text-xl font-semibold pb-1">
                            Create Your Account
                        </h2>
                        <p className="text-gray-600  mb-6 text-sm">
                            Create your account with your correct credentials to get
                            started
                        </p>

                        <form className="text-sm">
                            {step === 1 && (
                                <>

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

                                    <button
                                        type="button"
                                        onClick={handleNextStep}
                                        className={`w-full transition-colors py-3 rounded-full ${
                                            email &&
                                            isPasswordValid &&
                                            confirmPassword === password 
                                            ? "bg-[#3E4095] text-white hover:bg-[#33357a]"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            }`}

                                        disabled= {
                                            !email ||
                                            !isPasswordValid ||
                                            confirmPassword !== password 
                                        }
                                    >
                                        Next Step
                                    </button>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                          < div className="relative pb-3">
                                <p className="font-semibold pb-1">Full Name :</p>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="relative pb-3">
                                <p className="font-semibold pb-1">
                                    Phone number :
                                </p>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 border rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>



                            <div className="relative pb-3">
                                <p className="font-semibold pb-1">Address :</p>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border rounded-lg pl-3 outline-hidden focus:border-[#3E4095]"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
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
                                className={`w-full transition-colors py-3 rounded-full ${name &&
                                    email &&
                                    phone && address &&
                                    isPasswordValid &&
                                    confirmPassword === password &&
                                    !isSubmitting
                                    ? "bg-[#3E4095] text-white hover:bg-[#33357a]"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}

                                disabled={
                                    !name ||
                                    !email ||
                                    !phone ||
                                    !address ||
                                    !isPasswordValid ||
                                    confirmPassword !== password ||
                                    isSubmitting
                                }
                            >
                                {isSubmitting ? (<div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Submitting...
                                </div>) : ("Sign Up Now")}
                            </button>
                                </>
                            )}

                  

                        </form>

                        <p className="text-center text-sm text-gray-600 mt-3">
                  Already have an account?{" "}
                  <Link
                    to="/partner-login"
                    className="text-[#3E4095] hover:underline"
                  >
                    Sign in
                  </Link>
                </p>

                    </div>
                </div >
            </div >
        </>
    )
}

export default Partner_Create_Account