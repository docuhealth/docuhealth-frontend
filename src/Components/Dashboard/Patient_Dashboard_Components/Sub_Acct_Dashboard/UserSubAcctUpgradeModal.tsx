import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Country, State, City } from 'country-state-city';
import type { ICountry, IState, ICity } from 'country-state-city';
import PasswordStrengthMeter from "../../../ui/PasswordStrengthMeter";
import Spinner from "../../../ui/Spinner";
import Modal from "../../../ui/Modal";
import Button from "../../../ui/Button";

interface SubAcctUpgradeData {
  child_email: string;
  child_hin: string;
  child_phone_number: string;
  child_password: string;
  confirm_password: string;
  child_state: string;
  child_stateCode: string;
  child_city: string;
  child_street: string;
  child_house_number: string;
  child_country: string;
  child_countryCode: string;
}

interface UserSubAcctUpgradeModalProps {
  displaySubAcctModal: boolean;
  setDisplaySubAcctModal: (value: boolean) => void;
  subAcctUpgradeData: SubAcctUpgradeData;
  setSubAcctUpgradeData: React.Dispatch<React.SetStateAction<SubAcctUpgradeData>>;
  subAcctUpgradeStep: number;
  handleSubAcctUpgradeDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleNextStepSubAcctUpgrade: () => void;
  handleSubAcctUpgrade: () => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  isPasswordValid: boolean;
  handleFinalStepSubAcctUpgrade: () => void;
  subAcctUpgradeLoading: boolean;
  isValid: boolean;
}

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
  handleFinalStepSubAcctUpgrade,
  subAcctUpgradeLoading,
  isValid,
}: UserSubAcctUpgradeModalProps) => {
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [isOpen, setIsOpen] = useState(false);


  useEffect(() => {
    // Load all countries on mount
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);



  // Update states when country changes
  useEffect(() => {
    if (subAcctUpgradeData.child_country) {
      const selectedCountry = countries.find(c => c.name === subAcctUpgradeData.child_country);
      if (selectedCountry) {
        const countryStates = State.getStatesOfCountry(selectedCountry.isoCode);
        setStates(countryStates);
      } else {
        setStates([]);
      }
      setSubAcctUpgradeData((prevData) => ({
        ...prevData,
        child_state: "",
      }));
      setCities([]); // reset cities
      setSubAcctUpgradeData((prevData) => ({
        ...prevData,
        child_city: "",
      }));
    }
  }, [subAcctUpgradeData.child_country, countries]);

  // Fetch cities when state changes


  // Fetch cities when state changes
  useEffect(() => {
    if (subAcctUpgradeData.child_countryCode && subAcctUpgradeData.child_stateCode) {
      const citiesOfState = City.getCitiesOfState(
        subAcctUpgradeData.child_countryCode,
        subAcctUpgradeData.child_stateCode
      );

      setCities(citiesOfState);
    } else {
      setCities([]);
    }
  }, [subAcctUpgradeData.child_stateCode, subAcctUpgradeData.child_countryCode, countries]);
  return (
    <>
      <div>
        <Modal isOpen={displaySubAcctModal} onClose={() => setDisplaySubAcctModal(false)} title="Sub Account Upgrade">
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
                        className="w-full border border-gray-300 rounded-lg px-2 py-2  focus:outline-hidden focus:border-docuhealth-primary"
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
                        className="w-full border border-gray-300 rounded-lg px-2 py-2  focus:outline-hidden focus:border-docuhealth-primary"
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
                        className="w-full border border-gray-300 rounded-lg px-2 py-2  focus:outline-hidden focus:border-docuhealth-primary "
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
                          const selected = countries.find(
                            (c) => c.name === e.target.value
                          );
                          if (!selected) return;

                          setSubAcctUpgradeData((prev) => ({
                            ...prev,
                            child_country: selected.name,      // save name for payload
                            child_countryCode: selected.isoCode, // save isoCode for fetching
                            child_state: "",
                            child_stateCode: "",
                            child_city: ""
                          }));
                          setIsOpen(false);
                        }}
                        onFocus={() => setIsOpen(true)} // when clicked/focused
                        onBlur={() => setIsOpen(false)} // when closed
                        className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-hidden focus:border-docuhealth-primary appearance-none cursor-pointer"
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

                    <div
                      className="col-span-2 text-sm text-center bg-docuhealth-primary text-white py-3 px-4 rounded-full cursor-pointer "
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
                          onChange={handleSubAcctUpgradeDataChange}
                          className={`w-full px-4 py-2 border rounded-lg pl-8 outline-hidden focus:border-docuhealth-primary ${subAcctUpgradeData.child_password &&
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
                          className="w-full px-4 py-2 border rounded-lg pl-8 outline-hidden focus:border-docuhealth-primary"
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
                    <div className="col-span-2">
                      <PasswordStrengthMeter password={subAcctUpgradeData.child_password} />
                    </div>
                    <div
                      className="col-span-2 text-center bg-docuhealth-primary text-white py-3 px-4 rounded-full cursor-pointer"
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
                        onChange={(e) => {
                          const selected = states.find((s) => s.name === e.target.value);
                          if (!selected) return;

                          setSubAcctUpgradeData((prev) => ({
                            ...prev,
                            child_state: selected.name,
                            child_stateCode: selected.isoCode,  // needed for city fetching
                            child_city: ""
                          }));
                        }}
                        className="w-full border border-gray-300 rounded-lg px-2 py-2  focus:outline-hidden focus:border-docuhealth-primary appearance-none"
                        required
                        disabled={!states.length}
                      >
                        <option value="">
                          -- Select your state --
                        </option>
                        {states.map((s) => (
                          <option key={s.isoCode} value={s.name}>
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
                        className="w-full border border-gray-300 rounded-lg px-2 py-2  focus:outline-hidden focus:border-docuhealth-primary appearance-none"
                        required
                      >
                        <option value="">
                          -- Select City --
                        </option>
                        {cities.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        House Number (optional)
                      </label>
                      <input
                        type="text"
                        name="child_house_number"
                        value={subAcctUpgradeData.child_house_number}
                        placeholder="e.g No. 1234"
                        onChange={handleSubAcctUpgradeDataChange}
                        className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-hidden focus:border-docuhealth-primary"
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
                        className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-hidden focus:border-docuhealth-primary"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Button
                        fullWidth
                        disabled={!isValid}
                        loading={subAcctUpgradeLoading}
                        loadingText="Upgrading Account..."
                        onClick={handleSubAcctUpgrade}
                      >
                        Upgrade this account
                      </Button>
                    </div>
                  </>
                )}
              </form>
        </Modal>
      </div>
    </>
  );
};

export default UserSubAcctUpgradeModal;
