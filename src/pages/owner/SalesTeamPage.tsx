import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button.tsx";
import { ErrorBlock, LoadingBlock, Screen } from "../../components/Screen.tsx";
import { listSalesTeam } from "../../services/teamService.ts";
import type { SalespersonStat } from "../../types/domain.ts";

export function SalesTeamPage() {
  const navigate = useNavigate();
  const [team, setTeam] = useState<SalespersonStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    listSalesTeam()
      .then(setTeam)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load salespersons."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timer = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Screen title="Sales team" back>
      <Button onClick={() => navigate("/team/new")}>+ Add salesperson</Button>
      <div className="mt-4">
        {loading ? <LoadingBlock /> : null}
        {error ? <ErrorBlock message={error} onRetry={load} /> : null}
        {!loading && !error && team.length === 0 ? (
          <p className="panel px-4 py-5 text-[15px] text-muted">No salespersons yet.</p>
        ) : null}
        <div className="grid gap-3">
          {team.map((person) => (
            <button key={person.id} type="button" className="panel p-4 text-left" onClick={() => navigate(`/team/${person.id}`)}>
              <span className="flex items-start justify-between gap-3">
                <span className="text-[18px] font-semibold">{person.name}</span>
                <span className={`text-[13px] font-semibold ${person.isActive ? "text-good" : "text-bad"}`}>
                  {person.isActive ? "Active" : "Inactive"}
                </span>
              </span>
              <span className="mt-1 block text-[14px] text-muted">ID: {person.userId}</span>
              <span className="mt-3 grid grid-cols-4 gap-2 text-center">
                <Metric label="Today" value={person.todayShops} />
                <Metric label="Week" value={person.weekShops} />
                <Metric label="Month" value={person.monthShops} />
                <Metric label="Total" value={person.totalShops} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <span className="block rounded-xl bg-surface px-1 py-2">
      <span className="block text-[12px] text-muted">{label}</span>
      <span className="mt-1 block text-[16px] font-semibold text-ink">{value}</span>
    </span>
  );
}
