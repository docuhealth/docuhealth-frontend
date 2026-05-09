import axiosInstanceHos from "../../utils/axiosInstanceHos";

export const fetchStaff = async ({ queryKey }) => {
  const [_key, page, search] = queryKey;
  const pageSize = 7;

  const params = new URLSearchParams({ page, size: pageSize });
  if (search) params.append("search", search);

  const res = await axiosInstanceHos.get(
    `api/hospitals/team-members?${params.toString()}`,
  );
  return res.data;
};
