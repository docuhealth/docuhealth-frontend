// Client-side match for queue rows: check-in lists have no backend search, so filter on patient name or HIN
export const matchesPatientSearch = (row, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const p = row?.patient_info || {};
  const name = [p.firstname, p.middlename, p.lastname].filter(Boolean).join(" ").toLowerCase();
  const reversed = [p.lastname, p.firstname].filter(Boolean).join(" ").toLowerCase();
  return name.includes(q) || reversed.includes(q) || (p.hin || "").includes(q);
};

// Whole tab in one request while searching, so a match on a later page isn't missed
export const SEARCH_PAGE_SIZE = 100;
