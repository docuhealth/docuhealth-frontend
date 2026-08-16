import React from "react";
import Spinner from "./Spinner";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "danger" | "ghost";
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-docuhealth-primary text-white disabled:bg-gray-300 disabled:text-gray-500",
  outline:
    "border border-docuhealth-primary text-docuhealth-primary bg-white disabled:border-gray-300 disabled:text-gray-400",
  danger:
    "bg-red-500 text-white disabled:bg-red-300 disabled:text-gray-100",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 disabled:text-gray-400",
};

/**
 * Shared button with a built-in loading spinner state — replaces the
 * animate-spin SVG + "X-ing..." label markup that was hand-copied into
 * every form submit button across the patient screens.
 */
const Button = ({
  variant = "primary",
  loading = false,
  loadingText,
  fullWidth = false,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) => {
  return (
    <button
      className={`py-3 px-4 rounded-full font-medium text-center transition-all disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner className="h-4 w-4 text-current" />
          {loadingText || children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
