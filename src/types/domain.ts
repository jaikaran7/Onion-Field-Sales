export type Role = "owner" | "salesman";

export type Profile = {
  id: string;
  user_id: string;
  name: string;
  display_name: string;
  role: Role;
  mobile: string | null;
  is_active: boolean;
};

export type CustomerQuality = {
  id: string;
  quality_name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
};

export type ShopType = {
  id: string;
  type_name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
};

export type SalespersonStat = {
  id: string;
  userId: string;
  name: string;
  mobile: string | null;
  isActive: boolean;
  todayShops: number;
  weekShops: number;
  monthShops: number;
  totalShops: number;
};

export type ShopSummary = {
  id: string;
  shopName: string;
  ownerName: string;
  mobileNumber: string;
  shopType: string;
  qualityName: string;
  address: string | null;
  createdAt: string;
  accuracy: number | null;
  mapsUrl: string;
};

export type ShopDetail = ShopSummary & {
  shopNumber: string | null;
  shortDescription: string | null;
  photoPath: string | null;
  salesmanName: string;
};

export type VisitCard = {
  id: string;
  customerId: string;
  shopName: string;
  shopType: string;
  qualityName: string;
  visitedAt: string;
  accuracy: number | null;
};

export type ShopDraft = {
  shopName: string;
  ownerName: string;
  mobileNumber: string;
  address: string;
  shopTypeId: string;
  customerQualityId: string;
  shortDescription: string;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
};

export type GeoFix = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

export type GeoFailure = "denied" | "unavailable" | "timeout" | "unsupported";
