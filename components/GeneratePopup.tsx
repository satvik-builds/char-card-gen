"use client";

import { useState } from "react";
import { Button } from "./ui";

interface GeneratePopupProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onGenerate: (prefs: string) => void;
}

const SUGGESTIONS = [
  "a grizzled dwarven necromancer",
  "a cheerful halfling bard",
  "a fallen paladin seeking redemption",
];

export function GeneratePopup({
  open,
  loading,
  onClose,
  onGenerate,
}: GeneratePopupProps) {
  const [prefs, setPrefs] = useState("");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={loading ? undefined : onClose}
    >
      <div
        className="w-full max-w-lg bg-surface border border-gold/40 rounded-md shadow-[0_8px_32px_rgba(202,138,4,0.3)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-blackletter text-3xl text-gold mb-1">
          Summon a Character
        </h2>
        <p className="text-muted text-sm mb-4">
          Optionally describe what you want. Leave blank for a fully random soul.
        </p>

        <textarea
          value={prefs}
          onChange={(e) => setPrefs(e.target.value)}
          disabled={loading}
          rows={4}
          placeholder="e.g. a stoic ice-mage princess exiled from a frozen empire…"
          className="w-full resize-none rounded-sm bg-bg border border-border-dim focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25 text-parchment placeholder:text-muted/60 p-3 text-sm"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={loading}
              onClick={() => setPrefs(s)}
              className="text-[11px] uppercase tracking-wide font-headline px-2.5 py-1 rounded-sm border border-border-dim text-muted hover:border-gold hover:text-gold transition disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={loading}
            onClick={() => onGenerate(prefs)}
          >
            {loading ? "Summoning" : "Generate"}
          </Button>
        </div>
      </div>
    </div>
  );
}
