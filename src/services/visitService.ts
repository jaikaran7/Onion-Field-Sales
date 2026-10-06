import { supabase } from "../lib/supabase.ts";
import type { VisitCard } from "../types/domain.ts";
import { logError } from "../utils/errors.ts";

export async function countVisitsSince(sinceIso: string, salesmanId?: string) {
  let query = supabase.from("visits").select("id", { count: "exact", head: true }).gte("visited_at", sinceIso);
  if (salesmanId) query = query.eq("salesman_id", salesmanId);
  const { count, error } = await query;
  if (error) {
    logError("visit-count", error);
    throw new Error("Could not load visits.");
  }
  return count ?? 0;
}

export async function listVisits(sinceIso: string, salesmanId?: string) {
  let query = supabase
    .from("visits")
    .select("id, customer_id, visited_at, gps_accuracy, customers(shop_name, shop_types(type_name), customer_qualities(quality_name))")
    .gte("visited_at", sinceIso)
    .order("visited_at", { ascending: false })
    .limit(50);
  if (salesmanId) query = query.eq("salesman_id", salesmanId);
  const { data, error } = await query;
  if (error) {
    logError("visit-list", error);
    throw new Error("Could not load visits.");
  }
  return (data ?? []).map(toCard);
}

function toCard(row: Record<string, unknown>): VisitCard {
  const customer = one(row.customers);
  return {
    id: String(row.id),
    customerId: String(row.customer_id),
    shopName: text(customer?.shop_name) || "Shop",
    shopType: text(one(customer?.shop_types)?.type_name),
    qualityName: qualityName(customer?.customer_qualities),
    visitedAt: String(row.visited_at),
    accuracy: typeof row.gps_accuracy === "number" ? row.gps_accuracy : null,
  };
}

function qualityName(value: unknown) {
  const row = one(value);
  return text(row?.quality_name) || "Customer quality";
}

function one(value: unknown): Record<string, unknown> | null {
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== "object") return null;
  return row as Record<string, unknown>;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}
