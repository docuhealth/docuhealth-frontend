import React from "react";
import { X, Phone } from "lucide-react";

// Crisp SVG QR Code component matching official laboratory result verification barcodes
const QRCodeSVG = ({ className = "w-24 h-24" }) => (
  <svg
    viewBox="0 0 120 120"
    className={`${className} shrink-0`}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background */}
    <rect width="120" height="120" fill="white" />

    {/* Top-Left Finder Pattern */}
    <rect x="10" y="10" width="32" height="32" fill="black" />
    <rect x="14" y="14" width="24" height="24" fill="white" />
    <rect x="18" y="18" width="16" height="16" fill="black" />

    {/* Top-Right Finder Pattern */}
    <rect x="78" y="10" width="32" height="32" fill="black" />
    <rect x="82" y="14" width="24" height="24" fill="white" />
    <rect x="86" y="18" width="16" height="16" fill="black" />

    {/* Bottom-Left Finder Pattern */}
    <rect x="10" y="78" width="32" height="32" fill="black" />
    <rect x="14" y="82" width="24" height="24" fill="white" />
    <rect x="18" y="86" width="16" height="16" fill="black" />

    {/* Timing Patterns & Alignment Modules */}
    <rect x="46" y="14" width="4" height="4" fill="black" />
    <rect x="54" y="14" width="4" height="4" fill="black" />
    <rect x="62" y="14" width="4" height="4" fill="black" />
    <rect x="70" y="14" width="4" height="4" fill="black" />

    <rect x="14" y="46" width="4" height="4" fill="black" />
    <rect x="14" y="54" width="4" height="4" fill="black" />
    <rect x="14" y="62" width="4" height="4" fill="black" />
    <rect x="14" y="70" width="4" height="4" fill="black" />

    {/* Data Modules Grid */}
    <rect x="46" y="24" width="8" height="4" fill="black" />
    <rect x="58" y="24" width="4" height="8" fill="black" />
    <rect x="66" y="20" width="8" height="8" fill="black" />

    <rect x="46" y="34" width="4" height="8" fill="black" />
    <rect x="54" y="38" width="8" height="4" fill="black" />
    <rect x="66" y="34" width="4" height="4" fill="black" />
    <rect x="74" y="38" width="6" height="6" fill="black" />

    <rect x="24" y="46" width="8" height="4" fill="black" />
    <rect x="36" y="50" width="4" height="8" fill="black" />
    <rect x="46" y="46" width="12" height="12" fill="black" />
    <rect x="50" y="50" width="4" height="4" fill="white" />

    <rect x="62" y="46" width="6" height="6" fill="black" />
    <rect x="72" y="48" width="8" height="4" fill="black" />
    <rect x="84" y="46" width="4" height="8" fill="black" />
    <rect x="92" y="50" width="8" height="4" fill="black" />
    <rect x="104" y="46" width="6" height="6" fill="black" />

    <rect x="26" y="62" width="6" height="6" fill="black" />
    <rect x="36" y="66" width="8" height="4" fill="black" />
    <rect x="48" y="62" width="4" height="8" fill="black" />
    <rect x="56" y="66" width="8" height="4" fill="black" />
    <rect x="68" y="60" width="6" height="8" fill="black" />
    <rect x="78" y="64" width="8" height="4" fill="black" />
    <rect x="90" y="60" width="4" height="8" fill="black" />
    <rect x="100" y="64" width="8" height="6" fill="black" />

    <rect x="46" y="78" width="8" height="4" fill="black" />
    <rect x="58" y="82" width="4" height="8" fill="black" />
    <rect x="66" y="78" width="8" height="6" fill="black" />
    <rect x="78" y="82" width="4" height="6" fill="black" />
    <rect x="86" y="78" width="8" height="4" fill="black" />
    <rect x="98" y="82" width="6" height="6" fill="black" />

    <rect x="46" y="92" width="6" height="6" fill="black" />
    <rect x="56" y="90" width="8" height="4" fill="black" />
    <rect x="68" y="92" width="4" height="8" fill="black" />
    <rect x="76" y="90" width="6" height="4" fill="black" />
    <rect x="86" y="94" width="8" height="6" fill="black" />
    <rect x="98" y="90" width="8" height="4" fill="black" />

    <rect x="48" y="104" width="8" height="4" fill="black" />
    <rect x="60" y="102" width="6" height="6" fill="black" />
    <rect x="70" y="104" width="8" height="4" fill="black" />
    <rect x="82" y="102" width="4" height="6" fill="black" />
    <rect x="90" y="104" width="6" height="4" fill="black" />
    <rect x="100" y="100" width="6" height="8" fill="black" />
  </svg>
);

