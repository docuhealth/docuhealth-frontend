import { useState } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { Eye, EyeOff } from "lucide-react";

const PasswordField = ({ label, value, onChange, placeholder = "" }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs sm:text-sm text-gray-700">{label}</label>
      <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 gap-2 focus-within:border-[#3E4095] transition-colors">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="flex-1 text-xs sm:text-sm text-gray-700 outline-none bg-transparent min-w-0"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        >
          {show ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>
    </div>
  );
};

const Hospital_Lab_Settings_Dashboard = () => {
  const [currentPassword, setCurrentPassword]   = useState("****************");
  const [newPassword, setNewPassword]           = useState("");
  const [confirmPassword, setConfirmPassword]   = useState("");

  const initials = "LS";
  const name     = "Lab Scientist";
  const email    = "labscientist@hospital.com";

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 sm:p-6">

        {/* Profile info */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-base sm:text-lg font-semibold shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-sm sm:text-base font-semibold text-gray-800">{name}</p>
            <p className="text-xs sm:text-sm text-gray-400 break-all">{email}</p>
          </div>
        </div>

        {/* Security settings tab */}
        <div className="border-b border-gray-100 mb-6 sm:mb-7">
          <button className="text-xs sm:text-sm font-semibold text-[#3E4095] border-b-2 border-[#3E4095] pb-3 pr-1">
            Security settings
          </button>
        </div>

        {/* Password fields */}
        <div className="flex flex-col gap-5">
          {/* Row 1: Current + New */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <PasswordField
              label="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <PasswordField
              label="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          {/* Row 2: Confirm (half width on md+) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <PasswordField
              label="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-8">
          <button className="bg-[#3E4095] text-white text-sm font-semibold px-8 py-3 rounded-full hover:bg-indigo-700 transition-colors text-center">
            Save changes
          </button>
          <button
            onClick={() => {
              setCurrentPassword("****************");
              setNewPassword("");
              setConfirmPassword("");
            }}
            className="border border-gray-200 text-gray-400 text-sm font-medium px-8 py-3 rounded-full hover:bg-gray-50 transition-colors text-center"
          >
            Cancel changes
          </button>
        </div>

      </div>
    </>
  );
};

export default Hospital_Lab_Settings_Dashboard;
