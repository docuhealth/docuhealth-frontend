import React from "react";
import Skeleton from "./Skeleton";

export interface RecordRowsSkeletonProps {
  label: string;
  tiles?: number;
  withStatusHeader?: boolean;
  count?: number;
  className?: string;
}

// Placeholder for the bordered "icon tile + label/value" rows (SOAP notes, progress
// notes, issued tasks). Desktop: one row per record with a kebab; mobile: stacked card.
const RecordRowsSkeleton = ({
  label,
  tiles = 3,
  withStatusHeader = false,
  count = 3,
  className = "",
}: RecordRowsSkeletonProps) => (
  <div role="status" aria-label={label} className={`my-4 ${className}`}>
    <div className="hidden lg:block">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`mb-4 border bg-white ${withStatusHeader ? "rounded-xl" : "rounded-md"}`}>
          {withStatusHeader && (
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-8 w-9 rounded-full" />
            </div>
          )}
          <div className="p-4 flex items-center gap-10">
            {Array.from({ length: tiles }, (_, j) => (
              <div key={j} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-3.5 w-28" />
                </div>
              </div>
            ))}
            {!withStatusHeader && <Skeleton className="h-8 w-9 rounded-full ml-auto" />}
          </div>
        </div>
      ))}
    </div>

    <div className="lg:hidden space-y-4">
      {Array.from({ length: Math.min(count, 2) }, (_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className={`flex justify-between items-center ${withStatusHeader ? "px-4 py-3 border-b" : "p-4 pb-0"}`}>
            <Skeleton className={withStatusHeader ? "h-3.5 w-28" : "h-11 w-44 rounded-lg"} />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
          <div className="p-4 flex flex-col gap-3">
            {Array.from({ length: Math.max(tiles - 1, 1) }, (_, j) => (
              <div key={j} className="flex items-center gap-3">
                {!withStatusHeader && j === 0 && <Skeleton className="h-10 w-10 rounded-full" />}
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-3.5 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default RecordRowsSkeleton;
