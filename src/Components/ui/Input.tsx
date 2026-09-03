import React, { InputHTMLAttributes, ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Shows a red "*" after the label. Visual only (not spread to the input,
   *  so it doesn't trigger the browser's native required popup). */
  required?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  onTrailingIconClick?: () => void;
  error?: string;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      required = false,
      leadingIcon,
      trailingIcon,
      onTrailingIconClick,
      error,
      containerClassName = "",
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <p className="font-semibold pb-1 whitespace-nowrap">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </p>
        )}
        <div className="relative">
          {leadingIcon && (
            <div className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400">
              {leadingIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full px-4 py-3 border rounded-lg outline-hidden focus:border-docuhealth-primary transition-colors ${
              leadingIcon ? "pl-10" : ""
            } ${trailingIcon ? "pr-10" : ""} ${
              error ? "border-red-500 focus:border-red-500" : "border-gray-300"
            } ${className}`}
            {...props}
          />
          {trailingIcon && (
            <button
              type="button"
              onClick={onTrailingIconClick}
              className="absolute top-1/2 right-3 transform -translate-y-1/2"
              disabled={!onTrailingIconClick}
            >
              {trailingIcon}
            </button>
          )}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
