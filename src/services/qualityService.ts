import { supabase } from "../lib/supabase.ts";
import type { CustomerQuality, ShopType } from "../types/domain.ts";
import { logError } from "../utils/errors.ts";

const shopTypeColumns = "id, type_name, description, display_order, is_active";

export async function listShopTypes() {
  const { data, error } = await supabase.from("shop_types").select(shopTypeColumns).eq("is_active", true).order("display_order");
  if (error) {
    logError("shop-types", error);
    throw new Error("Could not load shop types.");
  }
  return (data ?? []) as ShopType[];
}

export async function listAllShopTypes() {
  const { data, error } = await supabase.from("shop_types").select(shopTypeColumns).order("display_order");
  if (error) {
    logError("shop-types", error);
    throw new Error("Could not load shop types.");
  }
  return (data ?? []) as ShopType[];
}

export async function listActiveQualities() {
  const { data, error } = await supabase
    .from("customer_qualities")
    .select("id, quality_name, description, display_order, is_active")
    .eq("is_active", true)
    .order("display_order");
  if (error) {
    logError("qualities", error);
    throw new Error("Could not load customer qualities.");
  }
  return (data ?? []) as CustomerQuality[];
}

export async function listAllQualities() {
  const { data, error } = await supabase
    .from("customer_qualities")
    .select("id, quality_name, description, display_order, is_active")
    .order("display_order");
  if (error) {
    logError("qualities", error);
    throw new Error("Could not load customer qualities.");
  }
  return (data ?? []) as CustomerQuality[];
}

export async function getQuality(id: string) {
  const { data, error } = await supabase
    .from("customer_qualities")
    .select("id, quality_name, description, display_order, is_active")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    logError("quality", error);
    throw new Error("Could not load this quality.");
  }
  return (data as CustomerQuality | null) ?? null;
}

export async function saveQuality(input: {
  id?: string;
  qualityName: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
}) {
  const payload = {
    quality_name: input.qualityName.trim(),
    description: input.description.trim() || null,
    display_order: input.displayOrder,
    is_active: input.isActive,
  };
  const query = input.id
    ? supabase.from("customer_qualities").update(payload).eq("id", input.id)
    : supabase.from("customer_qualities").insert(payload);
  const { error } = await query;
  if (error) {
    logError("save-quality", error);
    if (error.code === "23505") throw new Error("That quality name already exists.");
    throw new Error("Could not save this quality. Please try again.");
  }
}

export async function setQualityActive(id: string, isActive: boolean) {
  const { error } = await supabase.from("customer_qualities").update({ is_active: isActive }).eq("id", id);
  if (error) {
    logError("quality-active", error);
    throw new Error("Could not update this quality. Please try again.");
  }
}

export async function deleteOrDeactivateQuality(id: string) {
  const { count, error: countError } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("customer_quality_id", id);
  if (countError) {
    logError("quality-usage", countError);
    throw new Error("Could not check this quality. Please try again.");
  }
  if ((count ?? 0) > 0) {
    await setQualityActive(id, false);
    return "deactivated" as const;
  }
  const { error } = await supabase.from("customer_qualities").delete().eq("id", id);
  if (error) {
    logError("quality-delete", error);
    await setQualityActive(id, false);
    return "deactivated" as const;
  }
  return "deleted" as const;
}

export async function getShopType(id: string) {
  const { data, error } = await supabase.from("shop_types").select(shopTypeColumns).eq("id", id).maybeSingle();
  if (error) {
    logError("shop-type", error);
    throw new Error("Could not load this shop type.");
  }
  return (data as ShopType | null) ?? null;
}

export async function saveShopType(input: {
  id?: string;
  typeName: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
}) {
  const payload = {
    type_name: input.typeName.trim(),
    description: input.description.trim() || null,
    display_order: input.displayOrder,
    is_active: input.isActive,
  };
  const query = input.id
    ? supabase.from("shop_types").update(payload).eq("id", input.id)
    : supabase.from("shop_types").insert(payload);
  const { error } = await query;
  if (error) {
    logError("save-shop-type", error);
    if (error.code === "23505") throw new Error("That shop type already exists.");
    throw new Error("Could not save this shop type. Please try again.");
  }
}

export async function setShopTypeActive(id: string, isActive: boolean) {
  const { error } = await supabase.from("shop_types").update({ is_active: isActive }).eq("id", id);
  if (error) {
    logError("shop-type-active", error);
    throw new Error("Could not update this shop type. Please try again.");
  }
}

export async function deleteOrDeactivateShopType(id: string) {
  const { count, error: countError } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("shop_type_id", id);
  if (countError) {
    logError("shop-type-usage", countError);
    throw new Error("Could not check this shop type. Please try again.");
  }
  if ((count ?? 0) > 0) {
    await setShopTypeActive(id, false);
    return "deactivated" as const;
  }
  const { error } = await supabase.from("shop_types").delete().eq("id", id);
  if (error) {
    logError("shop-type-delete", error);
    await setShopTypeActive(id, false);
    return "deactivated" as const;
  }
  return "deleted" as const;
}
