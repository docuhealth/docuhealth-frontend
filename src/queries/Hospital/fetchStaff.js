import axiosInstanceHos from "../../lib/axios/hospital";

export const fetchStaff = async ({ queryKey }) => {
  const [_key, page, search, role] = queryKey;
  const pageSize = 7;

  const params = new URLSearchParams({ page, size: pageSize });
  if (search) params.append("search", search);
  if (role) params.append("role", role);

  const res = await axiosInstanceHos.get(
    `api/hospitals/staff?${params.toString()}`,
  );
  return res.data;
};

// Every active staff member of one role at the caller's hospital, for pickers. Replaces the removed
// receptionists/staff/<role> (a plain list); this one is paginated and 100 is the max page size.
// Pickers must send each row's `sqid`; `staff_id` is a display label only.
export const fetchStaffByRole = async (role) => {
  const res = await axiosInstanceHos.get(`api/hospitals/staff?role=${role}&size=100`);
  // Deactivated staff are still returned, so drop them here
  return (res.data?.results || []).filter((staff) => staff.is_active !== false);
};
