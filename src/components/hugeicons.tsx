import type { ComponentProps, ReactNode } from "react";

// The design draws these from Hugeicons (free set, MIT) rather than Phosphor, so they're copied
// here instead of pulling in another icon package. Each is 1em square and drawn in currentColor;
// size them with `size-*` like a Phosphor icon.

type IconProps = Omit<ComponentProps<"svg">, "children">;

function Hugeicon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

/** Hugeicons `x-ray`. */
export function XRayIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <>
        <rect width="20" height="18" rx="5" transform="matrix(0 -1 -1 0 21 22)" />
        <path d="M12 5v9" />
        <path d="M12 14.332c-.953 0-1.857-.105-2.671-.294c-.875-.203-1.829.437-1.829 1.367c0 .485.266.935.707 1.099q.486.181 1.036.314c.592.143 1.112.53 1.37 1.1l.106.236c.232.516.732.846 1.281.846c.55 0 1.049-.33 1.281-.846l.107-.236c.257-.57.777-.957 1.37-1.1a9 9 0 0 0 1.035-.314c.44-.164.707-.614.707-1.1c0-.929-.954-1.57-1.829-1.366c-.813.189-1.718.294-2.671.294Z" />
        <path d="M15 7c-.387.619-.916 1-1.5 1s-1.113-.381-1.5-1c-.387.619-.916 1-1.5 1S9.387 7.619 9 7m-2 3c.644.619 1.527 1 2.5 1s1.856-.381 2.5-1c.644.619 1.527 1 2.5 1s1.856-.381 2.5-1" />
      </>
    </Hugeicon>
  );
}

/** Hugeicons `clock-05`: a clock whose rim fades into dashes. */
export function ClockFadingIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <>
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2c4.478 0 8.226 2.943 9.5 7H19" />
        <path d="M12 8v4l2 2m7.955-1q.045-.495.045-1m-7 10a10 10 0 0 0 1-.392M20.79 17q.291-.558.515-1.154m-3.113 4.383q.518-.428.977-.922" />
      </>
    </Hugeicon>
  );
}

/** Hugeicons `checkmark-circle-02`. */
export function CheckmarkCircleIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="m8 12.5l2.5 2.5L16 9" />
      </>
    </Hugeicon>
  );
}

/** Hugeicons `clock-hour-3`. */
export function ClockIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6h4" />
      </>
    </Hugeicon>
  );
}

/** Hugeicons `calendar-add-02`. */
export function CalendarAddIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <path d="M16 2v4M8 2v4m5-2h-2C7.229 4 5.343 4 4.172 5.172S3 8.229 3 12v2c0 3.771 0 5.657 1.172 6.828S7.229 22 11 22h2c3.771 0 5.657 0 6.828-1.172S21 17.771 21 14v-2c0-3.771 0-5.657-1.172-6.828S16.771 4 13 4M3 10h18m-9 3v6m3-3H9" />
    </Hugeicon>
  );
}

/** Hugeicons `add-01`. */
export function AddIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <path d="M12.001 5v14.002m7.001-7H5" />
    </Hugeicon>
  );
}

