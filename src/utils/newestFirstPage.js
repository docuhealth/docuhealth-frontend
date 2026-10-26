import axiosInstanceHos from "../lib/axios/hospital";

export const CHECK_IN_PAGE_SIZE = 10;

// Backend pages past the end 404, so report them as an empty page with an unknown count
const fetchBackendPage = async (basePath, status, page, size = CHECK_IN_PAGE_SIZE) => {
  try {
    return (await axiosInstanceHos.get(`${basePath}?status=${status}&page=${page}&size=${size}`)).data;
  } catch (error) {
    if (error.response?.status === 404) return { count: null, results: [] };
    throw error;
  }
};

// Check-in lists come back oldest first and the backend ignores `ordering`, so build each
// newest-first page from the backend's last rows: our page 1 = its newest 10 rows, reversed.
// Those rows span at most two backend pages. Returns null if the backend already sends newest first.
export const fetchNewestFirstPage = async (basePath, status, page, knownTotal) => {
  const probeTotal = async () => (await fetchBackendPage(basePath, status, 1, 1)).count ?? 0;
  let total = knownTotal ?? (await probeTotal());
  // The total can change between requests (a patient joins or leaves the list), so retry with the fresh one
  for (let attempt = 0; attempt < 3; attempt++) {
    if (!total) return { count: 0, results: [] };
    const hi = total - 1 - (page - 1) * CHECK_IN_PAGE_SIZE;
    if (hi < 0) return { count: total, results: [] };
    const lo = Math.max(0, total - page * CHECK_IN_PAGE_SIZE);
    const first = Math.floor(lo / CHECK_IN_PAGE_SIZE) + 1;
    const last = Math.floor(hi / CHECK_IN_PAGE_SIZE) + 1;
    const pages = await Promise.all(
      (first === last ? [first] : [first, last]).map((p) => fetchBackendPage(basePath, status, p))
    );
    if (pages.some((p) => p.count !== total)) {
      total = pages.find((p) => p.count != null)?.count ?? (await probeTotal());
      continue;
    }
    const rows = pages.flatMap((p) => p.results || []);
    if (rows.length > 1 && new Date(rows[0].created_at) > new Date(rows[rows.length - 1].created_at)) return null;
    const offset = (first - 1) * CHECK_IN_PAGE_SIZE;
    return { count: total, results: rows.slice(lo - offset, hi - offset + 1).reverse() };
  }
  return null;
};
