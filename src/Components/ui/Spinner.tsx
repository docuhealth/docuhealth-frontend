import React from "react";

export interface SpinnerProps {
  className?: string;
}

/**
 * The animate-spin loading icon used inside buttons. Extracted so button
 * chrome that doesn't match the shared <Button /> variants (custom hover
 * states, one-off padding, etc.) can still drop the duplicated SVG.
 */
const Spinner = ({ className = "h-4 w-4 text-white" }: SpinnerProps) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    ></path>
  </svg>
);

export default Spinner;
