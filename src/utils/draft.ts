import type { ShopDraft } from "../types/domain.ts";

const TEXT_KEY = "onion-shop-draft-v1";
const DB_NAME = "onion-field";
const STORE = "files";
const PHOTO_KEY = "shop-photo";

const emptyDraft: ShopDraft = {
  shopName: "",
  ownerName: "",
  mobileNumber: "",
  address: "",
  shopTypeId: "",
  customerQualityId: "",
  shortDescription: "",
  latitude: null,
  longitude: null,
  accuracy: null,
};

export function emptyShopDraft(): ShopDraft {
  return { ...emptyDraft };
}

export function loadTextDraft(): ShopDraft {
  try {
    const raw = localStorage.getItem(TEXT_KEY);
    if (!raw) return emptyShopDraft();
    const parsed = JSON.parse(raw) as Partial<ShopDraft> & { shopType?: string };
    const shopTypeId = parsed.shopTypeId || (isUuid(parsed.shopType) ? parsed.shopType : "") || "";
    return { ...emptyShopDraft(), ...parsed, shopTypeId };
  } catch (error) {
    console.error("[draft]", error);
    return emptyShopDraft();
  }
}

function isUuid(value: string | undefined): value is string {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value));
}

export function saveTextDraft(draft: ShopDraft) {
  try {
    localStorage.setItem(TEXT_KEY, JSON.stringify(draft));
  } catch (error) {
    console.error("[draft]", error);
  }
}

export async function savePhotoDraft(blob: Blob | null) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    if (blob) store.put(blob, PHOTO_KEY);
    else store.delete(PHOTO_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadPhotoDraft() {
  const db = await openDb();
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).get(PHOTO_KEY);
    request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return blob;
}

export async function clearDraft() {
  localStorage.removeItem(TEXT_KEY);
  await savePhotoDraft(null).catch((error) => console.error("[draft]", error));
}

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
