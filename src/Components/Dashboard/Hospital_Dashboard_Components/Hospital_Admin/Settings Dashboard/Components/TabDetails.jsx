import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import axiosInstance from '../../../../../../utils/axiosInstance'
import toast from 'react-hot-toast'


const AccountSettingsTab = () => {

    const [formData, setFormData] = useState({
        name: "",
        password: "",
        email: "",
        phone_num: "",
    });

    const [isAcctDeleteConfirmed, setIsAcctDeleteConfirmed] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isAcctDeleting, setIsAcctDeleting] = useState(false)
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [passwordRequirements, setPasswordRequirements] = useState({
        hasLowercase: false,
        hasUppercase: false,
        hasNumber: false,
        hasSymbol: false,
        hasMinLength: false,
    });

    // 🔹 Validate Password
    const validatePassword = (password) => {
        const requirements = {
            hasLowercase: /[a-z]/.test(password),
            hasUppercase: /[A-Z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
            hasMinLength: password.length >= 8,
        };

        setPasswordRequirements(requirements);
        setIsPasswordValid(Object.values(requirements).every(Boolean));
    };

    // 🔹 Password Strength Indicator
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

    // 🔹 Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === "password") {
            validatePassword(value);
        }
    };

    // 🔹 Handle Save Changes
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Separate password/email (root fields) from others (profile fields)
        const { email, password, ...profileFields } = formData;

        // Include only non-empty fields in profile
        const filledProfile = Object.fromEntries(
            Object.entries(profileFields).filter(([_, value]) => value.trim() !== "")
        );

        // Include non-empty email and password if present
        const payload = {
            ...(email.trim() && { email }),
            ...(password.trim() && { password }),
            ...(Object.keys(filledProfile).length > 0 && { profile: filledProfile }),
        };

        // Ensure there's something to send
        if (Object.keys(payload).length === 0) {
            toast.error("Please fill at least one field before saving changes.");
            return;
        }

        // Validate password if it's included
        if (payload.password && !isPasswordValid) {
            toast.error("Password does not meet all requirements.");
            return;
        }

        // setLoading(true);

        // try {
        //   const res = await axiosInstance.patch("api/patients/update", payload);
        //   toast.success("Account details updated successfully!");
        // } catch (error) {
        //   console.error("Error updating account:", error);
        //   toast.error("An error occurred while saving changes.");
        // } finally {
        //   setLoading(false);
        //   setFormData({
        // name: "",
        // password: "",
        // email: "",
        // phone_num: "",
        //   });
        //   setPasswordRequirements({
        //     hasLowercase: false,
        //     hasUppercase: false,
        //     hasNumber: false,
        //     hasSymbol: false,
        //     hasMinLength: false,
        //   });
        //   setIsPasswordValid(false);
        //   setShowPassword(false);
        // }
    };

    const handleCancel = () => {
        const confirmReset = window.confirm(
            "Are you sure you want to cancel and reset all changes?"
        );
        if (confirmReset) {
            setFormData({
                name: "",
                password: "",
                email: "",
                phone_num: "",
            });
            setPasswordRequirements({
                hasLowercase: false,
                hasUppercase: false,
                hasNumber: false,
                hasSymbol: false,
                hasMinLength: false,
            });
            setIsPasswordValid(false);
            setShowPassword(false);
        }
    };

    return (
        <>
            <div className="space-y-4">
                <div className="w-full  mx-auto ">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-2">
                            <div className="">
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full h-[38px] px-3 py-2 border rounded-md outline-hidden focus:border-[#3E4095] text-sm appearance-none "
                                />
                            </div>
                            {/* Email Input */}
                            <div className="">
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full h-[38px] px-3 py-2 border rounded-md outline-hidden focus:border-[#3E4095] text-sm appearance-none "
                                />
                            </div>
                            <div className="relative text-sm hidden sm:block">
                                <p className="font-medium mb-1 text-gray-700">New Password :</p>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder=""
                                        className={`w-full h-[38px] px-3 py-2 border rounded-md outline-hidden focus:border-[#3E4095] text-sm appearance-none pl-8 ${formData.password && !isPasswordValid
                                            ? "focus:border-red-500"
                                            : ""
                                            }`}
                                        value={formData.password}
                                        onChange={(e) => {
                                            handleChange(e);
                                        }}
                                    />
                                    <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute top-1/2 right-3 transform -translate-y-1/2"
                                    >
                                        {showPassword ? (
                                            <FaEyeSlash className="h-3 w-3 text-gray-400" />
                                        ) : (
                                            <FaEye className="h-3 w-3 text-gray-400" />
                                        )}
                                    </button>
                                </div>

                                {/* Password Requirements Checker */}
                                {formData.password && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-[12px]">
                                        {/* Password Strength Indicator */}
                                        <div className="mb-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[12px] font-medium text-gray-700">
                                                    Password Strength:
                                                </span>
                                                <span
                                                    className={` font-medium ${getPasswordStrength(
                                                        formData.password
                                                    ).color.replace("bg-", "text-")}`}
                                                >
                                                    {getPasswordStrength(formData.password).label}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(formData.password).color
                                                        }`}
                                                    style={{
                                                        width: `${(getPasswordStrength(formData.password).strength /
                                                            5) *
                                                            100
                                                            }%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <p className=" font-medium text-gray-700 mb-2">
                                            Password Requirements:
                                        </p>
                                        <div className="space-y-1">
                                            <div
                                                className={`flex items-center  ${passwordRequirements.hasLowercase
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
                                                className={`flex items-center  ${passwordRequirements.hasUppercase
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
                                                className={`flex items-center  ${passwordRequirements.hasNumber
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
                                                className={`flex items-center ${passwordRequirements.hasSymbol
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
                                                className={`flex items-center  ${passwordRequirements.hasMinLength
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

                            <div className="">
                                <label
                                    htmlFor="phone"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Phone Number
                                </label>
                                <input
                                    id="phone_num"
                                    name="phone_num"
                                    type="number"
                                    value={formData.phone_num}
                                    onChange={handleChange}
                                    className="w-full h-[38px] px-3 py-2 border rounded-md outline-hidden focus:border-[#3E4095] text-sm appearance-none "
                                />
                            </div>

                            <div className="relative text-sm sm:hidden">
                                <p className="font-medium mb-1 text-gray-700">New Password :</p>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder=""
                                        className={`w-full h-[38px] px-3 py-2 border rounded-md outline-hidden focus:border-[#3E4095] text-sm appearance-none pl-8 ${formData.password && !isPasswordValid
                                                ? "focus:border-red-500"
                                                : ""
                                            }`}
                                        value={formData.password}
                                        onChange={(e) => {
                                            handleChange(e);
                                        }}
                                    />
                                    <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute top-1/2 right-3 transform -translate-y-1/2"
                                    >
                                        {showPassword ? (
                                            <FaEyeSlash className="h-3 w-3 text-gray-400" />
                                        ) : (
                                            <FaEye className="h-3 w-3 text-gray-400" />
                                        )}
                                    </button>
                                </div>

                                {/* Password Requirements Checker */}
                                {formData.password && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-[12px]">
                                        {/* Password Strength Indicator */}
                                        <div className="mb-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[12px] font-medium text-gray-700">
                                                    Password Strength:
                                                </span>
                                                <span
                                                    className={` font-medium ${getPasswordStrength(
                                                        formData.password
                                                    ).color.replace("bg-", "text-")}`}
                                                >
                                                    {getPasswordStrength(formData.password).label}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(formData.password).color
                                                        }`}
                                                    style={{
                                                        width: `${(getPasswordStrength(formData.password).strength /
                                                                5) *
                                                            100
                                                            }%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <p className=" font-medium text-gray-700 mb-2">
                                            Password Requirements:
                                        </p>
                                        <div className="space-y-1">
                                            <div
                                                className={`flex items-center  ${passwordRequirements.hasLowercase
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
                                                className={`flex items-center  ${passwordRequirements.hasUppercase
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
                                                className={`flex items-center  ${passwordRequirements.hasNumber
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
                                                className={`flex items-center ${passwordRequirements.hasSymbol
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
                                                className={`flex items-center  ${passwordRequirements.hasMinLength
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


                            <div className="flex flex-col sm:flex-row gap-2 relative pt-5">
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className={`w-full px-3 sm:px-4 py-2 text-sm font-medium text-white rounded-full shadow-xs focus:outline-hidden transition-all ${!loading
                                        ? "bg-[#3E4095] "
                                        : "bg-gray-300 cursor-not-allowed"
                                        }`}
                                >
                                    {loading ? (<span className="flex items-center justify-center gap-2">
                                        <svg
                                            className="animate-spin h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                            ></path>
                                        </svg>
                                        Saving Changes...
                                    </span>) : "Save Changes"}
                                </button>
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={handleCancel}
                                    className={`w-full px-3 sm:px-4 py-2 text-sm font-medium  rounded-full shadow-xs  ${!loading ? 'text-[#3E4095] bg-white border border-[#3E4095] hover:bg-gray-50' : 'cursor-not-allowed border broder-gray-300 text-gray-300'} focus:outline-hidden`}
                                >
                                    Cancel Changes
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}



const tabs = [
    { title: "Account Settings", content: <AccountSettingsTab /> }
];

export default tabs;