import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createScanOrder, fetchRadiologyScans } from "../../../../../../queries/Hospital/radiology/scan_requests";
import { resolveOrderContext } from "../../../../../../utils/careOrderContext";
import { extractApiErrorMessage } from "../../../../../../utils/apiError";
import SearchableSelect from "../../../../../ui/SearchableSelect";

// Patient(HIN)-based like OrderLabModal. "Imaging order" searches the scans catalog server-side as you type and the order references the picked scan by sqid.
const OrderScanModal = ({ selectedPatientDetails, onClose }) => {
  const orderContext = resolveOrderContext(selectedPatientDetails);

  const [selectedScanSqid, setSelectedScanSqid] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  // The catalog is throttled to 60 requests a minute, so search from 2 characters and cache repeat lookups.
  const { data: scans, isFetching: isSearching } = useQuery({
    queryKey: ["radiology-scans", debouncedSearch.trim()],
    queryFn: fetchRadiologyScans,
    enabled: debouncedSearch.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  const term = searchInput.trim();
  const canSearch = term.length >= 2;
  // Also "searching" while the debounce is pending, so the panel never flashes "No scan matches" for a request that hasn't gone out yet.
  const isLoadingScans = canSearch && (term !== debouncedSearch.trim() || isSearching);
  const scanOptions = canSearch ? (scans || []).map((scan) => ({ value: scan.sqid, label: scan.name })) : [];

  const createOrderMutation = useMutation({
    mutationFn: createScanOrder,
    onSuccess: () => setShowSuccess(true),
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to create scan order."));
    },
  });

  const handleSubmit = () => {
    if (!selectedScanSqid) return;
    createOrderMutation.mutate({
      patient: orderContext.hin,
      order_source: orderContext.orderSource,
      check_in: orderContext.checkIn || undefined,
      admission: orderContext.admission || undefined,
      appointment: orderContext.appointment || undefined,
      items: [{ scan: selectedScanSqid }],
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

            <div className="mb-4 text-[12px]">
              <label className="font-semibold text-gray-900 pb-1 block">
                Imaging order <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                value={selectedScanSqid}
                onChange={(sqid) => setSelectedScanSqid(sqid)}
                onSearchChange={setSearchInput}
                options={scanOptions}
                placeholder="Search for a scan (e.g. CT Abdomen)"
                isLoading={isLoadingScans}
                emptyText={canSearch ? `No scan matches "${term}".` : "Type at least 2 characters to search."}
              />
            </div>

            <button
              disabled={createOrderMutation.isPending || !selectedScanSqid}
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
