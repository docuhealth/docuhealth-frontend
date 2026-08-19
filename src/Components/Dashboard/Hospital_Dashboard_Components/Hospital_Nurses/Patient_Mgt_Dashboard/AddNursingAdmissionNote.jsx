import React, { useState } from "react";
import { ArrowLeft, Clock, ChevronDown } from "lucide-react";
import Modal from "../../../../ui/Modal";

// --- Options Data ---
const painScoreOptions = [
  "0 (No pain)",
  "1-3 (Mild Pain)",
  "4-6 (Moderate Pain)",
  "7-10 (Severe Pain)",
];

const mobilityOptions = [
  "Fully mobile",
  "Assisted Ambulation",
  "Bedridden / Immobile",
];

const nutritionalOptions = [
  "Well nourished",
  "At risk of malnutrition",
  "Severely malnourished",
];

const fluidIntakeSources = [
  "Oral / Free Fluids",
  "Intravenous (IV) Fluids",
  "Enteral / Tube Feeding",
  "Parenteral Nutrition (TPN / PPN)",
  "Blood / Blood Products",
];

const routeOptions = [
  "Oral (PO)",
  "Nasogastric Tube (NGT)",
  "Orogastric Tube (OGT)",
  "Percutaneous Endoscopic Gastrostomy (PEG Tube)",
  "Jejunostomy Tube (J-Tube)",
  "Peripheral Intravenous (PIV) Line",
  "Central Venous Catheter (CVC) / Triple Lumen",
  "Peripherally Inserted Central Catheter (PICC Line)",
  "Subcutaneous (Hypodermoclysis)",
];

const fluidFeedOptions = [
  "Water",
  "Clear Liquids (Broth, Apple Juice, Clear Tea)",
  "Full Liquids (Milk, Smooth Soup, Custard)",
  "Oral Rehydration Therapy (ORS)",
  "Standard Polymeric Feed",
  "High-Protein / High-Calorie Formula",
  "Diabetic Formula",
  "Renal Formula",
  "Blenderized Hospital Diet / Expressed Breast Milk (EBM)",
  "0.9% Normal Saline (NS)",
  "5% Dextrose in Water (D5W)",
  "10% Dextrose in Water (D10W)",
  "Dextrose Saline (4.3% Dextrose / 0.18% NaCl)",
  "Ringer's Lactate / Hartmann's Solution",
  "Half-Normal Saline (0.45% NaCl)",
  "Whole Blood",
  "Packed Red Blood Cells (PRBC)",
  "Fresh Frozen Plasma (FFP)",
  "Platelet Concentrate",
  "Cryoprecipitate / Human Albumin 20%",
];

const outputTypes = [
  "Urine",
  "Stool / Bowel",
  "Vomitus / Emesis",
  "Nasogastric (NG) / Gastric Suction",
  "Surgical Drain / Wound Drain",
  "Chest Tube Drainage",
  "Ascitic / Peritoneal Fluid",
  "Sputum / Exudate",
  "CSF Drainage",
];

const outputCharacteristicsMap = {
  "Urine": [
    "Clear / Straw-Colored",
    "Amber / Concentrated",
    "Concentrated / Tea-Colored",
    "Frank Blood / Hematuria",
    "Cloudy / Turbid",
    "Sediment / Mucus Present",
  ],
  "Stool / Bowel": [
    "Formed / Soft",
    "Loose / Semi-Liquid",
    "Watery / Liquid",
    "Rice-Water",
    "Melena",
    "Bloody / Dysenteric",
    "Bilious",
  ],
  "Vomitus / Emesis": [
    "Clear / Gastric Secretions",
    "Undigested Food Particles",
    "Bilious (Dark green/yellow)",
    "Coffee-Ground",
    "Frank Blood / Hematemesis",
  ],
  "Nasogastric (NG) / Gastric Suction": [
    "Clear / Straw-Colored",
    "Green / Bilious",
    "Brown / Coffee-Ground",
    "Bloody / Sanguineous",
  ],
  "Surgical Drain / Wound Drain": [
    "Serous",
    "Serosanguinous",
    "Sanguineous",
    "Purulent",
    "Haemoserous",
  ],
  "Chest Tube Drainage": [
    "Serous",
    "Serosanguinous",
    "Sanguineous",
    "Purulent / Empyema",
    "Chylous / Milky",
    "Clotted",
  ],
  "Ascitic / Peritoneal Fluid": [
    "Straw-Colored / Transudative",
    "Turbid / Cloudy",
    "Purulent",
    "Hemorrhagic / Bloody",
    "Chylous",
    "Bile-Stained / Bilious",
  ],
  "Sputum / Exudate": [
    "Mucoid",
    "Mucopurulent",
    "Purulent",
    "Hemoptysis / Blood-Stained",
    "Frank Blood",
    "Frothy / Pink-Tinged",
  ],
  "CSF Drainage": [
    "Clear / \"Rock Water\"",
    "Xanthochromic",
    "Sanguineous / Bloody",
    "Turbid / Cloudy",
    "Sediment / Debris Present",
  ],
};


