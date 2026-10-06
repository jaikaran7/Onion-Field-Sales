import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/Button.tsx";
import { Screen } from "../../components/Screen.tsx";

type SuccessState = {
  shopName?: string;
  qualityName?: string;
  locationCaptured?: boolean;
};

export function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? null) as SuccessState | null;
  if (!state?.shopName) return <Navigate to="/home" replace />;

  return (
    <Screen title="Shop added successfully">
      <p className="text-[16px] text-good">The shop is saved.</p>
      <div className="mt-4 rounded-2xl border border-line bg-white p-4">
        <p className="text-[20px] font-semibold">{state.shopName}</p>
        <p className="mt-2 text-[15px] text-muted">{state.qualityName}</p>
        {state.locationCaptured ? <p className="mt-2 text-[15px] font-medium text-good">Location captured</p> : null}
      </div>
      <div className="mt-5 grid gap-3">
        <Button onClick={() => navigate("/add", { replace: true })}>Add another shop</Button>
        <Button variant="secondary" onClick={() => navigate("/home", { replace: true })}>
          Go home
        </Button>
      </div>
    </Screen>
  );
}
