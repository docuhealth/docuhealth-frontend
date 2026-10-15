import React from "react";
import Skeleton from "./Skeleton";

export interface ChartSkeletonProps {
  title: string;
  withControls?: boolean;
}

// Smooth area-line placeholder matching the ECharts line charts (y labels on the
// left, x labels below). `withControls` adds the download + period dropdown stubs
// and switches to the 300px plot those charts use; otherwise it fills the
// fixed h-[380px] frame, so nothing shifts when data lands.
const ChartSkeleton = ({ title, withControls = false }: ChartSkeletonProps) => (
  <div
    role="status"
    aria-label="Loading chart"
    className={`bg-white p-6 rounded-md border border-gray-200 w-full flex flex-col ${withControls ? "" : "h-[380px]"}`}
  >
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xs lg:text-lg lg:font-semibold text-gray-800">{title}</h3>
      {withControls && (
        <div className="flex items-center gap-2">
          <Skeleton className="h-[30px] w-[30px]" />
          <Skeleton className="h-8 w-24" />
        </div>
      )}
    </div>
    <div className={`flex gap-3 ${withControls ? "h-[300px]" : "flex-1 min-h-0"}`}>
      <div className="flex flex-col justify-between py-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-2.5 w-6" />
        ))}
      </div>
      <div className="flex-1 flex flex-col">
        <svg
          aria-hidden="true"
          viewBox="0 0 400 100"
          preserveAspectRatio="none"
          className="flex-1 w-full motion-safe:animate-pulse text-gray-200"
        >
          <path
            d="M0,78 C30,70 50,52 80,56 S130,80 160,62 S210,24 240,34 S290,70 320,52 S370,20 400,28 L400,100 L0,100 Z"
            fill="currentColor"
            opacity="0.6"
          />
          <path
            d="M0,78 C30,70 50,52 80,56 S130,80 160,62 S210,24 240,34 S290,70 320,52 S370,20 400,28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="flex justify-between pt-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-2.5 w-8" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ChartSkeleton;
