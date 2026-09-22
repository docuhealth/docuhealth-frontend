import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createScanOrder, fetchRadiologyTestTypes } from "../../../../../../queries/Hospital/radiology/scan_requests";
import { resolveOrderContext } from "../../../../../../utils/careOrderContext";
import { extractApiErrorMessage } from "../../../../../../utils/apiError";
import { ChevronDown } from "lucide-react";
import Input from "../../../../../ui/Input";

const toLocalDate = (d) => d.toISOString().slice(0, 10);
const toLocalTime = (d) => d.toTimeString().slice(0, 5);

// Patient(HIN)-based like OrderLabModal — no appointment needed; "Imaging order" searches the LOINC/RSNA catalog as you type.
const OrderScanModal = ({ selectedPatientDetails, onClose }) => {
  const orderContext = resolveOrderContext(selectedPatientDetails);
  const dropdownRef = useRef(null);

  const [type, setType] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [orderDate, setOrderDate] = useState(toLocalDate(new Date()));
  const [orderTime, setOrderTime] = useState(toLocalTime(new Date()));
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: testTypes, isFetching: isSearching } = useQuery({
    queryKey: ["radiology-test-types", debouncedSearch],
    queryFn: fetchRadiologyTestTypes,
    enabled: debouncedSearch.trim().length >= 2,
  });

  const suggestions = debouncedSearch.trim().length >= 2 ? testTypes || [] : [];

  const createOrderMutation = useMutation({
    mutationFn: createScanOrder,
    onSuccess: () => setShowSuccess(true),
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to create scan order."));
    },
  });

  const handleSelectType = (value) => {
    setType(value);
    setSearchInput(value);
    setIsDropdownOpen(false);
  };

  const handleSubmit = () => {
    if (!type.trim() || !orderDate || !orderTime) return;
    createOrderMutation.mutate({
      patient: orderContext.hin,
      order_source: orderContext.orderSource,
      check_in: orderContext.checkIn || undefined,
      items: [{ type: type.trim(), order_date: orderDate, order_time: orderTime }],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-3">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative text-sm">
        {showSuccess ? (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-green-700 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <p className="text-base font-semibold text-gray-800 mb-6 leading-snug">
              You have successfully ordered a<br />scan for this patient!
            </p>
            <button
              onClick={onClose}
              className="w-full bg-docuhealth-primary text-white text-sm font-semibold py-3 rounded-full hover:opacity-90 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <button onClick={onClose} className="text-gray-500 hover:text-black">
                <i className="bx bx-x text-2xl cursor-pointer"></i>
              </button>
            </div>
            <h2 className="text-center font-semibold text-lg text-gray-800">Order scan/X-ray</h2>
            <p className="text-center text-gray-500 mb-4 text-sm">Kindly order a scan for this patient</p>

            <div className="mb-4 text-[12px]" ref={dropdownRef}>
              <label className="font-semibold text-gray-900 pb-1 block">
                Imaging order <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setType(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Search or type a scan (e.g. CT Abdomen)"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-9 text-sm outline-hidden focus:border-docuhealth-primary transition-colors"
                />
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />

                {isDropdownOpen && debouncedSearch.trim().length >= 2 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-3 text-xs text-gray-500 text-center">Searching...</div>
                    ) : suggestions.length === 0 ? (
                      <div className="p-3 text-xs text-gray-500 text-center">
                        No catalog match — "{searchInput}" will be sent as free text.
                      </div>
                    ) : (
                      suggestions.map((name) => (
                        <button
                          type="button"
                          key={name}
                          onClick={() => handleSelectType(name)}
                          className="w-full text-left px-3 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm text-gray-700"
                        >
                          {name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4 flex gap-3">
              <div className="flex-1">
                <Input label="Order date" type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
              </div>
              <div className="flex-1">
                <Input label="Order time" type="time" value={orderTime} onChange={(e) => setOrderTime(e.target.value)} />
              </div>
            </div>

            <button
              disabled={createOrderMutation.isPending || !type.trim() || !orderDate || !orderTime}
              className="mt-2 w-full cursor-pointer bg-docuhealth-primary text-white py-2 rounded-full disabled:bg-docuhealth-primary/60 disabled:cursor-not-allowed text-sm"
              onClick={handleSubmit}
            >
              {createOrderMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Processing Request
                </span>
              ) : (
                "Proceed"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderScanModal;
