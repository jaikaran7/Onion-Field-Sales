import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export function Screen({
  title,
  subtitle,
  back,
  children,
  action,
}: {
  title?: string;
  subtitle?: string;
  back?: boolean;
  children: ReactNode;
  action?: ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <div className={action ? "pb-24" : ""}>
      {back ? (
        <button type="button" className="mb-3 min-h-11 text-[15px] font-semibold text-action" onClick={() => navigate(-1)}>
          Back
        </button>
      ) : null}
      {title ? <h1 className="text-[28px] leading-8 font-semibold tracking-tight text-ink">{title}</h1> : null}
      {subtitle ? <p className="mt-1 text-[16px] text-muted">{subtitle}</p> : null}
      <div className={title || subtitle ? "mt-5" : ""}>{children}</div>
      {action ? <div className="sticky-action">{action}</div> : null}
    </div>
  );
}

export function LoadingBlock({ label = "Loading..." }: { label?: string }) {
  return <p className="py-12 text-center text-muted">{label}</p>;
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <p className="text-[15px] leading-6 text-bad">{message}</p>
      {onRetry ? (
        <button type="button" className="mt-3 min-h-11 font-semibold text-action" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}
