import React from "react";
import { CalendarDays, User } from "lucide-react";
import { maskHIN } from "./scanLabResults";
import Skeleton from "../../../../ui/Skeleton";

// One awaiting-approval result, laid out the same for lab and scan rows. `statusRows` is [{ label, value, className }].
const ScanLabResultCard = ({ title, badge, patient, statusRows, reporter, dateTime, onOpen }) => (
  <div className="bg-white border rounded-xl p-4">
    <div className="flex justify-between items-center mb-1 gap-2">
      <p className="font-bold text-docuhealth-dark text-[15px]">{title}</p>
      <div className="bg-docuhealth-primary-muted px-3 py-1 rounded-full shrink-0">
        <p className="text-docuhealth-primary text-[11px] font-medium">{badge}</p>
      </div>
    </div>

    {patient && (
      <p className="text-xs mb-2 flex items-center gap-1.5 flex-wrap">
        <span className="font-medium text-gray-800 capitalize">{patient.name}</span>
        {patient.hin && <span className="text-gray-400">· {maskHIN(patient.hin)}</span>}
      </p>
    )}

    <div className="flex flex-col gap-1.5 mb-3">
      {statusRows.map((row) => (
        <div key={row.label} className="flex items-center gap-1">
          <p className="text-gray-400 text-xs">{row.label}: </p>
          <p className={`text-xs font-semibold capitalize ${row.className}`}>{row.value}</p>
        </div>
      ))}
    </div>

    <div className="border-t border-gray-100 my-3"></div>

    <div className="flex items-center gap-2 mb-3">
      <User size={14} className="text-gray-500" />
      <p className="text-gray-500 text-[12px]">{reporter}</p>
    </div>

    <div className="flex items-start gap-2">
      <CalendarDays size={14} className="text-gray-500 mt-0.5" />
      <p className="text-gray-500 text-[12px] leading-snug">{dateTime}</p>
    </div>

    <div className="border-t border-gray-100 my-3"></div>

    <button
      type="button"
      onClick={onOpen}
      className="w-full bg-docuhealth-primary hover:bg-docuhealth-dark-primary text-white text-[12px] font-medium py-2 rounded-full transition-colors cursor-pointer"
    >
      Open
    </button>
  </div>
);

// Same box model as the card so the grid doesn't shift when results land.
export const ScanLabResultCardSkeleton = () => (
  <div className="bg-white border rounded-xl p-4">
    <div className="flex justify-between items-center mb-2 gap-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
    <Skeleton className="h-3 w-36 mb-3" />
    <div className="flex flex-col gap-2 mb-3">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-3 w-32" />
    </div>
    <div className="border-t border-gray-100 my-3"></div>
    <Skeleton className="h-3 w-28 mb-3" />
    <Skeleton className="h-3 w-36" />
    <div className="border-t border-gray-100 my-3"></div>
    <Skeleton className="h-8 w-full rounded-full" />
  </div>
);

// Six placeholder cards in the results grid.
export const ScanLabResultGridSkeleton = ({ label }) => (
  <div role="status" aria-label={label} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
    {Array.from({ length: 6 }, (_, i) => (
      <ScanLabResultCardSkeleton key={i} />
    ))}
  </div>
);

export default ScanLabResultCard;
