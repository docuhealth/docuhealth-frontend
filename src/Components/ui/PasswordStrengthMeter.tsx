import React from "react";
import { getPasswordRequirements, getPasswordStrength } from "../../utils/passwordStrength";

export interface PasswordStrengthMeterProps {
  password: string;
}

const REQUIREMENT_LABELS: { key: keyof ReturnType<typeof getPasswordRequirements>; label: string }[] = [
  { key: "hasLowercase", label: "Include lowercase letters (a-z)" },
  { key: "hasUppercase", label: "Include uppercase letters (A-Z)" },
  { key: "hasNumber", label: "Include at least one number (0-9)" },
  { key: "hasSymbol", label: "Include at least one symbol (!@#$%^&*)" },
  { key: "hasMinLength", label: "Be at least 8 characters long" },
];

/**
 * Password strength bar + requirements checklist.
 * Consolidates the identical block duplicated across every password form
 * (sign-up, reset password, settings, sub-account upgrade).
 */
const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  if (!password) return null;

  const requirements = getPasswordRequirements(password);
  const strength = getPasswordStrength(password);
  const allMet = Object.values(requirements).every(Boolean);

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-[12px]">
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[12px] font-medium text-gray-700">Password Strength:</span>
          <span className={`font-medium ${strength.color.replace("bg-", "text-")}`}>
            {strength.label}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${(strength.strength / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      <p className="font-medium text-gray-700 mb-2">Password Requirements:</p>
      <div className="space-y-1">
        {REQUIREMENT_LABELS.map(({ key, label }) => {
          const met = requirements[key];
          return (
            <div key={key} className={`flex items-center ${met ? "text-green-600" : "text-red-500"}`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${met ? "bg-green-500" : "bg-red-500"}`}></span>
              {label}
            </div>
          );
        })}
      </div>

      {allMet && (
        <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded-sm">
          <p className="text-sm text-green-700 font-medium">✓ Password meets all requirements!</p>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
