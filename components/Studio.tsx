"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Character } from "@/lib/types";
import { Sidebar } from "./Sidebar";
import { GeneratePopup } from "./GeneratePopup";
import { CardStage } from "./CardStage";

interface StudioProps {
  initialCharacters: Character[];
}

async function apiJson<T>(
  url: string,
  body?: unknown,
  method = "POST",
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export function Studio({ initialCharacters }: StudioProps) {
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [activeId, setActiveId] = useState<string | null>(
    initialCharacters[0]?.id ?? null,
  );
  const [popupOpen, setPopupOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  // Per-character busy state so progress never bleeds across cards.
  const [imageActiveId, setImageActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageProgress, setImageProgress] = useState<Record<string, number>>({});
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollTimers = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const activeCharacter =
    characters.find((c) => c.id === activeId) ?? null;

  const upsertCharacter = useCallback((character: Character) => {
    setCharacters((prev) => {
      const idx = prev.findIndex((c) => c.id === character.id);
      if (idx === -1) return [character, ...prev];
      const next = [...prev];
      next[idx] = character;
      return next;
    });
  }, []);

  const stopPolling = useCallback((id: string) => {
    const timer = pollTimers.current[id];
    if (timer) {
      clearInterval(timer);
      delete pollTimers.current[id];
    }
  }, []);

  // Poll the image service (via our proxy) for live 0-100 progress, keyed by id.
  const startPolling = useCallback(
    (jobId: string, id: string) => {
      stopPolling(id);
      pollTimers.current[id] = setInterval(async () => {
        try {
          const res = await fetch(`/api/progress/${jobId}`, {
            cache: "no-store",
          });
          if (!res.ok) return;
          const data = (await res.json()) as { progress?: number };
          const value = data.progress;
          if (typeof value === "number") {
            setImageProgress((prev) => ({ ...prev, [id]: value }));
          }
        } catch {
          // Ignore transient polling errors; the final result still resolves.
        }
      }, 400);
    },
    [stopPolling],
  );

  const clearProgress = useCallback((id: string) => {
    setImageProgress((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  useEffect(() => {
    const timers = pollTimers.current;
    return () => {
      Object.values(timers).forEach(clearInterval);
    };
  }, []);

  const generateArt = useCallback(
    async (id: string, newSeed = false) => {
      const jobId = crypto.randomUUID();
      setImageActiveId(id);
      setImageProgress((prev) => ({ ...prev, [id]: 0 }));
      setError(null);
      startPolling(jobId, id);
      try {
        const data = await apiJson<{ character: Character }>(
          `/api/characters/${id}/images`,
          { newSeed, jobId },
        );
        upsertCharacter(data.character);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        stopPolling(id);
        setImageActiveId((cur) => (cur === id ? null : cur));
        clearProgress(id);
      }
    },
    [upsertCharacter, startPolling, stopPolling, clearProgress],
  );

  async function handleGenerate(prefs: string) {
    setGenerating(true);
    setError(null);
    try {
      const data = await apiJson<{ character: Character }>("/api/generate", {
        prefs,
      });
      upsertCharacter(data.character);
      setActiveId(data.character.id);
      setStatusNote(null);
      setPopupOpen(false);
      void generateArt(data.character.id);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleEdit(instruction: string): Promise<boolean> {
    if (!activeCharacter) return false;
    const id = activeCharacter.id;
    const jobId = crypto.randomUUID();
    setEditingId(id);
    setStatusNote(null);
    setError(null);
    startPolling(jobId, id);
    try {
      const data = await apiJson<{
        character: Character;
        note: string | null;
        regeneratedImage: boolean;
      }>(`/api/characters/${id}/edit`, { instruction, jobId });
      upsertCharacter(data.character);
      setStatusNote(data.note);
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      stopPolling(id);
      setEditingId((cur) => (cur === id ? null : cur));
      clearProgress(id);
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiJson(`/api/characters/${id}`, undefined, "DELETE");
    } catch (err) {
      setError((err as Error).message);
      return;
    }
    stopPolling(id);
    clearProgress(id);
    setCharacters((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      const remaining = characters.filter((c) => c.id !== id);
      setActiveId(remaining[0]?.id ?? null);
    }
  }

  const activeProgressRaw = activeCharacter
    ? imageProgress[activeCharacter.id]
    : undefined;
  // A ring only shows a number once diffusion actually starts (>0); before
  // that it's indeterminate (null).
  const activeRing =
    activeProgressRaw && activeProgressRaw > 0 ? activeProgressRaw : null;
  const isRerolling = !!activeCharacter && imageActiveId === activeCharacter.id;
  const isEditingActive = !!activeCharacter && editingId === activeCharacter.id;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        characters={characters}
        activeId={activeId}
        onSelect={(id) => {
          setActiveId(id);
          setStatusNote(null);
        }}
        onDelete={handleDelete}
        onNew={() => setPopupOpen(true)}
      />

      <main className="relative flex-1 overflow-y-auto">
        <div className="min-h-full px-6 py-10">
          {activeCharacter ? (
            <CardStage
              character={activeCharacter}
              imageLoading={
                isRerolling || (isEditingActive && activeRing !== null)
              }
              imageProgress={activeRing}
              editing={isEditingActive}
              editProgress={activeRing}
              statusNote={statusNote}
              onRegenerateArt={() => generateArt(activeCharacter.id, true)}
              onEdit={handleEdit}
            />
          ) : (
            <EmptyState onNew={() => setPopupOpen(true)} />
          )}
        </div>
      </main>

      <GeneratePopup
        open={popupOpen}
        loading={generating}
        onClose={() => setPopupOpen(false)}
        onGenerate={handleGenerate}
      />

      {error && (
        <div className="fixed bottom-5 left-1/2 z-[60] max-w-md -translate-x-1/2 rounded-sm border border-red bg-surface px-4 py-3 text-sm text-parchment shadow-lg">
          <div className="flex items-start gap-3">
            <span className="text-red">⚠</span>
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-muted hover:text-parchment"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center text-center">
      <h2 className="font-blackletter text-5xl text-gold/80">Oathforge</h2>
      <p className="mt-3 max-w-md text-muted">
        Forge ornate RPG character cards with AI-written lore, generated art,
        and faction-themed styling.
      </p>
      <button
        onClick={onNew}
        className="mt-6 rounded-sm border border-gold-bright bg-gold px-6 py-3 font-headline uppercase tracking-wide text-bg glow-gold transition hover:brightness-110"
      >
        Summon a Character
      </button>
    </div>
  );
}
