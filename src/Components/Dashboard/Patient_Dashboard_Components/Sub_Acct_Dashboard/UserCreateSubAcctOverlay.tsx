import React, { useState } from "react";
import toast from "react-hot-toast";
import { fetchSubscriptionStatus } from "../../../../services/authService";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";
import Modal from "../../../ui/Modal";

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
      <Modal isOpen={showCreateSubAcctOverlay} onClose={toggleAcctCreationOverlay} title="Create Sub Account">
        <form
          className=" sm:grid sm:grid-cols-2 sm:gap-3 text-sm"
          onSubmit={handleSubAcctCreation}
        >
              <div className="mb-4">
                <Input
                  label="Child's First Name"
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <Input
                  label="Child's Last Name"
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <Input
                  label="Child's Middle Name"
                  type="text"
                  name="middlename"
                  value={formData.middlename}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Input
                  label="Child's Date of Birth"
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
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
      </Modal>
    </div>
  );
};

export default UserSubAcctOverlay;
