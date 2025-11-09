import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const UserSubAcctUpgradeModal = ({
  displaySubAcctModal,
  setDisplaySubAcctModal,
  subAcctUpgradeData,
  setSubAcctUpgradeData,
  subAcctUpgradeStep,
  handleSubAcctUpgradeDataChange,
  handleNextStepSubAcctUpgrade,
  handleSubAcctUpgrade,
  showPassword,
  setShowPassword,
  isPasswordValid,
  validatePassword,
  passwordRequirements,
  getPasswordStrength,
  handleFinalStepSubAcctUpgrade,
  subAcctUpgradeLoading,
  isValid,
}) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

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
    if (subAcctUpgradeData.child_country) {
      const selected = countries.find(
        (c) => c.name === subAcctUpgradeData.child_country
      );
      setStates(selected?.states || []);
      setSubAcctUpgradeData((prevData) => ({
        ...prevData,
        child_state: "",
      }));

      setCities([]);
    }
  }, [subAcctUpgradeData.child_country, countries]);

  // Fetch cities when state changes
  useEffect(() => {
    if (subAcctUpgradeData.child_country && subAcctUpgradeData.child_state) {
      const fetchCities = async () => {
        try {
          const response = await axios.post(
            "https://countriesnow.space/api/v0.1/countries/state/cities",
            {
              country: subAcctUpgradeData.child_country,
              state: subAcctUpgradeData.child_state,
            }
          );
          setCities(response.data.data);
        } catch (error) {
          console.error("Error fetching cities:", error);
        }
      };
      fetchCities();
    }
  }, [subAcctUpgradeData.child_state, subAcctUpgradeData.child_country]);
  return (
    <>
      <div>
        {displaySubAcctModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-5">
            <div className="bg-white rounded-xs shadow-lg p-6 max-w-lg w-full relative">
              <div className="flex justify-between items-center pb-5">
                <div className="flex-1 text-center">
                  <h2 className="text-lg font-semibold">Sub Account Upgrade</h2>
                </div>
                <button
                  onClick={() => {
                    setDisplaySubAcctModal(false);
                  }}
                  className="text-gray-500 hover:text-black"
                >
                  <i className="bx bx-x text-2xl"></i>
                </button>
              </div>
              <div className=" text-sm text-gray-700">
                <p>
                  Upgrade this sub-account to a standard account with the
                  necessary information below
                </p>
              </div>
              <form className=" sm:grid sm:grid-cols-2 sm:gap-3 mt-6">
                {subAcctUpgradeStep == 1 && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Child's Email
                      </label>
                      <input
                        type="email"
                        name="child_email"
                        value={subAcctUpgradeData.child_email}
                        onChange={handleSubAcctUpgradeDataChange}
                        className="w-full border border-gray-300 rounded-lg px-2 py-2  focus:outline-hidden focus:border-[#3E4095]"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Child's Phone Number
                      </label>
                      <input
                        type="number"
                        name="child_phone_number"
                        value={subAcctUpgradeData.child_phone_number}
                        onChange={handleSubAcctUpgradeDataChange}
                        className="w-full border border-gray-300 rounded-lg px-2 py-2  focus:outline-hidden focus:border-[#3E4095]"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Child's Hin
                      </label>
                      <input
                        type="number"
                        name="child_hin"
                        value={subAcctUpgradeData.child_hin}
                        onChange={handleSubAcctUpgradeDataChange}
                        className="w-full border border-gray-300 rounded-lg px-2 py-2  focus:outline-hidden focus:border-[#3E4095] "
                        required
                      />
                    </div>

                    <div className="mb-4 relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Child's Country
                      </label>
                      <select
                        name="child_country"
                        value={subAcctUpgradeData.child_country}
                        onChange={(e) => {
                          handleSubAcctUpgradeDataChange(e);
                          setIsOpen(false);
                        }}
                        onFocus={() => setIsOpen(true)} // when clicked/focused
                        onBlur={() => setIsOpen(false)} // when closed
                        className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-hidden focus:border-[#3E4095] appearance-none cursor-pointer"
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
                        className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 absolute inset-y-9 right-2 ${
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

                    <div
                      className="col-span-2 text-center bg-[#3E4095] text-white py-3 px-4 rounded-full cursor-pointer "
                      onClick={handleNextStepSubAcctUpgrade}
                    >
                      <p> Move to step 2 / 3</p>
                    </div>
                  </>
                )}

                {subAcctUpgradeStep == 2 && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Child's Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="child_password"
                          value={subAcctUpgradeData.child_password}
                          onChange={(e) => {
                            handleSubAcctUpgradeDataChange(e);
                            validatePassword(e.target.value);
                          }}
                          className={`w-full px-4 py-2 border rounded-lg pl-8 outline-hidden focus:border-[#3E4095] ${
                            subAcctUpgradeData.child_password &&
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
                    {/* Password Requirements Checker */}

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="confirm_password"
                          value={subAcctUpgradeData.confirm_password}
                          onChange={handleSubAcctUpgradeDataChange}
                          className="w-full px-4 py-2 border rounded-lg pl-8 outline-hidden focus:border-[#3E4095]"
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
                    {subAcctUpgradeData.child_password && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg col-span-2">
                        {/* Password Strength Indicator */}
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              Password Strength:
                            </span>
                            <span
                              className={`text-sm font-medium ${getPasswordStrength(
                                subAcctUpgradeData.child_password
                              ).color.replace("bg-", "text-")}`}
                            >
                              {
                                getPasswordStrength(
                                  subAcctUpgradeData.child_password
                                ).label
                              }
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                getPasswordStrength(
                                  subAcctUpgradeData.child_password
                                ).color
                              }`}
                              style={{
                                width: `${
                                  (getPasswordStrength(
                                    subAcctUpgradeData.child_password
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
                    <div
                      className="col-span-2 text-center bg-[#3E4095] text-white py-3 px-4 rounded-full cursor-pointer"
                      onClick={handleFinalStepSubAcctUpgrade}
                    >
                      <p> Move to step 3 / 3</p>
                    </div>
                  </>
                )}

                {subAcctUpgradeStep == 3 && (
                  <>
                    <div className="mb-4 relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Child's State of Residence
                      </label>
                      <select
                        value={subAcctUpgradeData.child_state}
                        name="child_state"
                        onChange={handleSubAcctUpgradeDataChange}
                        className="w-full border border-gray-300 rounded-lg px-2 py-2  focus:outline-hidden focus:border-[#3E4095] appearance-none"
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
                    <div className="mb-4 relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Child's City of Residence
                      </label>
                      <select
                        name="child_city"
                        value={subAcctUpgradeData.child_city}
                        onChange={handleSubAcctUpgradeDataChange}
                        className="w-full border border-gray-300 rounded-lg px-2 py-2  focus:outline-hidden focus:border-[#3E4095] appearance-none"
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

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        House Number (optional)
                      </label>
                      <input
                        type="text"
                        name="child_house_number"
                        value={subAcctUpgradeData.child_house_number}
                        placeholder="e.g No. 1234"
                        onChange={handleSubAcctUpgradeDataChange}
                        className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-hidden focus:border-[#3E4095]"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Child's Street of Residence
                      </label>
                      <input
                        type="text"
                        name="child_street"
                        value={subAcctUpgradeData.child_street}
                        placeholder="e.g Olorunda Street"
                        onChange={handleSubAcctUpgradeDataChange}
                        className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-hidden focus:border-[#3E4095]"
                        required
                      />
                    </div>
                    <div
                      className={`col-span-2 text-center ${                    isValid && !subAcctUpgradeLoading
                      ? "bg-[#3E4095] text-white hover:bg-blue-700 cursor-pointer"
                      : "cursor-not-allowed bg-gray-300 text-gray-500"} py-3 px-4 rounded-full cursor-pointer`}
                      onClick={handleSubAcctUpgrade}
                      disabled={!isValid || subAcctUpgradeLoading}
                    >
                      <p>
                        {" "}
                        {subAcctUpgradeLoading ? (
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
                            Upgrading Account...
                          </span>
                        ) : (
                          "Upgrade this account"
                        )}{" "}
                      </p>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserSubAcctUpgradeModal;
