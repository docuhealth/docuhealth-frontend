import React, { useState } from "react";
import docuhealth_logo from "../../assets/img/docuhealth_logo.png";
import { getRememberedHospitalLogo } from "../../utils/hospitalBranding";

export interface HospitalLoaderProps {
  logo?: string | null;
  label?: string;
  // fullscreen: covers the app (workspace boot). overlay: covers its nearest
  // `relative` parent, e.g. a modal card while its action saves. inline: in page flow.
  variant?: "fullscreen" | "overlay" | "inline";
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<HospitalLoaderProps["variant"]>, string> = {
  fullscreen: "fixed inset-0 z-[60] bg-white",
  overlay: "absolute inset-0 z-10 bg-white/95 rounded-[inherit]",
  inline: "w-full py-16",
};

// Hospital-branded loading state: the hospital's logo breathes inside a turning
// ring. The ring moves rather than the logo so crests and wordmarks stay legible.
const HospitalLoader = ({ logo, label = "Loading...", variant = "inline", className = "" }: HospitalLoaderProps) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const preferred = logo || getRememberedHospitalLogo();
  const src = preferred && preferred !== failedSrc ? preferred : docuhealth_logo;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-4 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      <div className="relative h-20 w-20">
        <span className="absolute inset-0 rounded-full border-2 border-docuhealth-primary-muted" />
        <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-docuhealth-primary motion-safe:animate-spin" />
        <div className="absolute inset-[7px] rounded-full bg-white overflow-hidden flex items-center justify-center motion-safe:animate-logo-breathe">
          <img
            src={src}
            alt=""
            className="h-full w-full object-contain p-1"
            onError={() => setFailedSrc(src)}
          />
        </div>
      </div>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
};

export default HospitalLoader;
