import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.ts";
import { BUSINESS_NAME } from "../../lib/brand.ts";

const items = [
  {
    title: "Customer qualities",
    detail: "Manage the customer-quality options used by salespersons.",
    to: "/settings/qualities",
  },
  {
    title: "Shop types",
    detail: "Manage shop types used in the add shop form.",
    to: "/settings/shop-types",
  },
  {
    title: "Salespersons",
    detail: "Add and manage the sales team.",
    to: "/team",
  },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div>
      <h1 className="text-[28px] leading-8 font-semibold tracking-tight">{BUSINESS_NAME}</h1>
      <p className="mt-1 text-[15px] text-muted">Business settings</p>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <button key={item.to} type="button" className="panel px-4 py-4 text-left" onClick={() => navigate(item.to)}>
            <span className="block text-[17px] font-semibold">{item.title}</span>
            <span className="mt-1 block text-[14px] leading-5 text-muted">{item.detail}</span>
            <span className="mt-3 block text-[14px] font-semibold text-action">Open</span>
          </button>
        ))}
      </div>
      <button type="button" className="mt-8 min-h-11 text-[15px] font-semibold text-muted" onClick={() => void logout()}>
        Sign out
      </button>
    </div>
  );
}
