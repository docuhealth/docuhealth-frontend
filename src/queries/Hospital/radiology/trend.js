import axiosInstanceHos from "../../../lib/axios/hospital";

// Real endpoint is fixed to current-year months, no period filter like pharmacy/lab have.

const MONTH_KEYS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const fetchRadiologyTrend = async () => {
  const res = await axiosInstanceHos.get("api/radiology/activity-chart-data");
  const data = res.data || {};
  const year = new Date().getFullYear();

  return MONTH_KEYS.map((key, i) => ({
    date: new Date(year, i, 1).toISOString(),
    count: data[key] || 0,
  }));
};