/** Hugeicons `dashboard-square-01`: four rounded squares, for a grid layout. */
export function GridViewIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <path
        strokeLinecap="square"
        d="M13.69 19.457c-.19-.46-.19-1.042-.19-2.207s0-1.747.19-2.207a2.5 2.5 0 0 1 1.353-1.353c.46-.19 1.042-.19 2.207-.19s1.747 0 2.207.19a2.5 2.5 0 0 1 1.353 1.353c.19.46.19 1.042.19 2.207s0 1.747-.19 2.207a2.5 2.5 0 0 1-1.353 1.353c-.46.19-1.042.19-2.207.19s-1.747 0-2.207-.19a2.5 2.5 0 0 1-1.353-1.353Zm0-10.5c-.19-.46-.19-1.042-.19-2.207s0-1.747.19-2.207a2.5 2.5 0 0 1 1.353-1.353C15.503 3 16.085 3 17.25 3s1.747 0 2.207.19a2.5 2.5 0 0 1 1.353 1.353c.19.46.19 1.042.19 2.207s0 1.747-.19 2.207a2.5 2.5 0 0 1-1.353 1.353c-.46.19-1.042.19-2.207.19s-1.747 0-2.207-.19a2.5 2.5 0 0 1-1.353-1.353Zm-10.5 10.5C3 18.997 3 18.415 3 17.25s0-1.747.19-2.207a2.5 2.5 0 0 1 1.353-1.353c.46-.19 1.042-.19 2.207-.19s1.747 0 2.207.19a2.5 2.5 0 0 1 1.353 1.353c.19.46.19 1.042.19 2.207s0 1.747-.19 2.207a2.5 2.5 0 0 1-1.353 1.353c-.46.19-1.042.19-2.207.19s-1.747 0-2.207-.19a2.5 2.5 0 0 1-1.353-1.353Zm0-10.5C3 8.497 3 7.915 3 6.75s0-1.747.19-2.207A2.5 2.5 0 0 1 4.543 3.19C5.003 3 5.585 3 6.75 3s1.747 0 2.207.19a2.5 2.5 0 0 1 1.353 1.353c.19.46.19 1.042.19 2.207s0 1.747-.19 2.207a2.5 2.5 0 0 1-1.353 1.353c-.46.19-1.042.19-2.207.19s-1.747 0-2.207-.19A2.5 2.5 0 0 1 3.19 8.957Z"
      />
    </Hugeicon>
  );
}

/** Hugeicons `left-to-right-list-bullet`, for a list layout. */
export function ListViewIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <>
        <path d="M8 5.5h12m-12 7h12m-12 7h12" />
        <path d="M4.375 5.5H4.25m.25 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0m-.125 7H4.25m.25 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0m-.125 7H4.25m.25 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0" />
      </>
    </Hugeicon>
  );
}

/** Hugeicons `unfold-more`: up and down chevrons, for a sortable column. */
export function UnfoldMoreIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <path d="M18 14s-4.419 5-6 5s-6-5-6-5m12-4s-4.419-5-6-5s-6 5-6 5" />
    </Hugeicon>
  );
}

/** Hugeicons `user`: a head and open shoulders. */
export function UserIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <>
        <path d="M20 21a7.53 7.53 0 0 0-7.005-6.934L12 14q-.531.015-1 .038c-3.7.181-6.716 3.268-7 6.962" />
        <circle cx="12" cy="7" r="4" />
      </>
    </Hugeicon>
  );
}

/** Hugeicons `calendar-03`: a calendar with a grid of dots. */
export function CalendarIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <>
        <path d="M16 2v4M8 2v4m5-2h-2C7.229 4 5.343 4 4.172 5.172S3 8.229 3 12v2c0 3.771 0 5.657 1.172 6.828S7.229 22 11 22h2c3.771 0 5.657 0 6.828-1.172S21 17.771 21 14v-2c0-3.771 0-5.657-1.172-6.828S16.771 4 13 4M3 10h18" />
        <path d="M12.126 14H12m.125 4H12m-4.376-4H7.5m.125 4H7.5m9.125-4H16.5m-4.25 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0m0 4a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0m-4.5-4a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0m0 4a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0m9-4a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0" />
      </>
    </Hugeicon>
  );
}

/** Hugeicons `clock-01`. */
export function Clock01Icon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l2 2" />
      </>
    </Hugeicon>
  );
}

/** Hugeicons `scan`: four corners and a line across, for an imaging order. */
export function ScanIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <path d="M16.004 2.5c1.993.113 3.254.434 4.158 1.338s1.225 2.165 1.338 4.158M7.996 2.5c-1.993.113-3.254.434-4.158 1.338S2.613 6.003 2.5 7.996m19 8.008c-.113 1.993-.434 3.254-1.338 4.158s-2.165 1.225-4.158 1.338M2.5 16.004c.113 1.993.434 3.254 1.338 4.158s2.165 1.225 4.158 1.338M5 12h14" />
    </Hugeicon>
  );
}

