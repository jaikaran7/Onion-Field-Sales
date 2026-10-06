import { supabase } from "../lib/supabase.ts";
import type { ShopDetail, ShopSummary } from "../types/domain.ts";
import { dayRangeIso } from "../utils/dates.ts";
import { logError } from "../utils/errors.ts";
import { removeShopPhoto, uploadShopPhoto } from "./storageService.ts";

const summarySelect =
  "id, shop_name, owner_name, mobile_number, address, created_at, gps_accuracy, maps_url, shop_types(type_name), customer_qualities(quality_name)";

export async function findShopByMobile(mobile: string) {
  const { data, error } = await supabase.rpc("lookup_mobile", { p_mobile: mobile });
  if (error) {
    logError("duplicate-check", error);
    throw new Error("Could not check this mobile number. Please try again.");
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return { id: (row.id as string | null) ?? null, shopName: String(row.shop_name ?? "an existing shop") };
}

export async function registerShop(input: {
  id: string;
  shopName: string;
  ownerName: string;
  mobileNumber: string;
  address: string;
  shopTypeId: string;
  customerQualityId: string;
  shortDescription: string;
  photo: File;
  latitude: number;
  longitude: number;
  accuracy: number;
  mapsUrl: string;
}) {
  const photoPath = await uploadShopPhoto(input.id, input.photo);
  const { error } = await supabase.rpc("register_shop", {
    p_id: input.id,
    p_shop_name: input.shopName,
    p_owner_name: input.ownerName,
    p_mobile_number: input.mobileNumber,
    p_shop_number: input.address,
    p_address: input.address,
    p_shop_type_id: input.shopTypeId,
    p_customer_quality_id: input.customerQualityId,
    p_short_description: input.shortDescription,
    p_photo_path: photoPath,
    p_latitude: input.latitude,
    p_longitude: input.longitude,
    p_gps_accuracy: input.accuracy,
    p_maps_url: input.mapsUrl,
  });
  if (error) {
    await removeShopPhoto(photoPath);
    throw error;
  }
}

export async function countCustomers(salesmanId?: string) {
  let query = supabase.from("customers").select("id", { count: "exact", head: true });
  if (salesmanId) query = query.eq("salesman_id", salesmanId);
  const { count, error } = await query;
  if (error) {
    logError("customer-count", error);
    throw new Error("Could not load shops.");
  }
  return count ?? 0;
}

export async function countCustomersSince(sinceIso: string, salesmanId?: string) {
  let query = supabase.from("customers").select("id", { count: "exact", head: true }).gte("created_at", sinceIso);
  if (salesmanId) query = query.eq("salesman_id", salesmanId);
  const { count, error } = await query;
  if (error) {
    logError("customer-count", error);
    throw new Error("Could not load today's activity.");
  }
  return count ?? 0;
}

export async function listCustomers(filters: {
  search?: string;
  qualityId?: string;
  shopTypeId?: string;
  date?: string;
  salesmanId?: string;
  limit?: number;
}) {
  let query = supabase.from("customers").select(summarySelect).order("created_at", { ascending: false }).limit(filters.limit ?? 100);
  if (filters.salesmanId) query = query.eq("salesman_id", filters.salesmanId);
  if (filters.qualityId) query = query.eq("customer_quality_id", filters.qualityId);
  if (filters.shopTypeId) query = query.eq("shop_type_id", filters.shopTypeId);
  if (filters.date) {
    const range = dayRangeIso(filters.date);
    query = query.gte("created_at", range.start).lt("created_at", range.end);
  }
  const search = filters.search?.trim().replace(/[%_,]/g, "") ?? "";
  if (search) {
    query = query.or(`shop_name.ilike.%${search}%,owner_name.ilike.%${search}%,mobile_number.ilike.%${search}%`);
  }
  const { data, error } = await query;
  if (error) {
    logError("customer-list", error);
    throw new Error("Could not load shops.");
  }
  return (data ?? []).map(toSummary);
}

export async function getShop(id: string) {
  const { data, error } = await supabase
    .from("customers")
    .select(
      "id, shop_name, owner_name, mobile_number, shop_number, address, short_description, photo_path, gps_accuracy, maps_url, created_at, shop_types(type_name), customer_qualities(quality_name), profiles(name)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    logError("shop-detail", error);
    throw new Error("Could not load this shop.");
  }
  if (!data) return null;
  const summary = toSummary(data);
  return {
    ...summary,
    shopNumber: (data.shop_number as string | null) ?? null,
    shortDescription: (data.short_description as string | null) ?? null,
    photoPath: (data.photo_path as string | null) ?? null,
    salesmanName: relationName(data.profiles, "name") || "Salesman",
  } satisfies ShopDetail;
}

function toSummary(row: Record<string, unknown>): ShopSummary {
  return {
    id: String(row.id),
    shopName: String(row.shop_name ?? ""),
    ownerName: String(row.owner_name ?? ""),
    mobileNumber: String(row.mobile_number ?? ""),
    shopType: relationName(row.shop_types, "type_name") || "Shop type",
    qualityName: relationName(row.customer_qualities, "quality_name") || "Customer quality",
    address: (row.address as string | null) ?? null,
    createdAt: String(row.created_at),
    accuracy: typeof row.gps_accuracy === "number" ? row.gps_accuracy : null,
    mapsUrl: String(row.maps_url ?? ""),
  };
}

function relationName(value: unknown, key: string) {
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== "object") return "";
  const named = (row as Record<string, unknown>)[key];
  return typeof named === "string" ? named : "";
}
