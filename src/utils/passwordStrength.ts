export interface PasswordRequirements {
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  hasMinLength: boolean;
}

export function getPasswordRequirements(password: string): PasswordRequirements {
  return {
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    hasMinLength: password.length >= 8,
  };
}

export function isPasswordValid(requirements: PasswordRequirements): boolean {
  return Object.values(requirements).every(Boolean);
}

export interface PasswordStrength {
  strength: number;
  label: string;
  color: string;
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { strength: 0, label: "", color: "" };

  const requirements = getPasswordRequirements(password);
  const score = Object.values(requirements).filter(Boolean).length;

  if (score <= 1) return { strength: score, label: "Very Weak", color: "bg-red-500" };
  if (score <= 2) return { strength: score, label: "Weak", color: "bg-orange-500" };
  if (score <= 3) return { strength: score, label: "Fair", color: "bg-yellow-500" };
  if (score <= 4) return { strength: score, label: "Good", color: "bg-docuhealth-primary" };
  return { strength: score, label: "Strong", color: "bg-green-500" };
}
