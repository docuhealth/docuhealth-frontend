import { useQuery } from "@tanstack/react-query";
import { visitMetricsQuery } from "@/features/patient/api/queries";
import { useAuthStore } from "@/stores/auth-store";

/**
 * The signed-in patient: the name from login or `GET /api/auth/me` (which falls back to the
 * email when the API has no name, in which case the visit numbers' name is used instead), and the
 * HIN from the visit numbers (`GET /api/patients/visit-metrics`), the user, or their own
 * `acting_as` entry.
 */
export function usePatient() {
  const session = useAuthStore((state) => state.session);
  const metrics = useQuery({ ...visitMetricsQuery(), enabled: !!session }).data;
  const self = session?.actingAs?.find((entry) => "as" in entry && entry.as === "self");
  const sessionName = session?.user.name ?? "";
  const hasRealName = !!sessionName && sessionName !== session?.user.email;
  const name = (hasRealName ? sessionName : metrics?.name) ?? sessionName;
  const hin = metrics?.hin ?? session?.user.hin ?? (self && "hin" in self ? self.hin : null) ?? "";
  return { name, firstName: name.split(" ")[0] ?? name, hin: String(hin) };
}
