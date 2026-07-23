import React, { useState, useEffect, useRef } from "react";

const CustomTimePicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Parse initial value (e.g. "14:30")
  const [hour24, minute] = value ? value.split(":") : ["08", "00"];
  const h24 = parseInt(hour24, 10);
  const ampm = h24 >= 12 ? "PM" : "AM";
  const hour12 = h24 % 12 || 12;

  const handleHourChange = (newHour12) => {
    const isPM = ampm === "PM";
    let newH24 = newHour12 === 12 ? (isPM ? 12 : 0) : (isPM ? newHour12 + 12 : newHour12);
    onChange(`${String(newH24).padStart(2, "0")}:${minute}`);
  };

  const handleMinuteChange = (newMin) => {
    onChange(`${hour24}:${String(newMin).padStart(2, "0")}`);
  };

  const handleAmPmChange = (newAmPm) => {
    if (newAmPm === ampm) return;
    let newH24 = h24;
    if (newAmPm === "PM" && h24 < 12) newH24 += 12;
    if (newAmPm === "AM" && h24 >= 12) newH24 -= 12;
    onChange(`${String(newH24).padStart(2, "0")}:${minute}`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className="w-full border border-gray-300 rounded-lg px-2 py-2 text-[12px] cursor-pointer flex justify-between items-center focus:border-docuhealth-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-700">{String(hour12).padStart(2, "0")}:{minute} {ampm}</span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 w-full bg-white border border-gray-200 shadow-lg rounded-lg z-50 flex overflow-hidden">
          {/* Hours */}
          <div className="flex-1 h-48 overflow-y-auto border-r border-gray-100 scrollbar-hide" style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}>
            {hours.map((h) => (
              <div 
                key={h} 
                onClick={() => handleHourChange(h)}
                className={`py-2 text-center text-[12px] cursor-pointer hover:bg-docuhealth-primary/10 ${hour12 === h ? "bg-docuhealth-primary text-white hover:bg-docuhealth-primary" : "text-gray-700"}`}
              >
                {String(h).padStart(2, "0")}
              </div>
            ))}
          </div>
          {/* Minutes */}
          <div className="flex-1 h-48 overflow-y-auto border-r border-gray-100 scrollbar-hide" style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}>
            {minutes.map((m) => (
              <div 
                key={m} 
                onClick={() => handleMinuteChange(m)}
                className={`py-2 text-center text-[12px] cursor-pointer hover:bg-docuhealth-primary/10 ${parseInt(minute, 10) === m ? "bg-docuhealth-primary text-white hover:bg-docuhealth-primary" : "text-gray-700"}`}
              >
                {String(m).padStart(2, "0")}
              </div>
            ))}
          </div>
          {/* AM/PM */}
          <div className="flex-1 flex flex-col">
             <div 
               onClick={() => handleAmPmChange("AM")}
               className={`flex-1 flex items-center justify-center text-[12px] font-medium cursor-pointer hover:bg-docuhealth-primary/10 ${ampm === "AM" ? "bg-docuhealth-primary text-white hover:bg-docuhealth-primary" : "text-gray-700"}`}
             >
               AM
             </div>
             <div 
               onClick={() => handleAmPmChange("PM")}
               className={`flex-1 flex items-center justify-center text-[12px] font-medium cursor-pointer hover:bg-docuhealth-primary/10 ${ampm === "PM" ? "bg-docuhealth-primary text-white hover:bg-docuhealth-primary" : "text-gray-700"}`}
             >
               PM
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker;
