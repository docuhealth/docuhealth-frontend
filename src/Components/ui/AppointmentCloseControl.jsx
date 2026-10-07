import { useState } from "react";
import CloseAppointmentModal from "./CloseAppointmentModal";
import { isAppointmentClosed, useCloseAppointment } from "../../queries/Hospital/appointments";

const STATUS_COLOR = {
  pending: "text-amber-500",
  confirmed: "text-green-600",
  completed: "text-green-600",
  cancelled: "text-red-500",
};

// Status label plus "Mark as done" for a staff appointment details header. `listKey` is the list query to refresh.
const AppointmentCloseControl = ({ appointment, listKey }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  // `appointment` is a snapshot from the list, so remember a close made from this view.
  const [closedHere, setClosedHere] = useState(false);
  const closeMutation = useCloseAppointment(listKey, {
    onSuccess: () => {
      setClosedHere(true);
      setShowConfirm(false);
    },
  });

  if (!appointment?.sqid) return null;

  const isClosed = closedHere || isAppointmentClosed(appointment);
  const status = closedHere ? "completed" : appointment.status;
  const firstname = appointment.patient?.firstname || appointment.patient_info?.firstname;

  return (
    <>
      <p className="w-full sm:w-auto">
        Status:{" "}
        <span className={`font-semibold capitalize ${STATUS_COLOR[status] || "text-gray-500"}`}>
          {status || "—"}
        </span>
      </p>
      {!isClosed && (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="w-full sm:w-auto border border-docuhealth-primary text-docuhealth-primary text-sm rounded-full px-5 py-1.5 hover:bg-blue-50 transition-colors cursor-pointer"
        >
          Mark as done
        </button>
      )}

      <CloseAppointmentModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => closeMutation.mutate(appointment.sqid)}
        isPending={closeMutation.isPending}
        firstname={firstname}
      />
    </>
  );
};

export default AppointmentCloseControl;
