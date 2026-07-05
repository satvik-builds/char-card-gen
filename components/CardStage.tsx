"use client";

import { useRef, useState, useMemo } from "react";
import type { Character } from "@/lib/types";
import CharacterCard from "./CharacterCard";
import { downloadCardPng } from "@/lib/exportCard";
import { Button } from "./ui";

interface CardStageProps {
  character: Character;
  imageLoading: boolean;
  /** Live 0-100 progress for the hero art / re-roll (null = indeterminate). */
  imageProgress: number | null;
  editing: boolean;
  /** Live 0-100 progress for an edit that regenerates art (null = indeterminate). */
  editProgress: number | null;
  statusNote: string | null;
  onRegenerateArt: () => void;
  /** Returns whether the edit succeeded, so the input can be cleared. */
  onEdit: (instruction: string) => Promise<boolean>;
}

/** Append a version token so the browser reloads regenerated art. */
function bustCache(character: Character): Character {
  const v = encodeURIComponent(character.updatedAt);
  return {
    ...character,
    heroImagePath: character.heroImagePath
      ? `${character.heroImagePath}?v=${v}`
      : null,
  };
}

export function CardStage({
  character,
  imageLoading,
  imageProgress,
  editing,
  editProgress,
  statusNote,
  onRegenerateArt,
  onEdit,
}: CardStageProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [instruction, setInstruction] = useState("");
  const [exporting, setExporting] = useState(false);

  const displayCharacter = useMemo(() => bustCache(character), [character]);

  async function handleExport() {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      await downloadCardPng(
        cardRef.current,
        `${character.name.replace(/\s+/g, "_")}_card`,
      );
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  }

  async function submitEdit() {
    const text = instruction.trim();
    if (!text || editing) return;
    const ok = await onEdit(text);
    // Keep the text on failure so the user can retry; clear it on success.
    if (ok) setInstruction("");
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          loading={imageLoading}
          progress={imageProgress}
          onClick={onRegenerateArt}
        >
          Re-roll Art
        </Button>
        <Button
          variant="secondary"
          size="sm"
          loading={exporting}
          onClick={handleExport}
        >
          Download PNG
        </Button>
      </div>

      {/* The card */}
      <div className="origin-top">
        <CharacterCard
          ref={cardRef}
          character={displayCharacter}
          imageLoading={imageLoading}
          imageProgress={imageProgress}
        />
      </div>

      {/* Edit prompt */}
      <div className="w-full max-w-[600px]">
        {statusNote && (
          <p className="mb-2 text-center text-xs italic text-muted">
            {statusNote}
          </p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitEdit();
            }}
            disabled={editing}
            rows={2}
            placeholder="Refine this character… e.g. 'give her a crimson cloak and raise her luck'"
            className="flex-1 resize-none rounded-sm bg-surface border border-border-dim focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25 text-parchment placeholder:text-muted/60 p-3 text-sm"
          />
          <Button loading={editing} progress={editProgress} onClick={submitEdit}>
            {editing ? "Applying" : "Apply"}
          </Button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted/60">
          Visual changes re-render the art (slower). ⌘/Ctrl + Enter to apply.
        </p>
      </div>
    </div>
  );
}
