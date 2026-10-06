import { createContext } from "react";
import type { Profile } from "../types/domain.ts";

export type AuthContextValue = {
  ready: boolean;
  profile: Profile | null;
  login: (userId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
