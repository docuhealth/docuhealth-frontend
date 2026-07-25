import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const CustomDropdown = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative z-10" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 justify-between w-full min-w-[120px] px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none transition-colors"
      >
        <span>{value}</span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-full min-w-[120px] bg-white border border-gray-100 rounded-md shadow-lg py-1 z-50">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`block w-full text-left px-4 py-2 text-xs sm:text-sm transition-colors ${
                value === option
                  ? "bg-gray-50 text-docuhealth-primary font-medium"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
