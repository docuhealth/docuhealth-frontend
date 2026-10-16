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

// A bar inside a line box of the surrounding font size (the zero-width space sets it),
// so the placeholder line is exactly as tall as the text it stands in for.
export const SkeletonText = ({ className = "", style, textClassName = "" }: SkeletonProps & { textClassName?: string }) => (
  <div className={`flex items-center ${textClassName}`}>
    &#8203;
    <Skeleton className={className} style={style} />
  </div>
);

// A placeholder for a text-sized control (button, pill, badge): give it the real
// element's padding, border and text classes and it gets the same height, because
// the zero-width space sets a line box just like the real label does.
export const SkeletonBox = ({ className = "", style }: SkeletonProps) => (
  <div aria-hidden="true" style={style} className={`motion-safe:animate-pulse bg-gray-200 ${className}`}>
    &#8203;
  </div>
);

export default Skeleton;