const SAMPLE_TEST_ITEMS = [
  { name: "Salmonella Typhi O", result: "200", refRange: "0.002- 0.005", unit: "mg/dL" },
  { name: "Salmonella Typhi O", result: "200", refRange: "0.002- 0.005", unit: "mg/dL" },
  { name: "Salmonella Typhi O", result: "200", refRange: "0.002- 0.005", unit: "mg/dL" },
  { name: "Salmonella Typhi O", result: "200", refRange: "0.002- 0.005", unit: "mg/dL" },
  { name: "Salmonella Typhi O", result: "200", refRange: "0.002- 0.005", unit: "mg/dL" },
];

const ReportStylePreviewModal = ({
  isOpen,
  onClose,
  labName = "Akanchawa and sons Lab",
  labAddress = "NO.40 Bole and daughters road, Lagos State, Nigeria",
  contacts = ["+2349060406069", "+2349060406069"],
  logo = null,
  patientName = "Amiefa Obed",
  sex = "Male",
  requestDate = "27/02/2026",
  collectionDate = "27/02/2026",
  requestingClinician = "Dr. Paypal Moniepoint",
  labTechnician = "Dr. Paypal Moniepoint",
}) => {
  if (!isOpen) return null;

  const validContacts = (contacts || []).filter(Boolean);
  const displayContacts = validContacts.length > 0 ? validContacts : ["+2349060406069", "+2349060406069"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 z-10 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-gray-600 hover:text-gray-900 border border-gray-200 shadow-md flex items-center justify-center transition-all hover:scale-105 z-20 cursor-pointer"
          title="Close preview"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Paper Container with Watermark */}
        <div className="relative p-6 sm:p-9 bg-white text-slate-800 select-none">
          {/* Subtle Watermark in background */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
            <div className="w-80 h-80 rounded-full border-[18px] border-slate-900/[0.03] flex items-center justify-center">
              <div className="w-56 h-56 rounded-full border-[12px] border-slate-900/[0.03] flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-slate-900/[0.02]" />
              </div>
            </div>
          </div>

          {/* 1. Header: Logo, Lab Info & Contacts */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-4 pb-4">
            <div className="flex items-start gap-3.5 max-w-md">
              {/* Lab Logo */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center bg-gray-50 shadow-xs">
                {logo ? (
                  <img src={logo} alt="Laboratory Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white font-bold text-lg">
                    {labName?.charAt(0) || "L"}
                  </div>
                )}
              </div>

              {/* Lab Title & Address */}
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#1D4ED8] tracking-tight leading-snug">
                  {labName || "Akanchawa and sons Lab"}
                </h2>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {labAddress || "NO.40 Bole and daughters road, Lagos State, Nigeria"}
                </p>
              </div>
            </div>

            {/* Right Contact Info */}
            <div className="space-y-1.5 self-start sm:self-auto text-xs text-gray-700 font-medium">
              {displayContacts.map((phone, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                  <span className="font-mono text-[11px] sm:text-xs">{phone}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Dark Navy Accent Line */}
          <div className="relative z-10 h-1 sm:h-1.5 bg-[#2B3545] w-full my-3 sm:my-4 rounded-xs" />

          {/* 3. Patient & Request Details + QR Code */}
          <div className="relative z-10 flex flex-row items-center justify-between gap-4 py-2">
            {/* Patient Info Column */}
            <div className="space-y-1 text-xs">
              <p className="font-bold text-sm sm:text-base text-slate-900">
                {patientName}
              </p>
              <p className="text-slate-700">
                <span className="text-gray-500 font-medium">Sex:</span> {sex}
              </p>
              <p className="text-slate-700">
                <span className="text-gray-500 font-medium">Date of request:</span> {requestDate}
              </p>
              <p className="text-slate-700">
                <span className="text-gray-500 font-medium">Sample collection date:</span> {collectionDate}
              </p>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-[1px] bg-gray-200 self-stretch my-1" />

            {/* QR Code Barcode */}
            <div className="flex flex-col items-center justify-center p-1 bg-white border border-gray-100 rounded-xl shadow-xs shrink-0">
              <QRCodeSVG className="w-20 h-20 sm:w-24 sm:h-24" />
            </div>
          </div>

          {/* 4. Results Table */}
          <div className="relative z-10 mt-5">
            {/* Rounded Pill Table Header */}
            <div className="bg-[#F8F9FB] rounded-full px-5 py-2.5 grid grid-cols-12 text-xs font-semibold text-slate-700 border border-gray-100">
              <div className="col-span-5 sm:col-span-4">Test</div>
              <div className="col-span-2 text-center sm:text-left">Result</div>
              <div className="col-span-3 text-center sm:text-left">Reference range</div>
              <div className="col-span-2 sm:col-span-3 text-right">Unit</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-100 mt-1">
              {SAMPLE_TEST_ITEMS.map((item, index) => (
                <div
                  key={index}
                  className="px-5 py-2.5 grid grid-cols-12 items-center text-xs text-slate-800"
                >
                  <div className="col-span-5 sm:col-span-4 font-medium text-slate-800 truncate pr-2">
                    {item.name}
                  </div>
                  <div className="col-span-2 text-center sm:text-left font-semibold text-slate-900">
                    {item.result}
                  </div>
                  <div className="col-span-3 text-center sm:text-left text-gray-600 font-mono text-[11px]">
                    {item.refRange}
                  </div>
                  <div className="col-span-2 sm:col-span-3 text-right text-gray-500">
                    {item.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Clinical Findings & Narrative */}
          <div className="relative z-10 mt-6 pt-4 border-t border-gray-100 space-y-3.5 text-xs text-slate-700 leading-relaxed">
            <div>
              <p className="font-bold text-slate-900 mb-1">Interpretation:</p>
              <p className="text-[11px] sm:text-xs text-slate-600 mb-1">
                Admission: Admitted for a 3-day stay due to Community-Acquired Pneumonia and acute hypoxic respiratory failure.
              </p>
              <p className="text-[11px] sm:text-xs text-slate-600">
                Treatment & Clinical Progress: Patient received IV ceftriaxone and azithromycin. He required 2L of supplemental oxygen on admission but was A follow-up.
              </p>
            </div>

            <div>
              <p className="font-bold text-slate-900 mb-1">Clinical correlation:</p>
              <p className="text-[11px] sm:text-xs text-slate-600 mb-1">
                Admission: Admitted for a 3-day stay due to Community-Acquired Pneumonia and acute hypoxic respiratory failure.
              </p>
              <p className="text-[11px] sm:text-xs text-slate-600">
                Treatment & Clinical Progress: Patient received IV ceftriaxone and azithromycin. He required 2L of supplemental oxygen on admission but was A follow-up ...{" "}
                <span className="text-gray-400 font-medium cursor-pointer hover:underline">See more</span>
              </p>
            </div>
          </div>

          {/* 6. Signatures Footer */}
          <div className="relative z-10 mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-900 text-xs sm:text-sm">
                {requestingClinician}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                (Requesting Clinician)
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-slate-900 text-xs sm:text-sm">
                {labTechnician}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                (Lab Technician)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportStylePreviewModal;
