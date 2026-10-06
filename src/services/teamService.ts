import { supabase } from "../lib/supabase.ts";
import type { SalespersonStat } from "../types/domain.ts";
import { logError } from "../utils/errors.ts";

export async function listSalesTeam() {
  const { data, error } = await supabase.rpc("sales_team_stats");
  if (error) {
    logError("sales-team", error);
    throw new Error("Could not load salespersons.");
  }
  return ((data ?? []) as Record<string, unknown>[]).map(toStat);
}

export async function saveSalesperson(input: {
  id?: string;
  name: string;
  userId: string;
  password: string;
  mobile: string;
  isActive: boolean;
}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Please sign in again.");

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-salesperson`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      action: input.id ? "update" : "create",
      id: input.id,
      name: input.name,
      user_id: input.userId,
      password: input.password,
      mobile: input.mobile,
      is_active: input.isActive,
    }),
  });
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    logError("save-salesperson", body);
    throw new Error(body.error || "Could not save this salesperson. Please try again.");
  }
}

function toStat(row: Record<string, unknown>): SalespersonStat {
  return {
    id: String(row.id),
    userId: String(row.user_id ?? ""),
    name: String(row.name ?? ""),
    mobile: typeof row.mobile === "string" ? row.mobile : null,
    isActive: Boolean(row.is_active),
    todayShops: Number(row.today_shops ?? 0),
    weekShops: Number(row.week_shops ?? 0),
    monthShops: Number(row.month_shops ?? 0),
    totalShops: Number(row.total_shops ?? 0),
  };
}
