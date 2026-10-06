import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button.tsx";
import { ErrorBlock, LoadingBlock, Screen } from "../../components/Screen.tsx";
import { deleteOrDeactivateShopType, listAllShopTypes, setShopTypeActive } from "../../services/qualityService.ts";
import type { ShopType } from "../../types/domain.ts";

export function ShopTypesPage() {
  const navigate = useNavigate();
  const [types, setTypes] = useState<ShopType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingDelete, setPendingDelete] = useState("");

  function load() {
    setLoading(true);
    setError("");
    listAllShopTypes()
      .then(setTypes)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load shop types."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timer = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function toggle(type: ShopType) {
    setNotice("");
    try {
      await setShopTypeActive(type.id, !type.is_active);
      load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update this shop type. Please try again.");
    }
  }

  async function remove(type: ShopType) {
    if (pendingDelete !== type.id) {
      setPendingDelete(type.id);
      return;
    }
    setNotice("");
    try {
      const result = await deleteOrDeactivateShopType(type.id);
      setPendingDelete("");
      setNotice(result === "deleted" ? "Shop type deleted." : "This shop type is already used by shops, so it was turned off.");
      load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update this shop type. Please try again.");
    }
  }

  return (
    <Screen title="Shop types" back>
      <Button onClick={() => navigate("/settings/shop-types/new")}>+ Add shop type</Button>
      {notice ? <p className="mt-3 text-[15px] text-good">{notice}</p> : null}
      <div className="mt-4">
        {loading ? <LoadingBlock /> : null}
        {error ? <ErrorBlock message={error} onRetry={load} /> : null}
        <div className="grid gap-3">
          {types.map((type) => (
            <article key={type.id} className="panel p-4">
              <p className="text-[17px] font-semibold">{type.type_name}</p>
              {type.description ? <p className="mt-1 text-[14px] text-muted">{type.description}</p> : null}
              <p className={`mt-2 text-[14px] font-medium ${type.is_active ? "text-good" : "text-bad"}`}>
                {type.is_active ? "Active" : "Inactive"}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button type="button" className="min-h-11 rounded-xl border border-line bg-white text-sm font-semibold" onClick={() => navigate(`/settings/shop-types/${type.id}`)}>
                  Edit
                </button>
                <button type="button" className="min-h-11 rounded-xl border border-line bg-white text-sm font-semibold" onClick={() => void toggle(type)}>
                  {type.is_active ? "Turn off" : "Turn on"}
                </button>
                <button type="button" className="min-h-11 rounded-xl border border-line bg-white text-sm font-semibold text-bad" onClick={() => void remove(type)}>
                  {pendingDelete === type.id ? "Confirm" : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Screen>
  );
}
