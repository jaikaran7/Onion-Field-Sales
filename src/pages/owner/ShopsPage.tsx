import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Field } from "../../components/Field.tsx";
import { InfoCard } from "../../components/InfoCard.tsx";
import { ErrorBlock, LoadingBlock, Screen } from "../../components/Screen.tsx";
import { listCustomers } from "../../services/customerService.ts";
import { listAllQualities, listAllShopTypes } from "../../services/qualityService.ts";
import type { CustomerQuality, ShopSummary, ShopType } from "../../types/domain.ts";
import { formatDateTime } from "../../utils/dates.ts";

export function ShopsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [qualityId, setQualityId] = useState("");
  const [shopType, setShopType] = useState("");
  const [date, setDate] = useState("");
  const [qualities, setQualities] = useState<CustomerQuality[]>([]);
  const [types, setTypes] = useState<ShopType[]>([]);
  const [shops, setShops] = useState<ShopSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    Promise.all([listAllQualities(), listAllShopTypes()])
      .then(([nextQualities, nextTypes]) => {
        setQualities(nextQualities);
        setTypes(nextTypes);
      })
      .catch((caught) => console.error("[filters]", caught));
  }, []);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      listCustomers({ search, qualityId, shopTypeId: shopType, date })
        .then((list) => {
          if (active) setShops(list);
        })
        .catch((caught) => {
          if (active) setError(caught instanceof Error ? caught.message : "Could not load shops.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search, qualityId, shopType, date, reloadKey]);

  const filtered = Boolean(search || qualityId || shopType || date);

  return (
    <Screen title="Shops">
      <div className="grid gap-3">
        <Field label="Search shop / owner / mobile">
          <input className="control" value={search} onChange={(event) => setSearch(event.target.value)} />
        </Field>
        <Field label="Customer quality">
          <select className="control select-control" value={qualityId} onChange={(event) => setQualityId(event.target.value)}>
            <option value="">All qualities</option>
            {qualities.map((quality) => (
              <option key={quality.id} value={quality.id}>
                {quality.quality_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Shop type">
          <select className="control select-control" value={shopType} onChange={(event) => setShopType(event.target.value)}>
            <option value="">All types</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.type_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input className="control" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </Field>
        {filtered ? (
          <button
            type="button"
            className="min-h-11 text-left font-semibold text-action"
            onClick={() => {
              setSearch("");
              setQualityId("");
              setShopType("");
              setDate("");
            }}
          >
            Clear filters
          </button>
        ) : null}
      </div>
      <div className="mt-4">
        {loading ? <LoadingBlock /> : null}
        {error ? <ErrorBlock message={error} onRetry={() => setReloadKey((current) => current + 1)} /> : null}
        {!loading && !error && shops.length === 0 ? (
          <p className="rounded-2xl border border-line bg-white px-4 py-5 text-[15px] text-muted">No shops match.</p>
        ) : null}
        <div className="grid gap-3">
          {shops.map((shop) => (
            <InfoCard
              key={shop.id}
              title={shop.shopName}
              lines={[shop.ownerName, shop.mobileNumber, shop.shopType, shop.qualityName, formatDateTime(shop.createdAt)]}
              onClick={() => navigate(`/shops/${shop.id}`)}
            />
          ))}
        </div>
      </div>
    </Screen>
  );
}
