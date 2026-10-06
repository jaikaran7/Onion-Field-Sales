import { supabase } from "../lib/supabase.ts";
import { logError } from "../utils/errors.ts";

export async function uploadShopPhoto(customerId: string, file: File) {
  const extension = file.type === "image/webp" ? "webp" : "jpg";
  const path = `shops/${customerId}/${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from("shop-photos").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    logError("photo-upload", error);
    throw new Error("Photo upload failed. Please try again.");
  }
  return path;
}

export async function removeShopPhoto(path: string) {
  const { error } = await supabase.storage.from("shop-photos").remove([path]);
  if (error) logError("photo-remove", error);
}

export async function shopPhotoUrl(path: string) {
  const { data, error } = await supabase.storage.from("shop-photos").createSignedUrl(path, 60 * 30);
  if (error || !data?.signedUrl) {
    logError("photo-url", error);
    throw new Error("Photo could not be loaded.");
  }
  return data.signedUrl;
}
