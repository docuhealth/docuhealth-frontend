import type { RadiologistProfile } from "@/features/radiologist/api/schemas";

type User = RadiologistProfile["user"];

/** Their full name, without the title: "Emeka Obi". */
export function displayName(user: User) {
  return `${user.firstName} ${user.lastName}`;
}

/** What the greeting calls them: "Dr. Emeka", or just "Emeka" without a title. */
export function greetingName(user: User) {
  return user.title ? `${user.title} ${user.firstName}` : user.firstName;
}
