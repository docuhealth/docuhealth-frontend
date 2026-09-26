export const RESULT_TABS = [
  { key: "scan", label: "Scan results" },
  { key: "lab", label: "Lab results" },
];

export const maskHIN = (hin) => {
  if (!hin) return "—";
  return hin.length >= 6 ? `${hin.slice(0, 4)}••••${hin.slice(-2)}` : hin;
};
