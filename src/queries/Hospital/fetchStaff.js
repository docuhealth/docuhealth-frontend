import axiosInstanceHos from "../../lib/axios/hospital";

export const fetchStaff = async ({ queryKey }) => {
  const [_key, page, search, role] = queryKey;
  const pageSize = 7;

  const params = new URLSearchParams({ page, size: pageSize });
  if (search) params.append("search", search);
  if (role) params.append("role", role);

  const res = await axiosInstanceHos.get(
    `api/hospitals/team-members?${params.toString()}`,
  );
  return res.data;
};