/** Hugeicons `stethoscope-02`. */
export function StethoscopeIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <>
        <path d="M6.5 3.5h-2a1 1 0 0 0-1 1V8a5.5 5.5 0 1 0 11 0V4.5a1 1 0 0 0-1-1h-2" />
        <path d="M18.5 15.5v1.25a4.75 4.75 0 1 1-9.5 0V13.5m2.5-11v2m-5-2v2" />
        <path d="M20.5 13.5a2 2 0 1 1-4 0a2 2 0 0 1 4 0Z" />
      </>
    </Hugeicon>
  );
}

/** Hugeicons `hospital-02`. */
export function HospitalIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <>
        <path d="M6 9v12h12V9c0-2.828 0-4.243-.879-5.121C16.243 3 14.828 3 12 3s-4.243 0-5.121.879C6 4.757 6 6.172 6 9m-4 4v4c0 1.886 0 2.828.586 3.414S4.114 21 6 21V9c-1.886 0-2.828 0-3.414.586S2 11.114 2 13m16-4v12c1.886 0 2.828 0 3.414-.586S22 18.886 22 17v-4c0-1.886 0-2.828-.586-3.414S19.886 9 18 9" />
        <path d="M10 18v3h4v-3a2 2 0 1 0-4 0m2-11v4m2.006-2.005h-4" />
      </>
    </Hugeicon>
  );
}

/** Hugeicons `mail-01`. */
export function MailIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <>
        <path d="m2 6l6.913 3.917c2.549 1.444 3.625 1.444 6.174 0L22 6" />
        <path d="M2.016 13.476c.065 3.065.098 4.598 1.229 5.733c1.131 1.136 2.705 1.175 5.854 1.254c1.94.05 3.862.05 5.802 0c3.149-.079 4.723-.118 5.854-1.254c1.131-1.135 1.164-2.668 1.23-5.733c.02-.986.02-1.966 0-2.952c-.066-3.065-.099-4.598-1.23-5.733c-1.131-1.136-2.705-1.175-5.854-1.254a115 115 0 0 0-5.802 0c-3.149.079-4.723.118-5.854 1.254c-1.131 1.135-1.164 2.668-1.23 5.733a69 69 0 0 0 0 2.952Z" />
      </>
    </Hugeicon>
  );
}

/** Hugeicons `note-01`. */
export function NoteIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <path d="M16.5 2v3m-9-3v3M12 2v3m1-1.5h-2c-3.3 0-4.95 0-5.975 1.025S4 7.2 4 10.5V15c0 3.3 0 4.95 1.025 5.975S7.7 22 11 22h2c3.3 0 4.95 0 5.975-1.025S20 18.3 20 15v-4.5c0-3.3 0-4.95-1.025-5.975S16.3 3.5 13 3.5M8 15h4m-4-4h8" />
    </Hugeicon>
  );
}

/** Hugeicons `view`: an eye. */
export function ViewIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <>
        <path d="M21.544 11.045c.304.426.456.64.456.955c0 .316-.152.529-.456.955C20.178 14.871 16.689 19 12 19c-4.69 0-8.178-4.13-9.544-6.045C2.152 12.529 2 12.315 2 12c0-.316.152-.529.456-.955C3.822 9.129 7.311 5 12 5c4.69 0 8.178 4.13 9.544 6.045Z" />
        <path d="M15 12a3 3 0 1 0-6 0a3 3 0 0 0 6 0Z" />
      </>
    </Hugeicon>
  );
}

