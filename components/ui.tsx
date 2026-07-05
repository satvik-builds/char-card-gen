"use client";

import type { ButtonHTMLAttributes } from "react";
import { CircularProgress } from "./CircularProgress";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gold text-bg border border-gold-bright hover:brightness-110 glow-gold",
  secondary:
    "bg-transparent text-gold border border-gold hover:bg-gold/10",
  ghost: "bg-transparent text-muted border border-transparent hover:bg-surface-elevated",
  destructive:
    "bg-red text-parchment border border-red hover:brightness-110",
};

const SIZES: Record<Size, string> = {
  sm: "text-[13px] px-3 h-8",
  md: "text-sm px-5 h-10",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /**
   * When set (alongside `loading`), renders a progress ring instead of the
   * spinner: a number 0-100 fills the ring, `null` shows an indeterminate spin.
   */
  progress?: number | null;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  progress,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const showRing = loading && progress !== undefined;
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-sm font-headline tracking-wide uppercase transition disabled:opacity-35 disabled:cursor-not-allowed disabled:shadow-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {showRing ? (
        <CircularProgress value={progress} size={15} strokeWidth={2} />
      ) : (
        loading && <Spinner />
      )}
      {children}
    </button>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin-slow ${className}`}
      aria-hidden
    />
  );
}
