import { useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchProfile, signInWithUserId, signOut } from "../services/authService.ts";
import type { Profile } from "../types/domain.ts";
import { logError } from "../utils/errors.ts";
import { supabase } from "./supabase.ts";
import { AuthContext, type AuthContextValue } from "./auth-state.ts";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        const hasSession = Boolean(data.session);
        if (!active) return;
        if (hasSession) {
          try {
            const next = await fetchProfile();
            if (active) setProfile(next);
          } catch (error) {
            logError("restore-session", error);
            if (active) setProfile(null);
          }
        }
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      profile,
      login: async (userId, password) => {
        const next = await signInWithUserId(userId, password);
        setProfile(next);
      },
      logout: async () => {
        await signOut();
        setProfile(null);
      },
    }),
    [profile, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
