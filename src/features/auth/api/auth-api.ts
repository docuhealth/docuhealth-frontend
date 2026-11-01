import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { request } from "@/lib/api";
import { roles, useAuthStore } from "@/stores/auth-store";

export const signInSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
export type SignInInput = z.infer<typeof signInSchema>;

const sessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
    role: z.enum(roles),
  }),
});

function signIn(input: SignInInput) {
  return request(sessionSchema, { method: "POST", url: "/auth/sign-in", data: input });
}

export function useSignIn() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: signIn,
    onSuccess: setSession,
  });
}
