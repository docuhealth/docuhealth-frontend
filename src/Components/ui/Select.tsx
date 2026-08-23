import React, { ReactNode, SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  children: ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      containerClassName = "",
      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full ${containerClassName}`}>
        {label && <p className="font-semibold pb-1 whitespace-nowrap">{label}</p>}
        <select
          ref={ref}
          disabled={disabled}
          className={`w-full border p-2 rounded-lg outline-hidden focus:border-docuhealth-primary transition-colors ${
            disabled ? "bg-gray-100" : ""
          } ${
            error ? "border-red-500 focus:border-red-500" : "border-gray-300"
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
