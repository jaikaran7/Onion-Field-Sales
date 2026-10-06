import { supabase } from "../lib/supabase.ts";
import type { Profile, Role } from "../types/domain.ts";
import { logError } from "../utils/errors.ts";

type LoginResponse = {
  access_token?: string;
  refresh_token?: string;
  error?: string;
};

export async function signInWithUserId(userId: string, password: string) {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/field-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ user_id: userId.trim(), password }),
  });

  const body = (await response.json().catch(() => ({}))) as LoginResponse;
  if (!response.ok || !body.access_token || !body.refresh_token) {
    if (response.status === 401) {
      throw new Error("User ID or password is incorrect.");
    }
    logError("login", body);
    throw new Error("Could not sign in. Please try again.");
  }

  const { error } = await supabase.auth.setSession({
    access_token: body.access_token,
    refresh_token: body.refresh_token,
  });
  if (error) {
    logError("login-session", error);
    throw new Error("Could not sign in. Please try again.");
  }

  return fetchProfile();
}

export async function fetchProfile() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    logError("profile-user", userError);
    throw new Error("Could not sign in. Please try again.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, user_id, name, display_name, role, mobile, is_active")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (error || !data || data.is_active !== true || !isRole(data.role)) {
    logError("profile", error ?? data);
    await supabase.auth.signOut();
    throw new Error("Could not sign in. Please try again.");
  }

  const name = data.name || data.display_name;
  return { ...data, name, display_name: name } as Profile;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) logError("sign-out", error);
}

function isRole(value: string): value is Role {
  return value === "owner" || value === "salesman";
}
