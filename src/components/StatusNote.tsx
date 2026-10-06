export function StatusNote({
  tone,
  children,
}: {
  tone: "good" | "warn" | "bad" | "neutral";
  children: string;
}) {
  const styles = {
    good: "bg-good-bg text-good",
    warn: "bg-warn-bg text-warn",
    bad: "bg-bad-bg text-bad",
    neutral: "bg-white text-muted border border-line",
  }[tone];

  return <p className={`rounded-2xl px-4 py-3 text-[15px] leading-6 ${styles}`}>{children}</p>;
}
