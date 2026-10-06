import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { InfoCard } from "../../components/InfoCard.tsx";
import { ErrorBlock, LoadingBlock, Screen } from "../../components/Screen.tsx";
import { listCustomers } from "../../services/customerService.ts";
import { listSalesTeam } from "../../services/teamService.ts";
import type { SalespersonStat, ShopSummary } from "../../types/domain.ts";
import { formatDateTime } from "../../utils/dates.ts";

export function SalespersonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState<SalespersonStat | null>(null);
  const [shops, setShops] = useState<ShopSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    if (!id) return;
    setLoading(true);
    setError("");
    Promise.all([listSalesTeam(), listCustomers({ salesmanId: id, limit: 20 })])
      .then(([team, recent]) => {
        setPerson(team.find((item) => item.id === id) ?? null);
        setShops(recent);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load this salesperson."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timer = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(timer);
  }, [id]);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} onRetry={load} />;
  if (!person) return <ErrorBlock message="This salesperson could not be found." />;

  return (
    <Screen title={person.name} subtitle={person.isActive ? "Active" : "Inactive"} back>
      <p className="text-[14px] text-muted">ID: {person.userId}</p>
      {person.mobile ? <p className="mt-1 text-[15px]"><a className="font-medium text-action" href={`tel:+91${person.mobile}`}>{person.mobile}</a></p> : null}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Today's shops" value={person.todayShops} />
        <Stat label="This week" value={person.weekShops} />
        <Stat label="This month" value={person.monthShops} />
        <Stat label="Total shops" value={person.totalShops} />
      </div>
      <button type="button" className="mt-4 min-h-11 font-semibold text-action" onClick={() => navigate(`/team/${person.id}/edit`)}>
        Edit salesperson
      </button>
      <h2 className="mt-6 text-[18px] font-semibold">Recent shops</h2>
      <div className="mt-3 grid gap-3">
        {shops.length === 0 ? <p className="panel px-4 py-5 text-[15px] text-muted">No shops yet.</p> : null}
        {shops.map((shop) => (
          <InfoCard
            key={shop.id}
            title={shop.shopName}
            lines={[shop.shopType, shop.qualityName, formatDateTime(shop.createdAt)]}
            onClick={() => navigate(`/shops/${shop.id}`)}
          />
        ))}
      </div>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel px-4 py-3">
      <p className="text-[12px] text-muted">{label}</p>
      <p className="mt-1 text-[26px] leading-none font-semibold">{value}</p>
    </div>
  );
}
