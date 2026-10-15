import React from "react";

export interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

// Grey placeholder block; size and shape come from className (e.g. "h-4 w-32").
// The default rounded-md is dropped when className sets its own radius, since
// Tailwind's CSS order would otherwise let rounded-md beat rounded-full.
const Skeleton = ({ className = "", style }: SkeletonProps) => {
  const radius = /(^|\s)rounded(-|\s|$)/.test(className) ? "" : "rounded-md";
  return (
    <div aria-hidden="true" style={style} className={`motion-safe:animate-pulse ${radius} bg-gray-200 ${className}`} />
  );
};

export default Skeleton;
