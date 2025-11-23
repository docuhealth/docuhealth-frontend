import React, { useState, useEffect } from 'react'
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa'
import toast from 'react-hot-toast'
import axios from 'axios'
import axiosInstance from '../../../../../../utils/axiosInstance'


const OnboardNewPatient = ({ setNewPatient }) => {

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [onboardingSuccessful, setOnboardingSuccessful] = useState(false)
    const [patientData, setPatientData] = useState({
        email: "",
        password: "",
        confirm_password: "",
        dob: "",
        gender: "",
        phone_num: "",
        firstname: "",
        lastname: "",
        middlename: "",
        referred_by: "",
        street: "",
        city: "",
        state: "",
        country: "",
        house_no: ""
    })
    const [patientHIN, setPatientHIN] = useState('')

    const handlePatientDataChange = (e) => {
        const { name, value } = e.target;
        setPatientData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }

    const [showPassword, setShowPassword] = useState(false);
    const [passwordRequirements, setPasswordRequirements] = useState({
        hasLowercase: false,
        hasUppercase: false,
        hasNumber: false,
        hasSymbol: false,
        hasMinLength: false,
    });
    const [isPasswordValid, setIsPasswordValid] = useState(false);

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
            return { strength: score, label: "Good", color: "bg-blue-500" };
        return { strength: score, label: "Strong", color: "bg-green-500" };
    };

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
        if (patientData.country) {
            const selected = countries.find(
                (c) => c.name === patientData.country
            );
            setStates(selected?.states || []);
            setPatientData((prevData) => ({
                ...prevData,
                state: "",
            }));

            setCities([]);
        }
    }, [patientData.country, countries]);

    // Fetch cities when state changes
    useEffect(() => {
        if (patientData.country && patientData.state) {
            const fetchCities = async () => {
                try {
                    const response = await axios.post(
                        "https://countriesnow.space/api/v0.1/countries/state/cities",
                        {
                            country: patientData.country,
                            state: patientData.state,
                        }
                    );
                    setCities(response.data.data);
                } catch (error) {
                    console.error("Error fetching cities:", error);
                }
            };
            fetchCities();
        }
    }, [patientData.state, patientData.country]);

    const handleStepOne = () => {
        if (patientData.email && patientData.phone_num && patientData.password && patientData.confirm_password && patientData.password === patientData.confirm_password && isPasswordValid) {
            setStep(step + 1)
        } else {
            toast.error('Please fill all fields')
        }
    }

    const handleStepTwo = () => {
        if (patientData.firstname && patientData.lastname && patientData.middlename && patientData.dob && patientData.gender) {
            setStep(step + 1)
        } else {
            toast.error('Please fill add fields')
        }
    }

    const isValid = patientData.country.trim() !== "" && patientData.state.trim() !== "" && patientData.city.trim() !== "" && patientData.street.trim() !== "" && patientData.house_no.trim() !== ""

    const handleOnboarding = async () => {
        setLoading(true)

        const payload = {
            email: patientData.email,
            password: patientData.password,
            profile: {
                dob: patientData.dob,
                gender: patientData.gender,
                phone_num: patientData.phone_num,
                firstname: patientData.firstname,
                lastname: patientData.lastname,
                middlename: patientData.middlename,
                street: patientData.street,
                city: patientData.street,
                state: patientData.state,
                country: patientData.country,
                house_no: patientData.house_no
            }
        }

        if (!isValid) {
            setLoading(false)
            toast.error("Please fill all fields")
            return
        }

        try {
            const res = await axiosInstance.post('api/receptionists/register-patient', payload)
            toast.success('Patient Registration Successful')
            console.log(res)
            setPatientHIN(res.data.profile.hin)
            setStep(1)
            setOnboardingSuccessful(true)

        } catch (err) {
            console.error("Error registering account:", err);
            toast.error(err.response?.data?.message || "Patient Registration failed.");
            setStep(1)
            setNewPatient(false)
        } finally {
            setLoading(false)

            setPatientData({
                email: "",
                password: "",
                confirm_password: "",
                dob: "",
                gender: "",
                phone_num: "",
                firstname: "",
                lastname: "",
                middlename: "",
                referred_by: "",
                street: "",
                city: "",
                state: "",
                country: "",
                house_no: ""
            })
        }
    }


    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5">
            {
                onboardingSuccessful ? (
                    <>
                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative text-sm">
                            <div className='flex justify-end'>
                                <button
                                    onClick={() => {
                                        setOnboardingSuccessful(false)
                                        setNewPatient(false)
                                    }}
                                    className="text-gray-500 hover:text-black  "
                                >
                                    <i className="bx bx-x text-2xl cursor-pointer"></i>
                                </button>
                            </div>
                            <div className='flex flex-col justify-center items-center '>
                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.66634 20.0007C6.66634 12.6369 12.6359 6.66732 19.9997 6.66732C27.3635 6.66732 33.333 12.6369 33.333 20.0007C33.333 27.3645 27.3635 33.334 19.9997 33.334C12.6359 33.334 6.66634 27.3645 6.66634 20.0007ZM19.9997 3.33398C10.7949 3.33398 3.33301 10.7959 3.33301 20.0007C3.33301 29.2053 10.7949 36.6673 19.9997 36.6673C29.2043 36.6673 36.6663 29.2053 36.6663 20.0007C36.6663 10.7959 29.2043 3.33398 19.9997 3.33398ZM29.0948 15.7625L26.7378 13.4055L18.333 21.8103L13.6782 17.1555L11.3212 19.5125L18.333 26.5243L29.0948 15.7625Z" fill="#0B6011" />
                                </svg>
                                <p className='pt-1 text-[#0B6011]'>Account Creation Successful</p>

                                <div className='border p-3 rounded-lg my-3 text-sm text-gray-600'>
                                    <p>You have successfully created an account for a new patient, they can proceed to log into their dashboard using the Email and Password you provided after verifying their email within 24 hrs</p>
                                </div>
                                <div className='border p-3 rounded-lg mb-5 text-sm text-gray-600 w-full'>
                                    <p className='pb-1'>Patient's HIN : {patientHIN || 'NIL'} <span></span></p>
                                    <p className='font-medium'> Note : <span className='font-normal'> Don’t share the HIN with any third party aside the patient or close family member if consented.</span></p>
                                </div>

                                <div className='w-full text-white'>
                                    <button className='bg-[#3E4095] py-3 rounded-full  cursor-pointer w-full' onClick={() => {
                                        setOnboardingSuccessful(false)
                                        setNewPatient(false)
                                    }}>Done</button>
                                </div>

                            </div>

                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
                            <div className="flex justify-between items-center pb-5">
                                <div className="flex-1 text-center">
                                    <h2 className="text-md font-semibold">Register New Patient</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        setNewPatient(false);
                                    }}
                                    className="text-gray-500 hover:text-black"
                                >
                                    <i className="bx bx-x text-2xl cursor-pointer"></i>
                                </button>
                            </div>
                            <form className=" sm:grid sm:grid-cols-2 sm:gap-3 ">
                                {step == 1 && (
                                    <>
                                        <div className="mb-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Patient's Email
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={patientData.email}
                                                onChange={handlePatientDataChange}
                                                placeholder='e.g tola@gmail.com'
                                                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-hidden focus:border-[#3E4095]"
                                                required
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Patient's Phone Number
                                            </label>
                                            <input
                                                type="number"
                                                name="phone_num"
                                                value={patientData.phone_num}
                                                onChange={handlePatientDataChange}
                                                placeholder='e.g 09011122244'
                                                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-hidden focus:border-[#3E4095]"
                                                required
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Patient's Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    value={patientData.password}
                                                    onChange={(e) => {
                                                        handlePatientDataChange(e)
                                                        validatePassword(e.target.value);
                                                    }}
                                                    className={`w-full px-4 py-2 border rounded-lg pl-8 outline-hidden focus:border-[#3E4095] text-sm ${patientData.password &&
                                                        !isPasswordValid
                                                        ? "focus:border-red-500"
                                                        : ""
                                                        }`}
                                                    required
                                                />
                                                <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute top-1/2 right-3 transform -translate-y-1/2"
                                                >
                                                    {showPassword ? (
                                                        <FaEyeSlash className="h-4 w-4 text-gray-400" />
                                                    ) : (
                                                        <FaEye className="h-3 w-3 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="confirm_password"
                                                    value={patientData.confirm_password}
                                                    onChange={handlePatientDataChange}
                                                    className="w-full text-sm px-4 py-2 border rounded-lg pl-8 outline-hidden focus:border-[#3E4095]"
                                                    required
                                                />
                                                <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute top-1/2 right-3 transform -translate-y-1/2"
                                                >
                                                    {showPassword ? (
                                                        <FaEyeSlash className="h-4 w-4 text-gray-400" />
                                                    ) : (
                                                        <FaEye className="h-3 w-3 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        {patientData.password && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded-lg col-span-2">
                                                {/* Password Strength Indicator */}
                                                <div className="mb-3">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-sm font-medium text-gray-700">
                                                            Password Strength:
                                                        </span>
                                                        <span
                                                            className={`text-sm font-medium ${getPasswordStrength(
                                                                patientData.password
                                                            ).color.replace("bg-", "text-")}`}
                                                        >
                                                            {
                                                                getPasswordStrength(
                                                                    patientData.password
                                                                ).label
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(
                                                                patientData.password
                                                            ).color
                                                                }`}
                                                            style={{
                                                                width: `${(getPasswordStrength(
                                                                    patientData.password
                                                                ).strength /
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
                                        <div
                                            className="col-span-2 text-center bg-[#3E4095] text-white py-3 px-4 rounded-full cursor-pointer text-sm"
                                            onClick={() => handleStepOne()}
                                        >
                                            <p> Move to step 2 / 3</p>
                                        </div>
                                    </>
                                )}

                                {step == 2 && (
                                    <>
                                        <div className="mb-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Patient's First Name
                                            </label>
                                            <input
                                                type="text"
                                                name="firstname"
                                                value={patientData.firstname}
                                                onChange={handlePatientDataChange}
                                                className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-hidden focus:border-[#3E4095]  text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Patient's Last Name
                                            </label>
                                            <input
                                                type="text"
                                                name="lastname"
                                                value={patientData.lastname}
                                                onChange={handlePatientDataChange}
                                                className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-hidden focus:border-[#3E4095]  text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Patient's Middle Name
                                            </label>
                                            <input
                                                type="text"
                                                name="middlename"
                                                value={patientData.middlename}
                                                onChange={handlePatientDataChange}
                                                className="w-full border border-gray-300 rounded-lg px-2 py-2  focus:outline-hidden focus:border-[#3E4095]  text-sm"
                                            />
                                        </div>
                                        <div className="mb-2 relative ">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Patient's Gender
                                            </label>
                                            <select
                                                name="gender"
                                                value={patientData.gender}
                                                onChange={(e) => {
                                                    handlePatientDataChange(e);
                                                    setIsOpen(false); // close when user picks option
                                                }}
                                                onFocus={() => setIsOpen(true)} // when clicked/focused
                                                onBlur={() => setIsOpen(false)} // when closed
                                                className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-hidden focus:border-[#3E4095] appearance-none cursor-pointer  text-sm"
                                                required
                                            >
                                                <option value="">Select</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                                <option value="unknown">Unknown</option>
                                            </select>

                                            {/* Custom dropdown arrow */}
                                            <div
                                                className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 absolute inset-y-9 right-2 ${isOpen ? "rotate-180" : "rotate-0"
                                                    }`}
                                            >
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
                                        <div className="mb-4 col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1 ">
                                                Patient's Date of Birth
                                            </label>
                                            <input
                                                type="date"
                                                name="dob"
                                                value={patientData.dob}
                                                onChange={handlePatientDataChange}
                                                className="w-full border border-gray-300 rounded-lg px-2 py-2  focus:outline-hidden focus:border-[#3E4095]  text-sm"
                                                required
                                            />
                                        </div>
                                        <div
                                            className="col-span-2 text-center bg-[#3E4095] text-white py-3 px-4 rounded-full cursor-pointer text-sm"
                                            onClick={() => handleStepTwo()}
                                        >
                                            <p> Move to step 3 / 3</p>
                                        </div>
                                    </>
                                )}

                                {step == 3 && (
                                    <>
                                        <div className="mb-2 relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Patient's Country
                                            </label>
                                            <select
                                                name="country"
                                                value={patientData.country}
                                                onChange={(e) => {
                                                    handlePatientDataChange(e);
                                                    setIsOpen(false);
                                                }}
                                                onFocus={() => setIsOpen(true)} // when clicked/focused
                                                onBlur={() => setIsOpen(false)} // when closed
                                                className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-hidden focus:border-[#3E4095] appearance-none cursor-pointer text-sm"
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
                                            <div
                                                className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 absolute inset-y-9 right-2 ${isOpen ? "rotate-180" : "rotate-0"
                                                    }`}
                                            >
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
                                        <div className="mb-2 relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Patient's State of Residence
                                            </label>
                                            <select
                                                value={patientData.state}
                                                name="state"
                                                onChange={handlePatientDataChange}
                                                className="w-full border border-gray-300 rounded-lg px-2 py-2  focus:outline-hidden focus:border-[#3E4095] appearance-none text-sm"
                                                required
                                                disabled={!states.length}
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
                                            <div
                                                className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 absolute inset-y-9 right-2 `}
                                            >
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
                                        <div className="mb-2 relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Patient's City of Residence
                                            </label>
                                            <select
                                                name="city"
                                                value={patientData.city}
                                                onChange={handlePatientDataChange}
                                                className="w-full border border-gray-300 rounded-lg px-2 py-2  focus:outline-hidden focus:border-[#3E4095] appearance-none text-sm"
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
                                            <div
                                                className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 absolute inset-y-9 right-2 `}
                                            >
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
                                        <div className="mb-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Patient's Street of Residence
                                            </label>
                                            <input
                                                type="text"
                                                name="street"
                                                value={patientData.street}
                                                placeholder="e.g Olorunda Street"
                                                onChange={handlePatientDataChange}
                                                className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-hidden focus:border-[#3E4095] text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="mb-4 col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                House Number
                                            </label>
                                            <input
                                                type="text"
                                                name="house_no"
                                                value={patientData.house_no}
                                                placeholder="e.g No. 1234"
                                                onChange={handlePatientDataChange}
                                                className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-hidden focus:border-[#3E4095] text-sm"
                                                required
                                            />
                                        </div>
                                        <div
                                            className={`col-span-2 text-center text-sm ${isValid && !loading
                                                ? "bg-[#3E4095] text-white  cursor-pointer"
                                                : "cursor-not-allowed bg-gray-300 text-gray-500"} py-3 px-4 rounded-full cursor-pointer`}
                                            onClick={handleOnboarding}
                                            disabled={!isValid || loading}
                                        >
                                            <p>
                                                {" "}
                                                {loading ? (
                                                    <span className="flex items-center justify-center gap-2">
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
                                                        Registering Patient...
                                                    </span>
                                                ) : (
                                                    "Register Patient"
                                                )}{" "}
                                            </p>
                                        </div>
                                    </>
                                )}

                            </form>
                        </div>
                    </>
                )
            }

        </div>
    )
}

export default OnboardNewPatient