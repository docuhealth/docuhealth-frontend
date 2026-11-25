import { useAuthStore } from "@/stores/auth-store";

/**
 * The signed-in patient, from their login. TODO(api): no patient profile endpoint, so the name
 * and HIN are what the login sent (the HIN on the user, or on their own `acting_as` entry).
 */
export function usePatient() {
  const session = useAuthStore((state) => state.session);
  const name = session?.user.name ?? "";
  const self = session?.actingAs?.find((entry) => "as" in entry && entry.as === "self");
  const hin = session?.user.hin ?? (self && "hin" in self ? self.hin : null) ?? "";
  return { name, firstName: name.split(" ")[0] ?? name, hin: String(hin) };
}
