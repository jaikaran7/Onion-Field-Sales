export function InfoCard({
  title,
  lines,
  meta,
  onClick,
}: {
  title: string;
  lines: string[];
  meta?: string;
  onClick?: () => void;
}) {
  const className = "panel block w-full p-4 text-left";
  const body = (
    <>
      <span className="block text-[17px] font-semibold text-ink">{title}</span>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} className="mt-1 block text-[15px] text-muted">
          {line}
        </span>
      ))}
      {meta ? <span className="mt-2 block text-[15px] font-medium text-good">{meta}</span> : null}
    </>
  );

  if (!onClick) return <article className={className}>{body}</article>;

  return (
    <button type="button" className={className} onClick={onClick}>
      {body}
    </button>
  );
}
