import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ErrorBlock, LoadingBlock, Screen } from "../components/Screen.tsx";
import { useAuth } from "../hooks/useAuth.ts";
import { getShop } from "../services/customerService.ts";
import { shopPhotoUrl } from "../services/storageService.ts";
import type { ShopDetail } from "../types/domain.ts";
import { formatDateTime } from "../utils/dates.ts";
import { telLink, whatsappLink } from "../utils/phone.ts";

export function ShopDetailPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [shop, setShop] = useState<ShopDetail | null>(null);
  const [photo, setPhoto] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    if (!id) return;
    setLoading(true);
    setError("");
    getShop(id)
      .then(async (next) => {
        setShop(next);
        if (next?.photoPath) {
          const url = await shopPhotoUrl(next.photoPath).catch(() => "");
          setPhoto(url);
        }
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load this shop."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} onRetry={load} />;
  if (!shop) return <ErrorBlock message="This shop could not be found." />;

  const address = shop.address || shop.shopNumber || "Not added";
  const ownerView = profile?.role === "owner";

  return (
    <Screen title={shop.shopName} back>
      {photo ? (
        <img src={photo} alt="" className="mb-4 aspect-[4/3] w-full rounded-2xl object-cover" />
      ) : (
        <p className="mb-4 rounded-2xl bg-white px-4 py-8 text-center text-muted">Photo is not available.</p>
      )}
      <Detail label="Owner name" value={shop.ownerName} />
      <Detail label="Mobile number" value={shop.mobileNumber} href={telLink(shop.mobileNumber)} />
      <Detail label="Shop number / address" value={address} />
      <Detail label="Shop type" value={shop.shopType} />
      <Detail label="Customer quality" value={shop.qualityName} />
      <Detail label="Short description" value={shop.shortDescription || "Not added"} />
      {ownerView ? <Detail label="Salesman" value={shop.salesmanName} /> : null}
      <Detail label="Date and time" value={formatDateTime(shop.createdAt)} />
      <Detail
        label="Location accuracy"
        value={shop.accuracy != null ? `${Math.round(shop.accuracy)} meters` : "Not available"}
      />
      <div className="mt-4 grid gap-2">
        {ownerView ? (
          <div className="grid grid-cols-2 gap-2">
            <a className="flex min-h-12 items-center justify-center rounded-2xl bg-action font-semibold text-white" href={telLink(shop.mobileNumber)}>
              Call
            </a>
            <a
              className="flex min-h-12 items-center justify-center rounded-2xl border border-line bg-white font-semibold text-ink"
              href={whatsappLink(shop.mobileNumber)}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          </div>
        ) : null}
        <a
          className="flex min-h-14 items-center justify-center rounded-2xl border border-line bg-white font-semibold text-action"
          href={shop.mapsUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open in Google Maps
        </a>
      </div>
    </Screen>
  );
}

function Detail({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="border-b border-line py-3">
      <p className="text-[13px] text-muted">{label}</p>
      {href ? (
        <a className="mt-1 block text-[16px] font-medium text-action" href={href}>
          {value}
        </a>
      ) : (
        <p className="mt-1 text-[16px]">{value}</p>
      )}
    </div>
  );
}