const AddNursingAdmissionNote = ({ setShowAdmissionNote, selected }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    bloodPressure: "",
    temperature: "",
    respiratoryRate: "",
    height: "",
    heartRate: "",
    weight: "",
    bmi: "",
    painScore: "",
    spo2: "",
    mobilityAssessment: "",
    nutritionalAssessment: "",
    allergies: "",
    fallRisk: "",
    skinAssessment: "",

    // Step 2
    intakeSource: "",
    intakeRoute: "",
    fluidFeed: "",
    intakeVolume: "",
    intakeTime: "",
    outputType: "",
    outputCharacteristics: "",
    outputVolume: "",
    outputTime: "",
    nursingRemark: "",

    // Step 3
    nursingConcerns: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset dependent field if outputType changes
      ...(name === "outputType" ? { outputCharacteristics: "" } : {}),
    }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    // In the future: API call to submit formData
    setShowSuccessModal(true);
  };

  const closeAndReturn = () => {
    setShowSuccessModal(false);
    setShowAdmissionNote(false);
  };

  return (
    <div className="bg-white my-5 border rounded-lg pt-5 lg:pt-8 px-4 lg:px-6 pb-8 text-sm">
      {/* Header */}
      <div className="flex items-center gap-2 cursor-pointer border-b pb-3 mb-6" onClick={() => setShowAdmissionNote(false)}>
        <ArrowLeft size={16} />
        <h2 className="font-semibold text-[15px] text-gray-800">Nursing Assessment</h2>
      </div>

      {/* Progress Bar */}
      <div className="w-full mb-8">
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-docuhealth-primary transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
        <p className="text-center text-xs font-semibold text-gray-800 mt-2">
          Step {currentStep} of 3
        </p>
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        {currentStep === 1 && (
          <div className="animate-in fade-in duration-300">
            {/* Vital Signs */}
            <div className="border border-gray-100 rounded-xl p-6 bg-white  mb-6">
              <h3 className="font-semibold text-gray-800 mb-5 text-[15px]">Vital signs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { label: "Blood pressure", name: "bloodPressure", adornment: "mmHg", placeholder: "Enter blood pressure" },
                  { label: "Temperature", name: "temperature", adornment: "°C", placeholder: "Enter temperature" },
                  { label: "Respiratory rate", name: "respiratoryRate", adornment: "/Min", placeholder: "Enter respiratory rate" },
                  { label: "Height", name: "height", adornment: "Cm", placeholder: "Enter height" },
                  { label: "Heart rate", name: "heartRate", adornment: "Bpm", placeholder: "Enter heart rate" },
                  { label: "Weight", name: "weight", adornment: "Kg", placeholder: "Enter weight" },
                  { label: "BMI", name: "bmi", adornment: "BMI", placeholder: "Enter BMI" },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-gray-700">{field.label}</label>
                    <div className="relative">
                      <input
                        type="text"
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full bg-white border border-gray-200 rounded-md pl-3 pr-12 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-colors"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400 font-medium">
                        {field.adornment}
                      </span>
                    </div>
                  </div>
                ))}
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">Pain score</label>
                  <div className="relative"><select
                    name="painScore"
                    value={formData.painScore}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary appearance-none transition-colors"
                  >
                    <option value="" disabled>Select pain score</option>
                    {painScoreOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /></div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">SPO2</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="spo2"
                      value={formData.spo2}
                      onChange={handleChange}
                      placeholder="Enter SPO2"
                      className="w-full bg-white border border-gray-200 rounded-md pl-3 pr-8 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400 font-medium">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobility & Nutrition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border border-gray-100 rounded-xl p-6 bg-white ">
                <h3 className="font-semibold text-gray-800 mb-4 text-[15px]">Mobility Assessment</h3>
                <div className="relative"><select
                  name="mobilityAssessment"
                  value={formData.mobilityAssessment}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary appearance-none"
                >
                  <option value="" disabled>Select mobility</option>
                  {mobilityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /></div>
              </div>
              <div className="border border-gray-100 rounded-xl p-6 bg-white ">
                <h3 className="font-semibold text-gray-800 mb-4 text-[15px]">Nutritional Assessment</h3>
                <div className="relative"><select
                  name="nutritionalAssessment"
                  value={formData.nutritionalAssessment}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary appearance-none"
                >
                  <option value="" disabled>Select nutritional status</option>
                  {nutritionalOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /></div>
              </div>
            </div>

            {/* Textareas */}
            {[{ title: "Allergies", name: "allergies" }, { title: "Fall Risk assessment", name: "fallRisk" }, { title: "Skin assessment", name: "skinAssessment" }].map((section) => (
              <div key={section.name} className="border border-gray-100 rounded-xl p-6 bg-white  mb-6">
                <h3 className="font-semibold text-gray-800 mb-4 text-[15px]">{section.title}</h3>
                <textarea
                  name={section.name}
                  value={formData[section.name]}
                  onChange={handleChange}
                  placeholder="Type here..."
                  rows={4}
                  className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary resize-y"
                ></textarea>
              </div>
            ))}
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-in fade-in duration-300">
            {/* Fluid Intake */}
            <h3 className="font-semibold text-gray-800 text-lg mb-4">Fluid Intake</h3>
            <div className="border border-gray-100 rounded-xl p-6 bg-white  mb-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">Intake source</label>
                  <div className="relative"><select
                    name="intakeSource"
                    value={formData.intakeSource}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary appearance-none"
                  >
                    <option value="" disabled>Select source</option>
                    {fluidIntakeSources.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /></div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">Fluid/Feed</label>
                  <div className="relative"><select
                    name="fluidFeed"
                    value={formData.fluidFeed}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary appearance-none"
                  >
                    <option value="" disabled>Select fluid/feed</option>
                    {fluidFeedOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /></div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">Route</label>
                  <div className="relative"><select
                    name="intakeRoute"
                    value={formData.intakeRoute}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary appearance-none"
                  >
                    <option value="" disabled>Select route</option>
                    {routeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /></div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">Intake volume (ML)</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="intakeVolume"
                      value={formData.intakeVolume}
                      onChange={handleChange}
                      placeholder="e.g. 250"
                      className="w-full bg-white border border-gray-200 rounded-md pl-3 pr-12 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-50 text-docuhealth-primary px-2 py-0.5 rounded text-[11px] font-semibold">
                      ML
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Time recorded</label>
                <div className="relative">
                  <input
                    type="time"
                    name="intakeTime"
                    value={formData.intakeTime}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary"
                  />
                  {/* Time input usually has a built in clock icon in browsers, but we can style if needed */}
                </div>
              </div>
            </div>

            {/* Fluid Output */}
            <h3 className="font-semibold text-gray-800 text-lg mb-4">Fluid output</h3>
            <div className="border border-gray-100 rounded-xl p-6 bg-white  mb-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[13px] font-medium text-gray-700">Output type</label>
                  <div className="relative"><select
                    name="outputType"
                    value={formData.outputType}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary appearance-none"
                  >
                    <option value="" disabled>Select output type</option>
                    {outputTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /></div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">Output characteristics</label>
                  <div className="relative"><select
                    name="outputCharacteristics"
                    value={formData.outputCharacteristics}
                    onChange={handleChange}
                    disabled={!formData.outputType}
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary appearance-none disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="" disabled>
                      {formData.outputType ? "Select characteristics" : "Select type first"}
                    </option>
                    {formData.outputType && outputCharacteristicsMap[formData.outputType]?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /></div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">Output volume (ML)</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="outputVolume"
                      value={formData.outputVolume}
                      onChange={handleChange}
                      placeholder="e.g. 250"
                      className="w-full bg-white border border-gray-200 rounded-md pl-3 pr-12 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-50 text-docuhealth-primary px-2 py-0.5 rounded text-[11px] font-semibold">
                      ML
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Time recorded</label>
                <div className="relative">
                  <input
                    type="time"
                    name="outputTime"
                    value={formData.outputTime}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary"
                  />
                </div>
              </div>
            </div>

            {/* Nursing Remark */}
            <div className="border border-gray-100 rounded-xl p-6 bg-white  mb-6">
              <h3 className="font-semibold text-gray-800 mb-4 text-[15px]">Nursing remark</h3>
              <textarea
                name="nursingRemark"
                value={formData.nursingRemark}
                onChange={handleChange}
                placeholder="Type here..."
                rows={4}
                className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary resize-y"
              ></textarea>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="animate-in fade-in duration-300">
             <div className="border border-gray-100 rounded-xl p-6 bg-white  mb-6">
              <h3 className="font-semibold text-gray-800 mb-4 text-[15px]">Initial Nursing concerns</h3>
              <textarea
                name="nursingConcerns"
                value={formData.nursingConcerns}
                onChange={handleChange}
                placeholder="Type here..."
                rows={6}
                className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary resize-y"
              ></textarea>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-10">
          <button
            type="button"
            onClick={currentStep === 1 ? () => setShowAdmissionNote(false) : prevStep}
            className="text-docuhealth-primary hover:bg-gray-50 font-medium px-10 py-2.5 border border-docuhealth-primary rounded-full transition-colors"
          >
            {currentStep === 1 ? "Cancel" : "Back"}
          </button>
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="bg-docuhealth-primary hover:bg-opacity-90 text-white font-medium px-10 py-2.5 rounded-full transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-docuhealth-primary hover:bg-opacity-90 text-white font-medium px-10 py-2.5 rounded-full transition-colors"
            >
              Upload assessment
            </button>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <Modal isVisible={showSuccessModal} onClose={closeAndReturn}>
          <div className="p-6 text-center max-w-sm mx-auto flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Success!</h2>
            <p className="text-gray-600 text-sm mb-8 leading-relaxed">
              You have successfully uploaded your nursing admission note! You can now carry on with other tasks.
            </p>
            <button
              onClick={closeAndReturn}
              className="w-full bg-docuhealth-primary hover:bg-opacity-90 text-white font-medium py-2.5 rounded-full transition-colors"
            >
              Back to dashboard
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AddNursingAdmissionNote;
