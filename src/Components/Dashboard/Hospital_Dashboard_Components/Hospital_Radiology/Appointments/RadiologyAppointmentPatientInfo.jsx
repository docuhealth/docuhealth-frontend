import React, { useEffect, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import GeneralPatientInfoForm from "../../../../ui/GeneralPatientInfoForm";
import Input from "../../../../ui/Input";

// Dummy-only — no endpoint lets a radiologist browse real appointments yet (BACKEND_RADIOLOGY_ISSUES.md item 2).

const toLocalDate = (d) => d.toISOString().slice(0, 10);
const toLocalTime = (d) => d.toTimeString().slice(0, 5);

const RadiologyAppointmentPatientInfo = ({ appointment, onBack, autoOpenCreateOrder }) => {
  const patient = appointment?.patient ?? {};

  const [showOrderModal, setShowOrderModal] = useState(!!autoOpenCreateOrder);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [type, setType] = useState("");
  const [orderDate, setOrderDate] = useState(toLocalDate(new Date()));
  const [orderTime, setOrderTime] = useState(toLocalTime(new Date()));

  useEffect(() => {
    if (autoOpenCreateOrder) setShowOrderModal(true);
  }, [autoOpenCreateOrder]);

  const resetForm = () => {
    setType("");
    setOrderDate(toLocalDate(new Date()));
    setOrderTime(toLocalTime(new Date()));
  };

  const handleCreateOrder = () => {
    if (!type.trim() || !orderDate || !orderTime) return;
    setShowOrderModal(false);
    resetForm();
    setShowSuccessModal(true);
  };

  return (
    <>
      <div className="bg-white rounded-xl border mt-3 p-5 text-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 gap-4 sm:gap-0">
          <button type="button" onClick={onBack} className="flex items-center gap-1 cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-gray-800" />
            <p className="font-semibold">Patient&apos;s details</p>
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <p className="w-full sm:w-auto">
              Status: <span className="font-semibold text-amber-500">Pending</span>
            </p>
            <button
              type="button"
              onClick={() => setShowOrderModal(true)}
              className="w-full sm:w-auto border border-docuhealth-primary text-docuhealth-primary text-sm rounded-full px-5 py-1.5 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              Create an order
            </button>
          </div>
        </div>

        <div className="py-5 border-b">
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full bg-docuhealth-border-light flex items-center justify-center text-xl text-black shrink-0">
              {`${patient?.firstname?.[0] ?? ""}${patient?.lastname?.[0] ?? ""}`.toUpperCase()}
            </div>

            <div className="flex flex-col items-start ml-3">
              <p className="text-[16px] font-medium text-docuhealth-dark">
                {patient?.firstname} {patient?.lastname}
              </p>
              <p className="text-[14px] text-gray-500 mt-0.5 flex items-center gap-1">
                {patient?.payment_category && (
                  <span className="text-[10px] text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {patient.payment_category}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full py-3">
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              className="text-sm px-2 sm:px-4 py-2 font-semibold text-docuhealth-primary border-b-2 border-docuhealth-primary"
            >
              Patient&apos;s information
            </button>
          </div>
          <div className="py-1">
            <GeneralPatientInfoForm patient={patient} />
          </div>
        </div>
      </div>

      {/* ── Create Scan Order modal ── */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 flex flex-col gap-6 text-sm">
            <div className="relative flex items-start justify-center">
              <div className="text-center">
                <h3 className="text-[20px] font-semibold text-docuhealth-dark">Create scan order</h3>
                <p className="text-sm text-gray-500 mt-1">Kindly order a scan</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowOrderModal(false);
                  resetForm();
                }}
                className="absolute right-0 top-0 text-gray-800 hover:text-black transition-colors"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-docuhealth-dark font-medium">Imaging order</label>
              <Input type="text" value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. CT Abdomen" />
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm text-docuhealth-dark font-medium">Order date</label>
                <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm text-docuhealth-dark font-medium">Order time</label>
                <Input type="time" value={orderTime} onChange={(e) => setOrderTime(e.target.value)} />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateOrder}
              disabled={!type.trim() || !orderDate || !orderTime}
              className="w-full bg-docuhealth-primary text-white text-sm font-medium py-2.5 rounded-full transition-colors disabled:opacity-50 hover:bg-docuhealth-dark-primary"
            >
              Proceed
            </button>
          </div>
        </div>
      )}

      {/* ── Success modal ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-auto p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-green-700 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <p className="text-base font-semibold text-gray-800 mb-6 leading-snug">
              You have successfully created
              <br />a scan order for this patient!
            </p>
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-docuhealth-primary text-white text-sm font-semibold py-3 rounded-full hover:bg-docuhealth-dark-primary transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RadiologyAppointmentPatientInfo;