/** Hugeicons `printer`. */
export function PrinterIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <>
        <path d="M17 17h1.667c1.246 0 1.869 0 2.333-.268a2 2 0 0 0 .732-.732c.268-.464.268-1.087.268-2.333c0-2.493 0-3.739-.536-4.667A4 4 0 0 0 20 7.536C19.072 7 17.826 7 15.333 7H8.667C6.174 7 4.928 7 4 7.536A4 4 0 0 0 2.536 9C2 9.928 2 11.174 2 13.667c0 1.246 0 1.869.268 2.333a2 2 0 0 0 .732.732C3.464 17 4.087 17 5.333 17H7M17 7V5c0-1.414 0-2.121-.44-2.56C16.122 2 15.415 2 14 2h-4c-1.414 0-2.121 0-2.56.44C7 2.878 7 3.585 7 5v2" />
        <path d="M17 14v5c0 1.414 0 2.121-.44 2.56c-.439.44-1.146.44-2.56.44h-4c-1.414 0-2.121 0-2.56-.44C7 21.122 7 20.415 7 19v-5zm1.875-3.75h-.125m.25 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0" />
      </>
    </Hugeicon>
  );
}

/** Hugeicons `upload-01`; the design uses it for downloads too. */
export function UploadIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <path d="M3 17c0 .93 0 1.395.102 1.776a3 3 0 0 0 2.121 2.122C5.605 21 6.07 21 7 21h10c.93 0 1.395 0 1.776-.102a3 3 0 0 0 2.122-2.122C21 18.396 21 17.93 21 17m-4.5-9.5S13.186 3 12 3S7.5 7.5 7.5 7.5M12 4v12" />
    </Hugeicon>
  );
}

/** Hugeicons `pencil-edit-01`. */
export function PencilEditIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <path d="m15.214 5.982l1.402-1.401a1.982 1.982 0 0 1 2.803 2.803l-1.401 1.402m-2.804-2.804L6.98 14.216c-1.045 1.046-1.568 1.568-1.924 2.205S4.342 18.561 4 20c1.438-.342 2.942-.7 3.579-1.056s1.16-.879 2.205-1.924l8.234-8.234m-2.804-2.804l2.804 2.804M11 20h6" />
    </Hugeicon>
  );
}

/** Hugeicons `cancel-01`: a cross. */
export function CancelIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <path d="M18 6L6 18m12 0L6 6" />
    </Hugeicon>
  );
}

/** Hugeicons `tick-02`: a check mark. */
export function TickIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <path d="m5 14l3.5 3.5L19 6.5" />
    </Hugeicon>
  );
}

/** Hugeicons `unarchive-03`: a box with an arrow out of it, for uploading again. */
export function UnarchiveIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <>
        <path d="M21 7H3v6c0 3.771 0 5.657 1.172 6.828S7.229 21 11 21h2c3.771 0 5.657 0 6.828-1.172S21 16.771 21 13zm0 0H3l1.2-1.6c.883-1.178 1.325-1.767 1.958-2.083C6.792 3 7.528 3 9 3h6c1.472 0 2.208 0 2.842.317c.633.316 1.075.905 1.958 2.083z" />
        <path d="M12 11v6.5m-3-4c.59-.607 2.16-3 3-3s2.41 2.393 3 3" />
      </>
    </Hugeicon>
  );
}

/** The "!" of Hugeicons `alert-circle`, to sit on a filled circle. */
export function AlertMarkIcon(props: IconProps) {
  return (
    <Hugeicon strokeWidth={2.5} {...props}>
      <path d="M12 7v6m.125 3.75H12m.25 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0" />
    </Hugeicon>
  );
}

/** Hugeicons `information-circle`. */
export function InformationCircleIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4m.125-3.75H12m.25 0a.25.25 0 1 0-.5 0a.25.25 0 0 0 .5 0" />
      </>
    </Hugeicon>
  );
}

/** Hugeicons `cancel-circle`: a cross in a circle. */
export function CancelCircleIcon(props: IconProps) {
  return (
    <Hugeicon {...props}>
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10s10-4.477 10-10m-7 3L9 9m0 6l6-6" />
    </Hugeicon>
  );
}
