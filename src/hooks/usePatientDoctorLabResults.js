import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstanceHos from "../lib/axios/hospital";
import { flattenDoctorLabResults } from "../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Scan_Lab_Results/scanLabResults";

const FETCH_SIZE = 200;

// test-orders/patient/<hin> only returns results still waiting on the lab admin, so read the
// doctor's own orders for this patient and keep the results the lab admin has approved
export const usePatientDoctorLabResults = (hin, page, pageSize) => {
  const query = useQuery({
    queryKey: ["patient-lab-records", hin],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(
        `api/lab/doctor-test-orders?page=1&size=${FETCH_SIZE}&ordering=-created_at&search=${encodeURIComponent(hin)}`
      );
      return res.data;
    },
    enabled: !!hin,
  });

  const rows = useMemo(
    () => flattenDoctorLabResults((query.data?.results || []).filter((o) => o.patient_info?.hin === hin)),
    [query.data, hin]
  );

  return {
    isLoading: query.isLoading,
    rows,
    results: rows.slice((page - 1) * pageSize, page * pageSize),
    count: rows.length,
  };
};
