import React from "react";
import { Plus, X } from "lucide-react";

const dosageUnits = [
  "mg",
  "g",
  "mcg",
  "IU",
  "mL",
  "L",
  "tsp",
  "tbsp",
  "gtt",
  "units",
  "kg"
];

const MedicationSection = ({ medications, setMedications }) => {
  const handleAddMedication = () => {
    setMedications([
      ...medications,
      {
        drug: "",
        dosage: "",
        dosageUnit: "mg",
        route: "Oral",
        frequency: "od_qd",
        duration: "",
        durationUnit: "Month",
      },
    ]);
  };

  const handleRemoveMedication = (index) => {
    const updated = medications.filter((_, i) => i !== index);
    setMedications(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  return (
    <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3">
      <p className="font-medium mb-3 text-[#1B2B40]">Medication</p>

      {medications.map((med, index) => (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-start mt-4 border-b pb-4 last:border-0 last:pb-0"
        >
          <div className="lg:col-span-3">
            <label className="block text-[12px] font-medium text-gray-700 pb-1">Drug Name</label>
            <input
              type="text"
              placeholder="Drug name..."
              value={med.drug}
              onChange={(e) => handleChange(index, "drug", e.target.value)}
              className="w-full border rounded-md p-2.5 text-[12px] focus:ring-1 focus:ring-[#3E4095] outline-none transition-all"
            />
          </div>

          <div className="lg:col-span-3">
            <label className="block text-[12px] font-medium text-gray-700 pb-1">Dosage</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Enter dosage..."
                value={med.dosage}
                onChange={(e) => handleChange(index, "dosage", e.target.value)}
                className="w-1/2 border rounded-md p-2.5 text-[12px] focus:ring-1 focus:ring-[#3E4095] outline-none transition-all"
              />
              <div className="w-1/2 relative">
                <input
                  type="text"
                  list={`dosage-units-${index}`}
                  placeholder="Unit..."
                  value={med.dosageUnit}
                  onChange={(e) => handleChange(index, "dosageUnit", e.target.value)}
                  className="w-full border rounded-md p-2.5 text-[12px] focus:ring-1 focus:ring-[#3E4095] outline-none transition-all"
                />
                <datalist id={`dosage-units-${index}`}>
                  {dosageUnits.map((unit) => (
                    <option key={unit} value={unit} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 relative">
            <label className="block text-[12px] font-medium text-gray-700 pb-1">Route</label>
            <div className="relative">
              <select
                value={med.route}
                onChange={(e) => handleChange(index, "route", e.target.value)}
                className="w-full border rounded-md p-2.5 text-[12px] focus:ring-1 focus:ring-[#3E4095] outline-none appearance-none bg-white pr-8 transition-all"
              >
                <option value="Oral">Oral</option>
                <option value="IV">IV = Intravenous</option>
                <option value="IM">IM = Intramuscular</option>
                <option value="SC">SC = Subcutaneous Injection</option>
                <option value="PV">PV = Per Vagina (Vaginal route)</option>
                <option value="IT">IT = Intrathecal</option>
                <option value="PR">PR = Per rectal</option>
                <option value="SL">SL = Sublingual</option>
                <option value="Topical">Topical</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 relative">
            <label className="block text-[12px] font-medium text-gray-700 pb-1">Frequency</label>
            <div className="relative">
              <select
                value={med.frequency}
                onChange={(e) => handleChange(index, "frequency", e.target.value)}
                className="w-full border rounded-md p-2.5 text-[12px] focus:ring-1 focus:ring-[#3E4095] outline-none appearance-none bg-white pr-8 transition-all"
              >
                <option value="stat">stat - Immediately</option>
                <option value="once">once - One-time dose</option>
                <option value="od_qd">od_qd - Once daily</option>
                <option value="bd_bid">bd_bid - Twice daily</option>
                <option value="tds_tid">tds_tid - Three times daily</option>
                <option value="qid">qid - Four times daily</option>
                <option value="q3h">q3h - Every 3 hours</option>
                <option value="q4h">q4h - Every 4 hours</option>
                <option value="q6h">q6h - Every 6 hours</option>
                <option value="q8h">q8h - Every 8 hours</option>
                <option value="q12h">q12h - Every 12 hours</option>
                <option value="q24h">q24h - Every 24 hours</option>
                <option value="prn">prn - As needed</option>
                <option value="mane">mane - Morning</option>
                <option value="nocte">nocte - Night</option>
                <option value="alt_days">alt_days - Alternate days</option>
                <option value="weekly">weekly - Weekly</option>
                <option value="monthly">monthly - Monthly</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex gap-2 relative">
            <div className="flex-1">
              <label className="block text-[12px] font-medium text-gray-700 pb-1">Duration</label>
              <input
                type="number"
                placeholder="duration..."
                value={med.duration}
                onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                onChange={(e) => handleChange(index, "duration", e.target.value)}
                className="w-full border rounded-md p-2.5 text-[12px] focus:ring-1 focus:ring-[#3E4095] outline-none transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[12px] pb-1">&nbsp;</label>
              <div className="relative">
                <select
                  value={med.durationUnit}
                  onChange={(e) => handleChange(index, "durationUnit", e.target.value)}
                  className="w-full border rounded-md p-2.5 pr-8 text-[12px] appearance-none focus:ring-1 focus:ring-[#3E4095] outline-none transition-all bg-white"
                >
                  <option value="Month">Month (s)</option>
                  <option value="Week">Week (s)</option>
                  <option value="Day">Day (s)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            {medications.length > 1 && (
              <button
                onClick={() => handleRemoveMedication(index)}
                className="text-red-500 hover:text-red-700 transition-colors mt-6 ml-1 p-1"
                title="Remove medication"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        onClick={handleAddMedication}
        className="text-[#3E4095] font-medium text-[12px] mt-4 flex items-center gap-1"
      >
        <Plus size={14} /> Add more drugs
      </button>
    </div>
  );
};

export default MedicationSection;
