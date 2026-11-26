import { useQuery } from "@tanstack/react-query";
import { visitMetricsQuery } from "@/features/patient/api/queries";
import { useAuthStore } from "@/stores/auth-store";

/**
 * The signed-in patient. Login and `GET /api/auth/me` don't send a name, so the name (and HIN)
 * come from the patient's visit numbers (`GET /api/patients/visit-metrics`), falling back to the
 * session: the HIN on the user, or on their own `acting_as` entry. TODO(api): a name on `/me`.
 */
export function usePatient() {
  const session = useAuthStore((state) => state.session);
  const metrics = useQuery({ ...visitMetricsQuery(), enabled: !!session }).data;
  const self = session?.actingAs?.find((entry) => "as" in entry && entry.as === "self");
  const name = metrics?.name ?? session?.user.name ?? "";
  const hin = metrics?.hin ?? session?.user.hin ?? (self && "hin" in self ? self.hin : null) ?? "";
  return { name, firstName: name.split(" ")[0] ?? name, hin: String(hin) };
}
