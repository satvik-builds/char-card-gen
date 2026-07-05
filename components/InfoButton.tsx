"use client";

import { useEffect, useRef, useState } from "react";

export interface InfoSection {
  /** Optional bold label (e.g. "Motto", "Led by"). */
  label?: string;
  text: string;
}

interface InfoButtonProps {
  /** Heading shown in the popover (e.g. the faction or stat name). */
  title: string;
  /** Simple body text (used when `sections` is not provided). */
  text?: string;
  /** Structured, multi-part content (overrides `text`). */
  sections?: InfoSection[];
  /** Popover width in px. */
  width?: number;
  /** Pixel size of the "i" badge. */
  size?: number;
}

/**
 * A small "i" badge that toggles a themed info popover on click.
 * Colors come from the card theme CSS variables so it matches any palette.
 */
export function InfoButton({
  title,
  text,
  sections,
  width = 200,
  size = 13,
}: InfoButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <span
      ref={ref}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        lineHeight: 0,
      }}
    >
      <button
        type="button"
        aria-label={`About ${title}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        style={{
          width: size,
          height: size,
          borderRadius: "9999px",
          border: "1px solid var(--card-frame)",
          background: open ? "var(--card-frame)" : "transparent",
          color: open ? "var(--card-banner-fill)" : "var(--card-ink-soft)",
          fontSize: Math.round(size * 0.72),
          fontWeight: 700,
          fontStyle: "italic",
          fontFamily: "Georgia, serif",
          lineHeight: 1,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          boxSizing: "border-box",
        }}
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            top: "calc(100% + 5px)",
            right: 0,
            zIndex: 50,
            width,
            padding: "9px 11px",
            background: "var(--card-banner-fill)",
            border: "1px solid var(--card-frame)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.32)",
            color: "var(--card-ink)",
            fontSize: 11,
            lineHeight: 1.5,
            textAlign: "left",
            fontStyle: "normal",
            fontWeight: 400,
          }}
        >
          <strong
            style={{
              display: "block",
              marginBottom: 4,
              fontFamily: "var(--font-blackletter), serif",
              fontSize: 14,
              fontWeight: 400,
            }}
          >
            {title}
          </strong>
          {sections
            ? sections.map((s, i) => (
                <span
                  key={i}
                  style={{ display: "block", marginTop: i === 0 ? 0 : 4 }}
                >
                  {s.label && (
                    <span
                      style={{ fontWeight: 700, color: "var(--card-frame-dark)" }}
                    >
                      {s.label}:{" "}
                    </span>
                  )}
                  {s.text}
                </span>
              ))
            : text}
        </span>
      )}
    </span>
  );
}
