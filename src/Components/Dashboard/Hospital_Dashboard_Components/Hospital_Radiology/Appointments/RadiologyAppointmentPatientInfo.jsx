import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import GeneralPatientInfoForm from "../../../../ui/GeneralPatientInfoForm";
import OrderScanModal from "../../Hospital_Doctors/Appointments_Dashboard/components/OrderScanModal";

// The order modal is the doctor's Order Scan one: it resolves this appointment into a staff_appointment_order linked by sqid.

const STATUS_COLOR = {
  pending: "text-amber-500",
  confirmed: "text-green-600",
  completed: "text-green-600",
  cancelled: "text-red-500",
};

const RadiologyAppointmentPatientInfo = ({ appointment, onBack, autoOpenCreateOrder }) => {
  const patient = appointment?.patient ?? {};
  const paymentType = patient.payment_provider?.type || patient.payment_category;

  const [showOrderModal, setShowOrderModal] = useState(!!autoOpenCreateOrder);

  useEffect(() => {
    if (autoOpenCreateOrder) setShowOrderModal(true);
  }, [autoOpenCreateOrder]);

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
              Status:{" "}
              <span className={`font-semibold capitalize ${STATUS_COLOR[appointment?.status] || "text-gray-500"}`}>
                {appointment?.status || "—"}
              </span>
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
                {paymentType && (
                  <span className="text-[10px] text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {paymentType}
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

      {showOrderModal && <OrderScanModal selectedPatientDetails={appointment} onClose={() => setShowOrderModal(false)} />}
    </>
  );
};

export default RadiologyAppointmentPatientInfo;
