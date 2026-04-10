import type { PropsWithChildren } from "react";

type BrandButtonProps = PropsWithChildren<{
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
  onClick?: () => void;
}>;

export function BrandButton({
  children,
  type = "button",
  disabled = false,
  variant = "primary",
  fullWidth = false,
  onClick
}: BrandButtonProps) {
  const styles = {
    primary: "bg-[var(--accent)] text-[var(--accent-foreground)] hover:brightness-95",
    secondary: "bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface)]",
    ghost: "bg-transparent text-[var(--text)] hover:bg-black/5"
  }[variant];

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-70 ${styles} ${fullWidth ? "w-full" : ""}`}
    >
      {children}
    </button>
  );
}
