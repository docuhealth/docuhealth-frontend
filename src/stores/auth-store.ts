import { create } from "zustand";
import { persist } from "zustand/middleware";

const roles = ["admin", "member"] as const;
type Role = (typeof roles)[number];

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type Session = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

type AuthState = {
  session: Session | null;
  setSession: (session: Session) => void;
  setTokens: (tokens: Pick<Session, "accessToken" | "refreshToken">) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      setTokens: (tokens) =>
        set((state) => (state.session ? { session: { ...state.session, ...tokens } } : state)),
      clearSession: () => set({ session: null }),
    }),
    { name: "auth" },
  ),
);
