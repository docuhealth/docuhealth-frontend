import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { ACTIVE_CHECK_INS_KEY, fetchActiveCheckIns } from "../queries/Hospital/doctor/checkIns";
import { DoctorAppContext } from "../context/HospitalContext/Doctors/DoctorAppContext";

// Orders, vitals requests, bed requests, refer-out and SOAP notes on a check-in are only accepted from the doctor
// running its consultation; every doctor's active list shows all active check-ins, so compare `claimed_by` to "me".
// Unknown (loading / failed / no claim info) counts as mine; the API refuses the action anyway.
export const useCheckInOwnership = (checkInSqid) => {
  const { profile } = useContext(DoctorAppContext) || {};
  const { data: activeCheckIns } = useQuery({
    queryKey: ACTIVE_CHECK_INS_KEY,
    queryFn: fetchActiveCheckIns,
    enabled: !!checkInSqid,
  });

  const loaded = !!checkInSqid && Array.isArray(activeCheckIns);
  const checkIn = loaded ? activeCheckIns.find((c) => c.sqid === checkInSqid) : null;
  const ownerId = checkIn?.claimed_by?.staff_id;
  const isOtherDoctors = !!(ownerId && profile?.staff_id && ownerId !== profile.staff_id);
  const owner = checkIn?.claimed_by;

  return {
    isConsultationClosed: loaded && !checkIn,
    isOtherDoctors,
    ownerName: owner ? `Dr. ${owner.firstname || ""} ${owner.lastname || ""}`.trim() : "",
  };
};
