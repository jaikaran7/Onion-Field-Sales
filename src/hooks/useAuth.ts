import { useContext } from "react";
import { AuthContext } from "../lib/auth-state.ts";

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("Auth is unavailable.");
  return value;
}
