import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import toast from "react-hot-toast";
import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import { Country, State, City } from "country-state-city";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../../../../../ui/Modal";
import Button from "../../../../../ui/Button";
import Input from "../../../../../ui/Input";

const registerPatient = async (payload) => {
  const res = await axiosInstanceHos.post(
    "api/receptionists/patient/register",
    payload,
  );
  return res.data;
};

const resendOtp = async (payload) => {
  const res = await axiosInstanceHos.post("api/auth/resend-otp", payload);
  return res.data;
};

const OnboardNewPatient = ({ setNewPatient }) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [onboardingSuccessful, setOnboardingSuccessful] = useState(false);
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
    stateCode: "",
    country: "",
    countryCode: "",
    house_no: "",
  });
  const [patientHIN, setPatientHIN] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handlePatientDataChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

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
    // Load all countries on mount
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);

  useEffect(() => {
    if (patientData.country) {
      const selectedCountry = countries.find(
        (c) => c.name === patientData.country,
      );
      if (selectedCountry) {
        const countryStates = State.getStatesOfCountry(selectedCountry.isoCode);
        setStates(countryStates);
      } else {
        setStates([]);
      }

      setPatientData((prev) => ({
        ...prev,
        state: "",
      }));
      setCities([]);
    }
  }, [patientData.country, countries]);

  useEffect(() => {
    if (patientData.countryCode && patientData.stateCode) {
      const citiesOfState = City.getCitiesOfState(
        patientData.countryCode,
        patientData.stateCode,
      );

      setCities(citiesOfState);
    } else {
      setCities([]);
    }
  }, [patientData.countryCode, patientData.stateCode, countries]);

  console.log(cities);

  const handleStepOne = () => {
    if (
      patientData.email &&
      patientData.phone_num &&
      patientData.password &&
      patientData.confirm_password &&
      patientData.password === patientData.confirm_password &&
      isPasswordValid
    ) {
      setStep(step + 1);
    } else {
      toast.error("Please fill all fields");
    }
  };

  const handleStepTwo = () => {
    if (
      patientData.firstname &&
      patientData.lastname &&
      patientData.middlename &&
      patientData.dob &&
      patientData.gender
    ) {
      setStep(step + 1);
    } else {
      toast.error("Please fill add fields");
    }
  };

  const isValid =
    patientData.country.trim() !== "" &&
    patientData.state.trim() !== "" &&
    patientData.city.trim() !== "" &&
    patientData.street.trim() !== "" &&
    patientData.house_no.trim() !== "";

  const { mutate, isPending } = useMutation({
    mutationFn: registerPatient,
    onSuccess: (data, variables) => {
      toast.success("Patient Registration Successful");
      setPatientHIN(data.profile.hin);
      setRegisteredEmail(variables.email);
      setStep(1);
      setOnboardingSuccessful(true);


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
        street: "",
        city: "",
        state: "",
        country: "",
        house_no: "",
      });

   
      queryClient.invalidateQueries(['receptionist-recent-patients']);
    },
    onError: (err) => {
      const errorMsg =
        err.response?.data?.message || "Patient Registration failed.";
      toast.error(errorMsg);
    },
  });

  const { mutate: sendResendOtp, isPending: isResendingOtp } = useMutation({
    mutationFn: resendOtp,
    onSuccess: () => {
      toast.success("OTP resent successfully!");
    },
    onError: (err) => {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.message ||
        "Failed to resend OTP.";
      toast.error(errorMsg);
    },
  });

  const handleResendOtp = () => {
    if (!registeredEmail) return;
    sendResendOtp({
      email: registeredEmail,
      verify_url:
        "https://docuhealthservices.net/user-create-account-verify-otp",
    });
  };

  const handleOnboarding = () => {
    if (!isValid) return toast.error("Please fill all fields");

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
        city: patientData.city,
        state: patientData.state,
        country: patientData.country,
        house_no: patientData.house_no,
      },
      verify_url:
        "https://docuhealthservices.net/user-create-account-verify-otp",
    };

    // Fire the mutation!
    mutate(payload);
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => {
        setOnboardingSuccessful(false);
        setNewPatient(false);
      }}
      title={onboardingSuccessful ? "" : "Register New Patient"}
      maxWidth="lg"
    >
      {onboardingSuccessful ? (
        <div className="flex flex-col justify-center items-center text-sm pt-4">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.66634 20.0007C6.66634 12.6369 12.6359 6.66732 19.9997 6.66732C27.3635 6.66732 33.333 12.6369 33.333 20.0007C33.333 27.3645 27.3635 33.334 19.9997 33.334C12.6359 33.334 6.66634 27.3645 6.66634 20.0007ZM19.9997 3.33398C10.7949 3.33398 3.33301 10.7959 3.33301 20.0007C3.33301 29.2053 10.7949 36.6673 19.9997 36.6673C29.2043 36.6673 36.6663 29.2053 36.6663 20.0007C36.6663 10.7959 29.2043 3.33398 19.9997 3.33398ZM29.0948 15.7625L26.7378 13.4055L18.333 21.8103L13.6782 17.1555L11.3212 19.5125L18.333 26.5243L29.0948 15.7625Z"
              fill="var(--color-docuhealth-green-dark)"
            />
          </svg>
          <p className="pt-1 text-docuhealth-green-dark">Account Creation Successful</p>

          <div className="border p-3 rounded-lg my-3 text-xs text-gray-600">
            <p>
              You have successfully created an account for a new patient,
              they can proceed to log into their dashboard using the Email
              and Password you provided after verifying their email within
              10 mins
            </p>
            <p className="pt-2 ">
              OTP expired or the patient did not receive it?{" "}
              <span
                onClick={!isResendingOtp ? handleResendOtp : undefined}
                className={`text-docuhealth-primary font-extrabold hover:underline ${isResendingOtp ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              >
                {isResendingOtp ? "Resending..." : "Click to resend OTP"}
              </span>
            </p>
          </div>
          <div className="border p-3 rounded-lg mb-5 text-xs text-gray-600 w-full">
            <p className="pb-1">
              Patient's HIN : {patientHIN || "NIL"} <span></span>
            </p>
            <p className="font-medium">
              {" "}
              Note :{" "}
              <span className="font-normal">
                {" "}
                Don’t share the HIN with any third party aside the patient
                or close family member if consented.
              </span>
            </p>
          </div>

          <div className="w-full">
            <Button
              fullWidth
              onClick={() => {
                setOnboardingSuccessful(false);
                setNewPatient(false);
              }}
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form className="sm:grid sm:grid-cols-2 sm:gap-3 pt-2">
          {step == 1 && (
            <>
              <div className="mb-2">
                <Input
                  label="Patient's Email"
                  type="email"
                  name="email"
                  value={patientData.email}
                  onChange={handlePatientDataChange}
                  placeholder="e.g tola@gmail.com"
                  className="text-sm"
                  required
                />
              </div>
              <div className="mb-2">
                <Input
                  label="Patient's Phone Number"
                  type="number"
                  name="phone_num"
                  value={patientData.phone_num}
                  onChange={handlePatientDataChange}
                  placeholder="e.g 09011122244"
                  className="text-sm"
                  required
                />
              </div>
              <div className="mb-2">
                <Input
                  label="Patient's Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={patientData.password}
                  onChange={(e) => {
                    handlePatientDataChange(e);
                    validatePassword(e.target.value);
                  }}
                  className={`text-sm ${
                    patientData.password && !isPasswordValid
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                  required
                  leadingIcon={<FaLock />}
                  trailingIcon={
                    showPassword ? <FaEyeSlash /> : <FaEye />
                  }
                  onTrailingIconClick={() => setShowPassword(!showPassword)}
                />
              </div>

              <div className="mb-4">
                <Input
                  label="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  name="confirm_password"
                  value={patientData.confirm_password}
                  onChange={handlePatientDataChange}
                  className="text-sm"
                  required
                  leadingIcon={<FaLock />}
                  trailingIcon={
                    showPassword ? <FaEyeSlash /> : <FaEye />
                  }
                  onTrailingIconClick={() => setShowPassword(!showPassword)}
                />
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
                          patientData.password,
                        ).color.replace("bg-", "text-")}`}
                      >
                        {getPasswordStrength(patientData.password).label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          getPasswordStrength(patientData.password).color
                        }`}
                        style={{
                          width: `${
                            (getPasswordStrength(patientData.password)
                              .strength /
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
                      className={`flex items-center text-sm ${
                        passwordRequirements.hasLowercase
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          passwordRequirements.hasLowercase
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></span>
                      Include lowercase letters (a-z)
                    </div>
                    <div
                      className={`flex items-center text-sm ${
                        passwordRequirements.hasUppercase
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          passwordRequirements.hasUppercase
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></span>
                      Include uppercase letters (A-Z)
                    </div>
                    <div
                      className={`flex items-center text-sm ${
                        passwordRequirements.hasNumber
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          passwordRequirements.hasNumber
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></span>
                      Include at least one number (0-9)
                    </div>
                    <div
                      className={`flex items-center text-sm ${
                        passwordRequirements.hasSymbol
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          passwordRequirements.hasSymbol
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></span>
                      Include at least one symbol (!@#$%^&*)
                    </div>
                    <div
                      className={`flex items-center text-sm ${
                        passwordRequirements.hasMinLength
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          passwordRequirements.hasMinLength
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
              <div className="col-span-2">
                <Button fullWidth onClick={handleStepOne}>
                  Move to step 2 / 3
                </Button>
              </div>
            </>
          )}

          {step == 2 && (
            <>
              <div className="mb-2">
                <Input
                  label="Patient's First Name"
                  type="text"
                  name="firstname"
                  value={patientData.firstname}
                  onChange={handlePatientDataChange}
                  className="text-sm"
                  required
                />
              </div>
              <div className="mb-2">
                <Input
                  label="Patient's Last Name"
                  type="text"
                  name="lastname"
                  value={patientData.lastname}
                  onChange={handlePatientDataChange}
                  className="text-sm"
                  required
                />
              </div>
              <div className="mb-2">
                <Input
                  label="Patient's Middle Name"
                  type="text"
                  name="middlename"
                  value={patientData.middlename}
                  onChange={handlePatientDataChange}
                  className="text-sm"
                />
              </div>
              <div className="mb-2 relative ">
                <label className="block text-sm font-semibold mb-1">
                  Patient's Gender
                </label>
                <select
                  name="gender"
                  value={patientData.gender}
                  onChange={(e) => {
                    handlePatientDataChange(e);
                    setIsOpen(false);
                  }}
                  onFocus={() => setIsOpen(true)}
                  onBlur={() => setIsOpen(false)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-3 focus:outline-hidden focus:border-docuhealth-primary appearance-none cursor-pointer text-sm"
                  required
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="unknown">Unknown</option>
                </select>

                <div
                  className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 absolute inset-y-11 right-3 ${
                    isOpen ? "rotate-180" : "rotate-0"
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
                <Input
                  label="Patient's Date of Birth"
                  type="date"
                  name="dob"
                  value={patientData.dob}
                  onChange={handlePatientDataChange}
                  className="text-sm"
                  required
                />
              </div>
              <div className="col-span-2">
                <Button fullWidth onClick={handleStepTwo}>
                  Move to step 3 / 3
                </Button>
              </div>
            </>
          )}

          {step == 3 && (
            <>
              <div className="mb-2 relative">
                <label className="block text-sm font-semibold mb-1">
                  Patient's Country
                </label>
                <select
                  name="country"
                  value={patientData.country}
                  onChange={(e) => {
                    const selected = countries.find(
                      (c) => c.name === e.target.value,
                    );

                    setPatientData((prev) => ({
                      ...prev,
                      country: selected.name,
                      countryCode: selected.isoCode,
                      state: "",
                      stateCode: "",
                      city: "",
                    }));
                    setIsOpen(false);
                  }}
                  onFocus={() => setIsOpen(true)}
                  onBlur={() => setIsOpen(false)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-3 focus:outline-hidden focus:border-docuhealth-primary appearance-none cursor-pointer text-sm"
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
                <div
                  className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 absolute inset-y-11 right-3 ${
                    isOpen ? "rotate-180" : "rotate-0"
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
                <label className="block text-sm font-semibold mb-1">
                  Patient's State of Residence
                </label>
                <select
                  value={patientData.state}
                  name="state"
                  onChange={(e) => {
                    const selected = states.find(
                      (s) => s.name === e.target.value,
                    );

                    setPatientData((prev) => ({
                      ...prev,
                      state: selected.name,
                      stateCode: selected.isoCode,
                      city: "",
                    }));
                  }}
                  className="w-full border border-gray-300 rounded-lg px-2 py-3  focus:outline-hidden focus:border-docuhealth-primary appearance-none text-sm"
                  required
                  disabled={!states.length}
                >
                  <option value="" seleceted>
                    -- Select your state --
                  </option>
                  {states.map((s) => (
                    <option key={s.isoCode} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <div
                  className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 absolute inset-y-11 right-3 `}
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
                <label className="block text-sm font-semibold mb-1">
                  Patient's City of Residence
                </label>
                <select
                  name="city"
                  value={patientData.city}
                  onChange={handlePatientDataChange}
                  className="w-full border border-gray-300 rounded-lg px-2 py-3 focus:outline-hidden focus:border-docuhealth-primary appearance-none text-sm"
                  required
                >
                  <option value="">-- Select City --</option>
                  {cities.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <div
                  className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 absolute inset-y-11 right-3 `}
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
                <Input
                  label="Patient's Street of Residence"
                  type="text"
                  name="street"
                  value={patientData.street}
                  placeholder="e.g Olorunda Street"
                  onChange={handlePatientDataChange}
                  className="text-sm"
                  required
                />
              </div>
              <div className="mb-4 col-span-2">
                <Input
                  label="House Number"
                  type="text"
                  name="house_no"
                  value={patientData.house_no}
                  placeholder="e.g No. 1234"
                  onChange={handlePatientDataChange}
                  className="text-sm"
                  required
                />
              </div>
              <div className="col-span-2">
                <Button
                  fullWidth
                  disabled={!isValid || isPending}
                  loading={isPending}
                  loadingText="Registering Patient..."
                  onClick={handleOnboarding}
                >
                  Register Patient
                </Button>
              </div>
            </>
          )}
        </form>
      )}
    </Modal>
  );
};

export default OnboardNewPatient;
