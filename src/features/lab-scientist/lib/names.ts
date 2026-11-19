import type { LabProfile } from "@/features/lab-scientist/api/schemas";

type User = LabProfile["user"];

/** Their full name, without the title: "Emeka Obi". */
export function displayName(user: User) {
  return `${user.firstName} ${user.lastName}`;
}

/** What the greeting calls them: "Dr. Emeka", or just "Emeka" without a title. */
export function greetingName(user: User) {
  return user.title ? `${user.title} ${user.firstName}` : user.firstName;
}
