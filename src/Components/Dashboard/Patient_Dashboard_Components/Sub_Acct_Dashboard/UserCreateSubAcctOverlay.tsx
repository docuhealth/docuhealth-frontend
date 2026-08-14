import React, { useState } from "react";
import toast from "react-hot-toast";
import { fetchSubscriptionStatus } from "../../../../services/authService";
import Button from "../../../ui/Button";

interface SubAcctFormData {
  firstname: string;
  lastname: string;
  middlename: string;
  dob: string;
  gender: string;
}

interface UserSubAcctOverlayProps {
  showCreateSubAcctOverlay: boolean;
  handleSubAcctCreation: (e: React.FormEvent) => void;
  toggleAcctCreationOverlay: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  formData: SubAcctFormData;
  loading: boolean;
  isFormValid: boolean;
}

const UserSubAcctOverlay = ({
  showCreateSubAcctOverlay,
  handleSubAcctCreation,
  toggleAcctCreationOverlay,
  handleChange,
  formData,
  loading,
  isFormValid,
}: UserSubAcctOverlayProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="">
      {showCreateSubAcctOverlay && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-3 ">
          <div className="bg-white rounded-xs shadow-lg p-6 max-w-lg w-full relative max-h-[80vh] overflow-y-auto hide-scrollbar">
            <div className="flex justify-between items-center pb-8">
              <div className="flex-1 text-center">
                <h2 className="text-lg font-semibold">Create Sub Account</h2>
              </div>
              <button
                onClick={toggleAcctCreationOverlay}
                className="text-gray-500 cursor-pointer"
              >
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            {/* Form */}
            <form
              className=" sm:grid sm:grid-cols-2 sm:gap-3 text-sm"
              onSubmit={handleSubAcctCreation}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Child's First Name
                </label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-hidden focus:border-docuhealth-primary h-10"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Child's Last Name
                </label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-hidden focus:border-docuhealth-primary h-10"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Child's Middle Name
                </label>
                <input
                  type="text"
                  name="middlename"
                  value={formData.middlename}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2  focus:outline-hidden focus:border-docuhealth-primary h-10"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Child's Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2  focus:outline-hidden focus:border-docuhealth-primary h-10"
                  required
                />
              </div>

              <div className="mb-4 relative col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={(e) => {
                    handleChange(e);
                    setIsOpen(false); // close when user picks option
                  }}
                  onFocus={() => setIsOpen(true)} // when clicked/focused
                  onBlur={() => setIsOpen(false)} // when closed
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-hidden focus:border-docuhealth-primary appearance-none cursor-pointer h-10"
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

              <div className="mb-4 sm:mb-2 col-span-2">
                <p className="block text-sm font-medium text-gray-700 mb-1">
                  Please Note :
                </p>

                <div
                  className="text-[12px] text-gray-500 mt-2 border border-gray-300 rounded-lg p-3
                                  "
                >
                  Please note that once this account is created, its information
                  cannot be edited. However, you will have the option to update
                  the account details when you upgade the account and transfer
                  ownership to the child.
                </div>
              </div>
              <div className="col-span-2">
                <Button
                  fullWidth
                  disabled={!isFormValid}
                  loading={loading}
                  loadingText="Creating Sub Account..."
                  type="submit"
                >
                  Create Sub Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSubAcctOverlay;
