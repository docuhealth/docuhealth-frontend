import React, { useId } from "react";

const DOCUMENT_PATH =
  "M183 233.5C148.482 233.5 120.5 205.518 120.5 171C120.5 136.482 148.482 108.5 183 108.5C217.518 108.5 245.5 136.482 245.5 171C245.5 205.518 217.518 233.5 183 233.5ZM183 221C210.614 221 233 198.614 233 171C233 143.386 210.614 121 183 121C155.386 121 133 143.386 133 171C133 198.614 155.386 221 183 221ZM176.75 139.75H189.25V152.25H176.75V139.75ZM176.75 164.75H189.25V202.25H176.75V164.75Z";

const CALENDAR_PATH =
  "M164.25 114.75V102.25H151.75V114.75H126.75C123.298 114.75 120.5 117.548 120.5 121V221C120.5 224.452 123.298 227.25 126.75 227.25H239.25C242.702 227.25 245.5 224.452 245.5 221V121C245.5 117.548 242.702 114.75 239.25 114.75H214.25V102.25H201.75V114.75H164.25ZM133 158.5H233V214.75H133V158.5ZM133 127.25H151.75V133.5H164.25V127.25H201.75V133.5H214.25V127.25H233V146H133V127.25ZM169.741 164.528L183 177.786L196.257 164.528L205.097 173.366L191.839 186.626L205.096 199.883L196.258 208.721L183 195.464L169.741 208.721L160.903 199.882L174.161 186.626L160.902 173.366L169.741 164.528Z";

const ICON_PATHS = {
  document: DOCUMENT_PATH,
  calendar: CALENDAR_PATH,
} as const;

export interface EmptyStateProps {
  /** Built-in icon, or pass a custom node via `icon` for anything else. */
  icon?: keyof typeof ICON_PATHS | React.ReactNode;
  title: string;
  description: React.ReactNode;
  className?: string;
}

/**
 * Shared "nothing here yet" illustration + heading + description.
 * Consolidates the empty-state SVG that was duplicated across every
 * patient list view (medical records, appointments, drug records, etc).
 */
const EmptyState = ({ icon = "document", title, description, className = "" }: EmptyStateProps) => {
  const filterId = useId().replace(/[:]/g, "");
  const isBuiltIn = typeof icon === "string" && icon in ICON_PATHS;

  return (
    <div className={`flex flex-col justify-center items-center text-center h-full ${className}`}>
      {isBuiltIn ? (
        <svg width="200" height="200" viewBox="0 0 366 366" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter={`url(#${filterId})`}>
            <circle cx="183" cy="171" r="159" fill="#DBDBDB" />
          </g>
          <circle cx="183" cy="171" r="132" fill="#F6F6F6" />
          <path d={ICON_PATHS[icon as keyof typeof ICON_PATHS]} fill="#929AA3" />
          <defs>
            <filter
              id={filterId}
              x="0"
              y="0"
              width="366"
              height="366"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="12" />
              <feGaussianBlur stdDeviation="12" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0.15 0"
              />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
            </filter>
          </defs>
        </svg>
      ) : (
        icon
      )}
      <h2 className="font-medium pb-1">{title}</h2>
      <div className="max-w-md text-center">
        <p className="text-[12px] text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default EmptyState;
