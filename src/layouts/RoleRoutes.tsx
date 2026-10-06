import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.ts";
import { AppFrame } from "./AppFrame.tsx";

export function RequireAuth({ role }: { role: "owner" | "salesman" }) {
  const { ready, profile } = useAuth();
  if (!ready) return <Splash />;
  if (!profile) return <Navigate to="/login" replace />;
  if (profile.role !== role) {
    return <Navigate to={profile.role === "owner" ? "/dashboard" : "/home"} replace />;
  }
  return <Outlet />;
}

export function HomeRedirect() {
  const { ready, profile } = useAuth();
  if (!ready) return <Splash />;
  if (!profile) return <Navigate to="/login" replace />;
  return <Navigate to={profile.role === "owner" ? "/dashboard" : "/home"} replace />;
}

export function SalesmanFrame() {
  return (
    <AppFrame
      items={[
        { to: "/home", label: "Home", icon: "home" },
        { to: "/add", label: "Add Shop", icon: "add" },
        { to: "/visits", label: "Visits", icon: "list" },
      ]}
    >
      <Outlet />
    </AppFrame>
  );
}

export function OwnerFrame() {
  return (
    <AppFrame
      items={[
        { to: "/dashboard", label: "Dashboard", icon: "home" },
        { to: "/shops", label: "Shops", icon: "shops" },
        { to: "/settings", label: "Settings", icon: "settings" },
      ]}
    >
      <Outlet />
    </AppFrame>
  );
}

function Splash() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] items-center justify-center bg-surface px-6">
      <p className="text-lg font-semibold text-ink">Onion Field Sales</p>
    </div>
  );
}
