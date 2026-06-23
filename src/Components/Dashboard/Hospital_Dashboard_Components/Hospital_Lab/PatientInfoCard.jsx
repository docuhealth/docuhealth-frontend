import { Pencil } from "lucide-react";

const calcAge = (dob) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return isNaN(years) ? null : `${years} years`;
};

const PatientInfoCard = ({ order, isCompleted, isRejected, isInProgress, onEditSample, dateLabel: dateLabelProp, hideRequestedBy }) => {
  const requestedBy = order.requestedBy ?? "—";
  const email       = order.email       ?? "—";
  const ageDisplay  = calcAge(order.dob) ?? "—";
  const gender      = order.gender      ?? "—";
  const dateLabel   = dateLabelProp ?? (isCompleted || isRejected ? "Date/Time uploaded:" : "Date/Time of test request:");

  const showSampleCol  = isInProgress || isCompleted;
  const colCount       = (showSampleCol ? 1 : 0) + (hideRequestedBy ? 0 : 1) + 3;
  const gridCols       = colCount === 5 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
                       : colCount === 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                       :                 "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5">
      <div className={`grid ${gridCols} gap-4 sm:gap-6`}>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold text-[#1B2B40]">{order.name}</p>
          <p className="text-xs text-gray-500">Patient HIN: {order.hin}</p>
          <p className="text-xs text-gray-500">Age: {ageDisplay}</p>
          <p className="text-xs text-gray-500">Gender: {gender}</p>
          {order.payment_category && (
            <p className="text-xs text-gray-500">
              Payment category:{" "}
              <span className="text-teal-600 font-medium">{order.payment_category}</span>
            </p>
          )}
        </div>
        {!hideRequestedBy && (
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-400">Requested by:</p>
            <p className="text-sm font-bold text-[#1B2B40]">{requestedBy}</p>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400">Provider information:</p>
          <p className="text-sm font-bold text-[#1B2B40]">{order.hospital}</p>
          <p className="text-xs text-gray-500">Email: {email}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400">{dateLabel}</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#1B2B40]">{order.datetime}</p>
            {isInProgress && onEditSample && (
              <button
                onClick={onEditSample}
                className="text-gray-400 hover:text-[#3E4095] transition-colors"
                title="Edit sample collection info"
              >
                <Pencil size={13} />
              </button>
            )}
          </div>
        </div>
        {showSampleCol && (
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-400">Sample collection date:</p>
            <p className="text-sm font-semibold text-[#1B2B40]">
              {order.specimen_collected_at ?? (isCompleted ? order.datetime : "—")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientInfoCard;
