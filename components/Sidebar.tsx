"use client";

import { useState } from "react";
import type { Character } from "@/lib/types";
import { getTheme } from "@/lib/themes";
import { getIconComponent } from "@/lib/icons";
import { Button } from "./ui";

interface SidebarProps {
  characters: Character[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6h18" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export function Sidebar({
  characters,
  activeId,
  onSelect,
  onDelete,
  onNew,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Character | null>(null);

  function confirmDelete() {
    if (pendingDelete) onDelete(pendingDelete.id);
    setPendingDelete(null);
  }

  if (collapsed) {
    return (
      <aside className="flex h-full w-14 shrink-0 flex-col items-center gap-3 border-r border-border-dim bg-surface/60 py-3">
        <button
          type="button"
          title="Expand sidebar"
          onClick={() => setCollapsed(false)}
          className="flex h-9 w-9 items-center justify-center rounded-sm border border-border-dim text-muted transition hover:border-gold hover:text-gold"
        >
          <ChevronRight />
        </button>
        <button
          type="button"
          title="New Character"
          onClick={onNew}
          className="flex h-10 w-10 items-center justify-center rounded-sm border-2 border-gold bg-surface text-2xl leading-none text-gold transition hover:bg-gold/10 glow-gold"
        >
          +
        </button>
      </aside>
    );
  }

  return (
    <>
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border-dim bg-surface/60">
      <div className="relative border-b border-border-dim p-4">
        <button
          type="button"
          title="Collapse sidebar"
          onClick={() => setCollapsed(true)}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-sm border border-border-dim text-muted transition hover:border-gold hover:text-gold"
        >
          <ChevronLeft />
        </button>
        <h1 className="font-blackletter text-2xl text-gold leading-none">
          Oathforge
        </h1>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted mt-1">
          Character Card Forge
        </p>
        <Button className="mt-4 w-full" onClick={onNew}>
          + New Character
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <p className="px-1 pb-2 text-[11px] uppercase tracking-[0.18em] text-muted">
          Archive ({characters.length})
        </p>
        {characters.length === 0 ? (
          <p className="px-1 text-sm text-muted/70">
            No characters yet. Summon your first soul.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {characters.map((c) => {
              const theme = getTheme(c.themeKey);
              const ClassIcon = getIconComponent(c.classIconId);
              const active = c.id === activeId;
              return (
                <li key={c.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(c.id)}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") && onSelect(c.id)
                    }
                    className={`group flex cursor-pointer items-center gap-3 rounded-sm border p-2.5 transition ${
                      active
                        ? "border-gold bg-gold/10"
                        : "border-transparent hover:border-border-dim hover:bg-surface-elevated"
                    }`}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border"
                      style={{
                        background: theme.parchment,
                        borderColor: theme.frame,
                        color: theme.frameDark,
                      }}
                    >
                      <ClassIcon size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-headline text-sm text-parchment">
                        {c.name}
                      </span>
                      <span className="block truncate text-[11px] text-muted">
                        {c.title}
                      </span>
                    </span>
                    <button
                      type="button"
                      title="Delete character"
                      aria-label={`Delete ${c.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete(c);
                      }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-muted transition hover:bg-red/15 hover:text-red"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-border-dim p-3 text-[10px] leading-relaxed text-muted/60">
        Local AI · Animagine XL + Ollama. Icons: game-icons.net (CC BY 3.0).
      </div>
    </aside>

    {pendingDelete && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={() => setPendingDelete(null)}
      >
        <div
          className="w-full max-w-sm rounded-md border border-red/50 bg-surface p-6 shadow-[0_8px_32px_rgba(153,27,27,0.35)]"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="mb-1 font-blackletter text-2xl text-parchment">
            Delete Character?
          </h2>
          <p className="mb-5 text-sm text-muted">
            <span className="text-parchment">{pendingDelete.name}</span>
            {pendingDelete.title ? `, ${pendingDelete.title},` : ""} will be
            permanently removed along with its art. This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
