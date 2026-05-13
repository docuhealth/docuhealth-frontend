import React, { useState, useEffect, useRef } from "react";
import { searchICD11 } from "../../../../../../services/icdService";
import { Search, Loader2 } from "lucide-react";

const ICD11DiagnosisSearch = ({ value, onChange, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef(null);

  // Sync internal state with prop value (e.g. when restored from draft)
  useEffect(() => {
    if (value !== searchTerm) {
      setSearchTerm(value || "");
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      // Only search if the term has changed significantly and isn't the already selected value
      if (searchTerm.length >= 3 && searchTerm !== value) {
        setIsLoading(true);
        try {
          const data = await searchICD11(searchTerm);
          setResults(data);
          setShowResults(true);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsLoading(false);
        }
      } else if (searchTerm.length < 3) {
        setResults([]);
        setShowResults(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, value]);

  const handleSelect = (item) => {
    const title = item.title.replace(/<[^>]*>?/gm, ''); // Strip HTML tags if any
    const code = item.theCode ? ` (${item.theCode})` : "";
    const selectedValue = `${title}${code}`;
    setSearchTerm(selectedValue);
    onChange(selectedValue);
    setShowResults(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <textarea
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.length >= 3 && results.length > 0 && setShowResults(true)}
          className="w-full my-2 rounded-sm border focus:outline-none p-3 text-[12px] h-auto min-h-[60px] max-h-[300px] pr-10"
          placeholder={placeholder || "Search for diagnosis..."}
        />
        <div className="absolute right-3 top-5 text-gray-400">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full bg-white border rounded-md shadow-lg max-h-[250px] overflow-y-auto mt-[-8px]">
          {results.map((item, index) => (
            <div
              key={index}
              onClick={() => handleSelect(item)}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-0 transition-colors"
            >
              <div 
                className="text-[12px] font-medium text-gray-800" 
                dangerouslySetInnerHTML={{ __html: item.title }} 
              />
              {item.theCode && (
                <div className="text-[10px] text-blue-600 font-mono mt-1">
                  ICD-11 Code: {item.theCode}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {showResults && results.length === 0 && !isLoading && searchTerm.length >= 3 && searchTerm !== value && (
        <div className="absolute z-50 w-full bg-white border rounded-md shadow-lg p-3 text-[12px] text-gray-500 mt-[-8px]">
          No matching diagnoses found in ICD-11
        </div>
      )}
    </div>
  );
};

export default ICD11DiagnosisSearch;
