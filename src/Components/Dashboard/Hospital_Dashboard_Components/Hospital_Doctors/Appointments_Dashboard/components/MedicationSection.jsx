import React, { useState, useEffect, useRef } from "react";
import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import { Plus, X } from "lucide-react";
import Input from "../../../../../ui/Input";
import Select from "../../../../../ui/Select";
import { FREQUENCY_OPTIONS, DEFAULT_FREQUENCY } from "../../../../../../utils/careTaskConstants";

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
        catalog_drug: null,
        drug: "",
        strength: "",
        doseForm: "",
        dosage: "",
        dosageUnit: "mg",
        route: "Oral",
        frequency: DEFAULT_FREQUENCY,
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

  const [activeSearchIndex, setActiveSearchIndex] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const searchTimeout = useRef(null);

  const handleDrugSearch = (index, query) => {
    handleChange(index, "drug", query);
    handleChange(index, "catalog_drug", null); 

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (!query.trim()) {
      setSearchResults([]);
      setActiveSearchIndex(null);
      setSearchPage(1);
      return;
    }

    setActiveSearchIndex(index);
    setSearchPage(1);
    
    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axiosInstanceHos.get(`/api/pharmacy/drugs/autocomplete?query=${query}`);
        const data = res.data;
        setSearchResults(Array.isArray(data) ? data : (data?.results || []));
      } catch (error) {
        console.error("Failed to fetch drugs:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSelectDrug = (index, item) => {
    const updated = [...medications];
    updated[index].drug = item.name;
    updated[index].catalog_drug = item.rxcui;
    updated[index].strength = item.strength || "";
    updated[index].doseForm = item.dose_form || "";
    updated[index].route = item.route || "Oral";
    setMedications(updated);
    
    setSearchResults([]);
    setActiveSearchIndex(null);
    setSearchPage(1);
  };

  return (
    <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3">
      <p className="font-medium mb-3 text-docuhealth-dark">Medication</p>

      {medications.map((med, index) => (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-start mt-4 border-b pb-4 last:border-0 last:pb-0"
        >
          <div className="lg:col-span-3">
            <label className="block text-[12px] font-medium text-gray-700 pb-1">Drug Name<span className="text-red-500"> *</span></label>
            <div className="relative">
              <Input
                placeholder="Drug name..."
                value={med.drug}
                onChange={(e) => handleDrugSearch(index, e.target.value)}
                className="text-[12px] mb-4"
              />
              {activeSearchIndex === index && searchResults.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto mt-1 top-full">
                  {searchResults.slice((searchPage - 1) * 10, searchPage * 10).map((item, idx) => (
                    <li key={idx} className="border-b last:border-0">
                      <button
                        type="button"
                        className="w-full text-left p-2.5 text-[12px] hover:bg-docuhealth-primary/10 cursor-pointer text-gray-800"
                        onClick={() => handleSelectDrug(index, item)}
                      >
                        <span className="block font-medium">{item.name}</span>
                        <span className="block text-[10px] text-gray-500 mt-0.5">
                          {item.strength && <span>{item.strength}</span>}
                          {item.strength && item.dose_form && <span className="mx-1">•</span>}
                          {item.dose_form && <span>{item.dose_form}</span>}
                        </span>
                      </button>
                    </li>
                  ))}
                  {Math.ceil(searchResults.length / 10) > 1 && (
                    <li className="p-2 border-t flex justify-between items-center bg-gray-50 text-[11px] sticky bottom-0">
                      <button
                        type="button"
                        disabled={searchPage === 1}
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setSearchPage(prev => prev - 1); }}
                        className={`px-2 py-1 rounded ${searchPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-docuhealth-primary hover:bg-blue-100'}`}
                      >
                        Prev
                      </button>
                      <span className="text-gray-500">Page {searchPage} of {Math.ceil(searchResults.length / 10)}</span>
                      <button
                        type="button"
                        disabled={searchPage === Math.ceil(searchResults.length / 10)}
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setSearchPage(prev => prev + 1); }}
                        className={`px-2 py-1 rounded ${searchPage === Math.ceil(searchResults.length / 10) ? 'text-gray-400 cursor-not-allowed' : 'text-docuhealth-primary hover:bg-blue-100'}`}
                      >
                        Next
                      </button>
                    </li>
                  )}
                </ul>
              )}
              {activeSearchIndex === index && isSearching && (
                <div className="absolute right-3 top-2.5">
                  <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block text-[12px] font-medium text-gray-700 pb-1">Strength <span className="text-gray-400 font-normal">(not compulsory)</span></label>
                <Input
                  placeholder="Strength..."
                  value={med.strength}
                  disabled={!!med.catalog_drug}
                  onChange={(e) => handleChange(index, "strength", e.target.value)}
                  className={`text-[12px] ${med.catalog_drug ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-[12px] font-medium text-gray-700 pb-1">Dose Form <span className="text-gray-400 font-normal">(not compulsory)</span></label>
                <Select
                  value={med.doseForm}
                  disabled={!!med.catalog_drug}
                  onChange={(value) => handleChange(index, "doseForm", value)}
                  options={[
                    "Tablet", "Capsule", "Syrup", "Suspension", "Injection",
                    "Ointment", "Cream", "Drops", "Inhaler", "Suppository", "Patch",
                  ].map((form) => ({ value: form, label: form }))}
                  placeholder="Form..."
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <label className="block text-[12px] font-medium text-gray-700 pb-1">Dosage<span className="text-red-500"> *</span></label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter dosage..."
                value={med.dosage}
                onChange={(e) => handleChange(index, "dosage", e.target.value)}
                containerClassName="w-1/2"
                className="text-[12px]"
              />
              <div className="w-1/2">
                <Input
                  list={`dosage-units-${index}`}
                  placeholder="Unit..."
                  value={med.dosageUnit}
                  onChange={(e) => handleChange(index, "dosageUnit", e.target.value)}
                  className="text-[12px]"
                />
                <datalist id={`dosage-units-${index}`}>
                  {dosageUnits.map((unit) => (
                    <option key={unit} value={unit} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[12px] font-medium text-gray-700 pb-1">Route<span className="text-red-500"> *</span></label>
            <Select
              value={med.route}
              disabled={!!med.catalog_drug}
              onChange={(value) => handleChange(index, "route", value)}
              options={[
                { value: "Oral", label: "Oral" },
                { value: "IV", label: "IV = Intravenous" },
                { value: "IM", label: "IM = Intramuscular" },
                { value: "SC", label: "SC = Subcutaneous Injection" },
                { value: "PV", label: "PV = Per Vagina (Vaginal route)" },
                { value: "IT", label: "IT = Intrathecal" },
                { value: "PR", label: "PR = Per rectal" },
                { value: "SL", label: "SL = Sublingual" },
                { value: "Topical", label: "Topical" },
              ]}
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[12px] font-medium text-gray-700 pb-1">Frequency<span className="text-red-500"> *</span></label>
            <Select
              value={med.frequency}
              onChange={(value) => handleChange(index, "frequency", value)}
              options={FREQUENCY_OPTIONS}
            />
          </div>

          <div className="lg:col-span-2 flex gap-2 relative">
            <div className="flex-1">
              <label className="block text-[12px] font-medium text-gray-700 pb-1">Duration<span className="text-red-500"> *</span></label>
              <Input
                type="number"
                placeholder="duration..."
                value={med.duration}
                onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                onChange={(e) => handleChange(index, "duration", e.target.value)}
                className="text-[12px]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[12px] pb-1">&nbsp;</label>
              <Select
                value={med.durationUnit}
                onChange={(value) => handleChange(index, "durationUnit", value)}
                options={[
                  { value: "Month", label: "Month (s)" },
                  { value: "Week", label: "Week (s)" },
                  { value: "Day", label: "Day (s)" },
                ]}
              />
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
        className="text-docuhealth-primary font-medium text-[12px] mt-4 flex items-center gap-1"
      >
        <Plus size={14} /> Add more drugs
      </button>
    </div>
  );
};

export default MedicationSection;
