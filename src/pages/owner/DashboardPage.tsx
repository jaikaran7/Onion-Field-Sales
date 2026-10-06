import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InfoCard } from "../../components/InfoCard.tsx";
import { ErrorBlock, LoadingBlock } from "../../components/Screen.tsx";
import { useAuth } from "../../hooks/useAuth.ts";
import { BUSINESS_NAME } from "../../lib/brand.ts";
import { countCustomers, countCustomersSince, listCustomers } from "../../services/customerService.ts";
import { listSalesTeam } from "../../services/teamService.ts";
import { countVisitsSince } from "../../services/visitService.ts";
import type { SalespersonStat, ShopSummary } from "../../types/domain.ts";
import { formatTime, greetingWord, istDateString, startOfTodayIso } from "../../utils/dates.ts";

export function DashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [todayShops, setTodayShops] = useState(0);
  const [totalShops, setTotalShops] = useState(0);
  const [todayVisits, setTodayVisits] = useState(0);
  const [team, setTeam] = useState<SalespersonStat[]>([]);
  const [shops, setShops] = useState<ShopSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    Promise.all([
      countCustomersSince(startOfTodayIso()),
      countCustomers(),
      countVisitsSince(startOfTodayIso()),
      listSalesTeam(),
      listCustomers({ date: istDateString(), limit: 12 }),
    ])
      .then(([today, total, visits, people, list]) => {
        setTodayShops(today);
        setTotalShops(total);
        setTodayVisits(visits);
        setTeam(people);
        setShops(list);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load today's activity."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timer = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const peopleCount = team.length;

  return (
    <div>
      <p className="text-[14px] font-medium text-muted">{greetingWord()}</p>
      <h1 className="mt-1 text-[28px] leading-8 font-semibold tracking-tight">{profile?.name ?? "Prem Kumar"}</h1>
      <p className="mt-1 text-[15px] font-medium text-navy">{BUSINESS_NAME}</p>
      <p className="mt-0.5 text-[13px] text-muted">Business owner</p>

      {loading ? <LoadingBlock /> : null}
      {error ? <div className="mt-5"><ErrorBlock message={error} onRetry={load} /></div> : null}
      {!loading && !error ? (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Stat label="Today's shops" value={todayShops} />
            <Stat label="Total shops" value={totalShops} />
            <Stat label="Today's visits" value={todayVisits} />
            <button type="button" className="panel px-4 py-4 text-left" onClick={() => navigate("/team")}>
              <p className="text-[13px] text-muted">Salespersons</p>
              <p className="mt-2 text-[32px] leading-none font-semibold">{peopleCount}</p>
              <p className="mt-2 text-[13px] font-semibold text-action">View salespersons</p>
            </button>
          </div>

          <div className="mt-7 flex items-center justify-between">
            <h2 className="text-[18px] font-semibold">Sales team</h2>
            <button type="button" className="min-h-11 text-[14px] font-semibold text-action" onClick={() => navigate("/team")}>
              View all
            </button>
          </div>
          <div className="mt-2 grid gap-3">
            {team.length === 0 ? (
              <p className="panel px-4 py-5 text-[15px] text-muted">No salespersons yet.</p>
            ) : (
              team.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  className="panel flex min-h-16 items-center justify-between px-4 py-3 text-left"
                  onClick={() => navigate(`/team/${person.id}`)}
                >
                  <span>
                    <span className="block text-[16px] font-semibold">{person.name}</span>
                    <span className="mt-1 block text-[14px] text-muted">{person.todayShops} shops today</span>
                  </span>
                  <span className={`text-[13px] font-semibold ${person.isActive ? "text-good" : "text-bad"}`}>
                    {person.isActive ? "Active" : "Inactive"}
                  </span>
                </button>
              ))
            )}
          </div>

          <h2 className="mt-7 text-[18px] font-semibold">Today's shops</h2>
          <div className="mt-3 grid gap-3">
            {shops.length === 0 ? (
              <p className="panel px-4 py-5 text-[15px] text-muted">No shops recorded today.</p>
            ) : (
              shops.map((shop) => (
                <InfoCard
                  key={shop.id}
                  title={shop.shopName}
                  lines={[shop.ownerName, shop.shopType, shop.qualityName, formatTime(shop.createdAt)]}
                  meta="Location captured"
                  onClick={() => navigate(`/shops/${shop.id}`)}
                />
              ))
            )}
          </div>
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
