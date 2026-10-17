import React from "react";
import Skeleton from "./Skeleton";

export interface CardGridSkeletonProps {
  label: string;
  count?: number;
  className?: string;
}

// Placeholder for the 1/2/3-column record card grids (SOAP notes, lab/scan records,
// handover notes...). Header row with a date pill, a few detail lines, then an action.
const CardGridSkeleton = ({ label, count = 6, className = "" }: CardGridSkeletonProps) => (
  <div role="status" aria-label={label} className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 ${className}`}>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="bg-white border rounded-lg p-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <div className="flex flex-col gap-2 py-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="h-8 w-full rounded-full" />
      </div>
    ))}
  </div>
);

export default CardGridSkeleton;
