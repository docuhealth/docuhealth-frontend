import React from "react";
import Skeleton from "./Skeleton";

export interface PatientDetailSkeletonProps {
  tabs?: number;
}

// Patient header + tab strip (grid on phones, row from sm up) + the "General Information"
// form the first tab opens on.
const PatientDetailSkeleton = ({ tabs = 8 }: PatientDetailSkeletonProps) => (
  <div role="status" aria-label="Loading patient data">
    <div className="py-5 border-b flex items-center gap-2">
      <Skeleton className="w-14 h-14 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    {/* Phones: TabComponent2 lays the tabs out as a 2-column grid of buttons. */}
    <div className="grid grid-cols-2 gap-2 pt-3 pb-4 sm:hidden">
      {Array.from({ length: tabs }, (_, i) => (
        <Skeleton key={i} className="h-9 rounded-lg" />
      ))}
    </div>
    <div className="hidden sm:flex gap-6 border-b py-[22px] overflow-hidden">
      {Array.from({ length: tabs }, (_, i) => (
        <Skeleton key={i} className="h-3.5 w-20 shrink-0" />
      ))}
    </div>
    <div className="p-4 mt-14 mb-5 border rounded-lg">
      <Skeleton className="h-4 w-36 mb-5" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-5">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-[46px] w-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default PatientDetailSkeleton;
