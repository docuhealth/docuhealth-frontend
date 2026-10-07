import React from "react";

export interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

// Grey placeholder block; size and shape come from className (e.g. "h-4 w-32").
const Skeleton = ({ className = "", style }: SkeletonProps) => (
  <div aria-hidden="true" style={style} className={`motion-safe:animate-pulse rounded-md bg-gray-200 ${className}`} />
);

export default Skeleton;
