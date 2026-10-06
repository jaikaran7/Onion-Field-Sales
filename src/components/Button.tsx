import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ children, variant = "primary", className = "", type = "button", ...props }: Props) {
  const styles = {
    primary: "bg-action text-white",
    secondary: "bg-white text-ink border border-line",
    ghost: "bg-transparent text-action",
  }[variant];

  return (
    <button
      type={type}
      className={`flex min-h-14 w-full items-center justify-center rounded-2xl px-4 text-[17px] font-semibold disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
