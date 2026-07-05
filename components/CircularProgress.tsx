"use client";

interface CircularProgressProps {
  /** 0-100 for a determinate ring, or null/undefined for an indeterminate spin. */
  value?: number | null;
  /** Outer diameter in px. */
  size?: number;
  strokeWidth?: number;
  /** Show the rounded percentage in the center (determinate only). */
  showLabel?: boolean;
  className?: string;
  /** Progress arc color (defaults to the inherited text color). */
  color?: string;
  /** Track color behind the arc. */
  trackColor?: string;
}

/**
 * A circular progress ring. When `value` is a number it fills proportionally
 * (with an optional centered % label); when it's null/undefined it spins as an
 * indeterminate indicator. Theme-agnostic via the `color`/`trackColor` props.
 */
export function CircularProgress({
  value = null,
  size = 16,
  strokeWidth = 2,
  showLabel = false,
  className = "",
  color = "currentColor",
  trackColor = "rgba(127,127,127,0.25)",
}: CircularProgressProps) {
  const indeterminate = value === null || value === undefined;
  const pct = indeterminate ? 25 : Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={indeterminate ? "animate-spin-slow" : ""}
        style={{ transform: indeterminate ? undefined : "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: indeterminate ? undefined : "stroke-dashoffset 0.25s ease",
          }}
        />
      </svg>
      {showLabel && !indeterminate && (
        <span
          className="absolute font-headline tabular-nums leading-none"
          style={{ fontSize: Math.max(9, Math.round(size * 0.26)), color }}
        >
          {Math.round(pct)}%
        </span>
      )}
    </span>
  );
}
