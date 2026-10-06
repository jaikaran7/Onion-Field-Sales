import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button.tsx";
import { InfoCard } from "../../components/InfoCard.tsx";
import { ErrorBlock, LoadingBlock } from "../../components/Screen.tsx";
import { useAuth } from "../../hooks/useAuth.ts";
import { BUSINESS_NAME } from "../../lib/brand.ts";
import { countCustomersSince } from "../../services/customerService.ts";
import { countVisitsSince, listVisits } from "../../services/visitService.ts";
import type { VisitCard } from "../../types/domain.ts";
import { formatTime, greetingWord, startOfTodayIso } from "../../utils/dates.ts";

export function HomePage() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [visits, setVisits] = useState(0);
  const [shops, setShops] = useState(0);
  const [recent, setRecent] = useState<VisitCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    if (!profile) return;
    setLoading(true);
    setError("");
    const since = startOfTodayIso();
    Promise.all([
      countVisitsSince(since, profile.id),
      countCustomersSince(since, profile.id),
      listVisits(since, profile.id),
    ])
      .then(([visitCount, shopCount, cards]) => {
        setVisits(visitCount);
        setShops(shopCount);
        setRecent(cards.slice(0, 8));
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load today's activity."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timer = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(timer);
  }, [profile?.id]);

  return (
    <div>
      <p className="text-[14px] font-medium text-muted">{greetingWord()}</p>
      <h1 className="mt-1 text-[28px] leading-8 font-semibold tracking-tight">{profile?.name ?? "Salesman"}</h1>
      <p className="mt-1 text-[15px] font-medium text-navy">{BUSINESS_NAME}</p>

      {loading ? <LoadingBlock /> : null}
      {error ? <div className="mt-5"><ErrorBlock message={error} onRetry={load} /></div> : null}
      {!loading && !error ? (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Stat label="Today's visits" value={visits} />
            <Stat label="New shops" value={shops} />
          </div>
          <div className="mt-4">
            <Button onClick={() => navigate("/add")}>+ Add new shop</Button>
          </div>
          <h2 className="mt-7 text-[18px] font-semibold">Recent visits</h2>
          <div className="mt-3 grid gap-3">
            {recent.length === 0 ? (
              <p className="panel px-4 py-5 text-[15px] text-muted">No shops yet today. Add the first shop.</p>
            ) : (
              recent.map((visit) => (
                <InfoCard
                  key={visit.id}
                  title={visit.shopName}
                  lines={[visit.shopType, visit.qualityName, formatTime(visit.visitedAt)]}
                  meta={visit.accuracy && visit.accuracy > 0 && visit.accuracy <= 30 ? "Location captured" : "Location needs a retry"}
                  onClick={() => navigate(`/shop/${visit.customerId}`)}
                />
              ))
            )}
          </div>
          <button type="button" className="mt-8 min-h-11 text-[15px] font-semibold text-muted" onClick={() => void logout()}>
            Sign out
          </button>
        </>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel px-4 py-4">
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-2 text-[32px] leading-none font-semibold">{value}</p>
    </div>
  );
}
