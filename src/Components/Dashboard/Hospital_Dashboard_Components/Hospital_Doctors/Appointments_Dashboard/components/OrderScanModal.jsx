import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import {
  COMMON_SCAN_QUERIES,
  createScanOrder,
  radiologyScanSearchQuery,
} from "../../../../../../queries/Hospital/radiology/scan_requests";
import { resolveOrderContext } from "../../../../../../utils/careOrderContext";
import { extractApiErrorMessage } from "../../../../../../utils/apiError";
import SearchableSelect from "../../../../../ui/SearchableSelect";
import HospitalLoader from "../../../../../ui/HospitalLoader";

// Each scan order source belongs to one role: a radiologist can only order against an appointment booked with them, a doctor against their appointment, admission or check-in.
const resolveScanOrderContext = (details, orderedBy) =>
  orderedBy === "radiologist"
    ? {
        hin: details?.patient?.hin || details?.patient_info?.hin || "",
        orderSource: "radiologist_appointment_order",
        appointment: details?.sqid || null,
        checkIn: null,
        admission: null,
      }
    : resolveOrderContext(details, { fallbackOrderSource: "doctor_appointment_order" });

// Preloaded common scans filter instantly on every word typed ("chest xr" finds "XR Chest 2 Views"); the server's catalog-wide matches are appended once they arrive.
const mergeScanOptions = (term, commonScans, searchResults = []) => {
  const words = term.toLowerCase().split(/\s+/).filter(Boolean);
  const seen = new Set();
  const local = commonScans
    .filter((scan) => !seen.has(scan.sqid) && seen.add(scan.sqid))
    .filter((scan) => words.every((w) => scan.name.toLowerCase().includes(w)))
    .sort((a, b) => Number(b.name.toLowerCase().startsWith(words[0] || "")) - Number(a.name.toLowerCase().startsWith(words[0] || "")));
  const remote = (searchResults || []).filter((scan) => !seen.has(scan.sqid));
  return [...local, ...remote].map((scan) => ({ value: scan.sqid, label: scan.name }));
};

// Patient(HIN)-based like OrderLabModal. "Imaging order" searches the scans catalog server-side as you type and the order references the picked scan by sqid.
const OrderScanModal = ({ selectedPatientDetails, onClose, orderedBy = "doctor" }) => {
  const orderContext = resolveScanOrderContext(selectedPatientDetails, orderedBy);
  // Every source needs exactly one linked record now that walk-in is gone.
  const missingRecord = !orderContext.appointment && !orderContext.checkIn && !orderContext.admission;

  const [selectedScanSqid, setSelectedScanSqid] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Each common group shows as soon as it lands instead of waiting for all ten.
  const commonQueries = useQueries({ queries: COMMON_SCAN_QUERIES.map(radiologyScanSearchQuery) });
  const commonScans = commonQueries.flatMap((q) => q.data || []);
  const isLoadingCommon = commonQueries.some((q) => q.isLoading);

  // The catalog is throttled to 60 requests a minute, so search from 2 characters and cache repeat lookups.
  const { data: scans, isFetching: isSearching } = useQuery({
    ...radiologyScanSearchQuery(debouncedSearch.trim()),
    enabled: debouncedSearch.trim().length >= 2,
  });

  const term = searchInput.trim();
  const canSearch = term.length >= 2;
  // Also "searching" while the debounce is pending, so the panel never flashes "No scan matches" for a request that hasn't gone out yet.
  const isSearchPending = canSearch && (term !== debouncedSearch.trim() || isSearching);
  const scanOptions = mergeScanOptions(term, commonScans, canSearch && !isSearchPending ? scans : []);
  const isLoadingScans = scanOptions.length === 0 && (term ? isSearchPending : isLoadingCommon);

  const createOrderMutation = useMutation({
    mutationFn: createScanOrder,
    onSuccess: () => setShowSuccess(true),
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to create scan order."));
    },
  });

  const handleSubmit = () => {
    if (!selectedScanSqid || missingRecord) return;
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
        {createOrderMutation.isPending && <HospitalLoader variant="overlay" label="Sending scan order..." />}
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
                emptyText={
                  canSearch ? `No scan matches "${term}".` : term ? "Keep typing to search all scans." : "Type to search all scans."
                }
              />
            </div>

            {missingRecord && (
              <p className="mb-2 text-[12px] text-red-500">
                {orderedBy === "radiologist"
                  ? "This patient needs an appointment booked with you by the reception desk before you can order a scan."
                  : "Open this patient from an appointment, admission or check-in to order a scan."}
              </p>
            )}

            <button
              disabled={createOrderMutation.isPending || !selectedScanSqid || missingRecord}
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
