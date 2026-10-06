import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button.tsx";
import { ErrorBlock, LoadingBlock, Screen } from "../../components/Screen.tsx";
import { deleteOrDeactivateQuality, listAllQualities, setQualityActive } from "../../services/qualityService.ts";
import type { CustomerQuality } from "../../types/domain.ts";

export function QualitiesPage() {
  const navigate = useNavigate();
  const [qualities, setQualities] = useState<CustomerQuality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingDelete, setPendingDelete] = useState("");

  function load() {
    setLoading(true);
    setError("");
    listAllQualities()
      .then(setQualities)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load customer qualities."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timer = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function toggle(quality: CustomerQuality) {
    setNotice("");
    try {
      await setQualityActive(quality.id, !quality.is_active);
      load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update this quality. Please try again.");
    }
  }

  async function remove(quality: CustomerQuality) {
    if (pendingDelete !== quality.id) {
      setPendingDelete(quality.id);
      return;
    }
    setNotice("");
    try {
      const result = await deleteOrDeactivateQuality(quality.id);
      setPendingDelete("");
      setNotice(result === "deleted" ? "Quality deleted." : "This quality is already used by shops, so it was turned off.");
      load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update this quality. Please try again.");
    }
  }

  return (
    <Screen title="Customer qualities" back>
      <Button onClick={() => navigate("/settings/qualities/new")}>+ Add quality</Button>
      {notice ? <p className="mt-3 text-[15px] text-good">{notice}</p> : null}
      <div className="mt-4">
        {loading ? <LoadingBlock /> : null}
        {error ? <ErrorBlock message={error} onRetry={load} /> : null}
        <div className="grid gap-3">
          {qualities.map((quality) => (
            <article key={quality.id} className="panel p-4">
              <p className="text-[17px] font-semibold">{quality.quality_name}</p>
              {quality.description ? <p className="mt-1 text-[14px] text-muted">{quality.description}</p> : null}
              <p className={`mt-2 text-[14px] font-medium ${quality.is_active ? "text-good" : "text-bad"}`}>
                {quality.is_active ? "Active" : "Inactive"}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button type="button" className="min-h-11 rounded-xl border border-line bg-white text-sm font-semibold" onClick={() => navigate(`/settings/qualities/${quality.id}`)}>
                  Edit
                </button>
                <button type="button" className="min-h-11 rounded-xl border border-line bg-white text-sm font-semibold" onClick={() => void toggle(quality)}>
                  {quality.is_active ? "Turn off" : "Turn on"}
                </button>
                <button type="button" className="min-h-11 rounded-xl border border-line bg-white text-sm font-semibold text-bad" onClick={() => void remove(quality)}>
                  {pendingDelete === quality.id ? "Confirm" : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Screen>
  );
}
