import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  const id = useId();
  const control = isSingleControl(children) ? cloneElement(children, { id }) : null;

  return (
    <div>
      {control ? (
        <label htmlFor={id} className="mb-2 block text-[15px] font-semibold text-ink">
          {label}
        </label>
      ) : (
        <span id={id} className="mb-2 block text-[15px] font-semibold text-ink">
          {label}
        </span>
      )}
      {control ?? <div role="group" aria-labelledby={id}>{children}</div>}
      {error ? <span className="mt-2 block text-sm text-bad">{error}</span> : null}
      {!error && hint ? <span className="mt-2 block text-sm text-muted">{hint}</span> : null}
    </div>
  );
}

function isSingleControl(children: ReactNode): children is ReactElement<{ id?: string }> {
  return isValidElement(children) && typeof children.type === "string" && ["input", "textarea", "select"].includes(children.type);
}
