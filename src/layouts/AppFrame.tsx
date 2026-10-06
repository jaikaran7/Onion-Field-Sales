import type { ReactNode } from "react";
import { BottomNav } from "../components/BottomNav.tsx";
import { useOnline } from "../hooks/useOnline.ts";

export function AppFrame({
  items,
  children,
}: {
  items: { to: string; label: string; icon: "home" | "add" | "list" | "shops" | "settings" }[];
  children: ReactNode;
}) {
  const online = useOnline();

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-surface text-ink">
      {!online ? (
        <p className="bg-warn-bg px-4 py-3 text-sm leading-5 text-warn">
          No network. You can keep filling the form. Saving needs a connection.
        </p>
      ) : null}
      <main className="px-4 pt-5 pb-[calc(5.6rem+env(safe-area-inset-bottom))]">{children}</main>
      <BottomNav items={items} />
    </div>
  );
}
