import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InfoCard } from "../../components/InfoCard.tsx";
import { ErrorBlock, LoadingBlock, Screen } from "../../components/Screen.tsx";
import { useAuth } from "../../hooks/useAuth.ts";
import { listVisits } from "../../services/visitService.ts";
import type { VisitCard } from "../../types/domain.ts";
import { formatTime, startOfTodayIso } from "../../utils/dates.ts";

export function VisitsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [visits, setVisits] = useState<VisitCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    if (!profile) return;
    setLoading(true);
    setError("");
    listVisits(startOfTodayIso(), profile.id)
      .then(setVisits)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load visits."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  return (
    <Screen title="Today's visits">
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBlock message={error} onRetry={load} /> : null}
      {!loading && !error && visits.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white px-4 py-5 text-[15px] text-muted">No visits yet today.</p>
      ) : null}
      <div className="grid gap-3">
        {visits.map((visit) => (
          <InfoCard
            key={visit.id}
            title={visit.shopName}
            lines={[formatTime(visit.visitedAt), visit.qualityName]}
            meta="Location captured"
            onClick={() => navigate(`/shop/${visit.customerId}`)}
          />
        ))}
      </div>
    </Screen>
  );
}
