import { NavLink } from "react-router-dom";

export function BottomNav({
  items,
}: {
  items: { to: string; label: string; icon: "home" | "add" | "list" | "shops" | "settings" }[];
}) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[430px] -translate-x-1/2 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-[12px] font-semibold ${
              isActive ? "text-action" : "text-muted"
            }`
          }
        >
          <NavIcon name={item.icon} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function NavIcon({ name }: { name: "home" | "add" | "list" | "shops" | "settings" }) {
  const common = "h-6 w-6";
  if (name === "home") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    );
  }
  if (name === "add") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8.5v7M8.5 12h7" />
      </svg>
    );
  }
  if (name === "shops") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 10h16l-1 9H5L4 10Z" />
        <path d="M3 10 6 5h12l3 5" />
      </svg>
    );
  }
  if (name === "settings") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 7h10M7 12h10M7 17h10" />
    </svg>
  );
}
