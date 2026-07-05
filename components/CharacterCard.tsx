"use client";

import { forwardRef } from "react";
import type { CSSProperties } from "react";
import type { Character } from "@/lib/types";
import {
  STAT_KEYS,
  STAT_LABELS,
  CARD_LABELS,
  factionLabel,
  factionLore,
  classUniqueStat,
} from "@/lib/constants";
import { getTheme, themeToCssVars } from "@/lib/themes";
import { getIconComponent } from "@/lib/icons";
import { InfoButton, type InfoSection } from "./InfoButton";
import { CircularProgress } from "./CircularProgress";

/** Fixed design width so PNG export is deterministic. */
export const CARD_WIDTH = 600;

interface CharacterCardProps {
  character: Character;
  /** Show a progress overlay over the hero art while it (re)generates. */
  imageLoading?: boolean;
  /** Live 0-100 generation progress; null shows an indeterminate ring. */
  imageProgress?: number | null;
}

const CharacterCard = forwardRef<HTMLDivElement, CharacterCardProps>(
  function CharacterCard(
    { character, imageLoading = false, imageProgress = null },
    ref,
  ) {
    const theme = getTheme(character.themeKey);
    const ClassIcon = getIconComponent(character.classIconId);
    const FactionIcon = getIconComponent(character.factionIconId);

    const rootStyle: CSSProperties = {
      ...themeToCssVars(theme),
      width: CARD_WIDTH,
      fontFamily: "var(--font-spectral), Georgia, serif",
      color: "var(--card-ink)",
      background:
        "radial-gradient(120% 90% at 50% 0%, var(--card-parchment) 55%, var(--card-parchment-edge) 100%)",
    };

    return (
      <div
        ref={ref}
        style={rootStyle}
        className="relative select-none"
      >
        {/* Outer metallic frame */}
        <div
          style={{
            padding: 12,
            background:
              "linear-gradient(145deg, var(--card-frame) 0%, var(--card-frame-dark) 50%, var(--card-frame) 100%)",
            boxShadow: "inset 0 0 14px rgba(0,0,0,0.35)",
          }}
        >
          {/* Inner parchment with engraved rule */}
          <div
            style={{
              position: "relative",
              padding: "26px 22px 30px",
              background:
                "radial-gradient(120% 90% at 50% 0%, var(--card-parchment) 55%, var(--card-parchment-edge) 100%)",
              border: "2px solid var(--card-frame-dark)",
              outline: "1px solid var(--card-frame)",
              outlineOffset: 3,
            }}
          >
            <CornerOrnaments
              classIcon={ClassIcon}
              factionIcon={FactionIcon}
            />

            <Banner name={character.name} title={character.title} />

            {/* Body: hero art on the left, info + stats on the right */}
            <div
              style={{
                display: "flex",
                gap: 18,
                marginTop: 18,
                alignItems: "stretch",
              }}
            >
              <div style={{ flex: "0 0 46%" }}>
                <HeroArt
                  src={character.heroImagePath}
                  loading={imageLoading}
                  progress={imageProgress}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <InfoBlock character={character} />
                <StatBlock
                  stats={character.stats}
                  charClass={character.charClass}
                />
              </div>
            </div>

            <Divider />

            <Biography paragraphs={character.bio} />
          </div>
        </div>
      </div>
    );
  },
);

export default CharacterCard;

/* ----------------------------- subcomponents ----------------------------- */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span
        style={{
          fontFamily: "var(--font-blackletter), serif",
          fontSize: 22,
          color: "var(--card-ink)",
          lineHeight: 1.1,
          textShadow: "0 1px 0 rgba(255,255,255,0.35)",
        }}
      >
        {children}
      </span>
      <span
        style={{
          flex: 1,
          height: 2,
          background:
            "linear-gradient(90deg, var(--card-frame) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}

function Banner({ name, title }: { name: string; title: string }) {
  return (
    <div style={{ textAlign: "center", position: "relative", paddingTop: 6 }}>
      <div
        style={{
          display: "inline-block",
          position: "relative",
          padding: "10px 46px 8px",
          background:
            "linear-gradient(180deg, var(--card-banner-fill) 0%, var(--card-parchment-edge) 100%)",
          border: "2px solid var(--card-banner-border)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
          clipPath:
            "polygon(0 14%, 6% 0, 94% 0, 100% 14%, 100% 86%, 94% 100%, 6% 100%, 0 86%)",
          minWidth: 280,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-blackletter), serif",
            fontSize: 46,
            lineHeight: 1,
            color: "var(--card-ink)",
            textShadow: "0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontStyle: "italic",
            fontSize: 17,
            color: "var(--card-ink-soft)",
            marginTop: 4,
            letterSpacing: 0.5,
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}

function HeroArt({
  src,
  loading,
  progress,
}: {
  src: string | null;
  loading: boolean;
  progress: number | null;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 360,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="character"
          crossOrigin="anonymous"
          style={{
            maxWidth: "100%",
            maxHeight: 460,
            objectFit: "contain",
            filter: "drop-shadow(2px 6px 8px rgba(0,0,0,0.3))",
          }}
        />
      ) : (
        <Placeholder loading={false} label="full-body art" />
      )}
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.18)",
            backdropFilter: "blur(1px)",
          }}
        >
          <CircularProgress
            value={progress}
            size={78}
            strokeWidth={6}
            showLabel
            color="var(--card-frame-dark)"
            trackColor="rgba(255,255,255,0.45)"
          />
        </div>
      )}
    </div>
  );
}

function InfoBlock({ character }: { character: Character }) {
  interface Row {
    label: string;
    value: string;
    info?: { title: string; sections: InfoSection[] };
  }

  const lore = factionLore(character.faction);
  const rows: Row[] = [
    { label: CARD_LABELS.age, value: String(character.age) },
    { label: CARD_LABELS.gender, value: character.gender },
    { label: CARD_LABELS.race, value: character.race },
    { label: CARD_LABELS.alignment, value: character.alignment },
    { label: CARD_LABELS.charClass, value: character.charClass },
    {
      label: CARD_LABELS.faction,
      value: factionLabel(character.faction),
      info: {
        title: factionLabel(character.faction),
        sections: [
          { text: lore.doctrine },
          { label: "Motto", text: `“${lore.motto}”` },
          { label: "Recruits", text: lore.recruits },
          { label: "Led by", text: lore.leader },
          { label: "Trivia", text: lore.trivia },
        ],
      },
    },
    { label: CARD_LABELS.languages, value: character.languages.join(", ") },
  ];

  return (
    <div>
      <SectionHeading>{CARD_LABELS.generalInfo}</SectionHeading>
      <div>
        {rows.map((row) => (
          <div
            key={row.label}
            style={{
              fontSize: 13,
              lineHeight: 1.5,
              color: "var(--card-ink)",
              marginBottom: 2,
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0 5px",
            }}
          >
            <span style={{ fontWeight: 700 }}>{row.label}:</span>
            <span style={{ color: "var(--card-ink-soft)" }}>{row.value}</span>
            {row.info && (
              <InfoButton
                title={row.info.title}
                sections={row.info.sections}
                width={244}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBlock({
  stats,
  charClass,
}: {
  stats: Character["stats"];
  charClass: string;
}) {
  const unique = classUniqueStat(charClass);
  const uniqueValue = Number.isFinite(stats.unique) ? stats.unique : 50;
  return (
    <div style={{ marginTop: 14 }}>
      <SectionHeading>{CARD_LABELS.stats}</SectionHeading>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {STAT_KEYS.map((key) => (
          <StatBar key={key} label={STAT_LABELS[key]} value={stats[key]} />
        ))}
        <StatBar
          label={unique.name}
          value={uniqueValue}
          info={{ title: unique.name, text: unique.description }}
        />
      </div>
    </div>
  );
}

function StatBar({
  label,
  value,
  info,
}: {
  label: string;
  value: number;
  info?: { title: string; text: string };
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          flex: "0 0 86px",
          fontSize: 11,
          color: "var(--card-ink-soft)",
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        <span>{label}</span>
        {info && <InfoButton title={info.title} text={info.text} size={11} />}
        <span>:</span>
      </div>
      <div
        style={{
          position: "relative",
          flex: 1,
          height: 12,
          background: "var(--card-accent-track)",
          border: "1px solid var(--card-frame-dark)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--card-accent) 80%, white) 0%, var(--card-accent) 100%)",
          }}
        />
        {/* segment notches */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0, transparent 13px, rgba(0,0,0,0.28) 13px, rgba(0,0,0,0.28) 14px)",
          }}
        />
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        margin: "18px 0 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: "var(--card-frame)",
      }}
    >
      <span style={{ flex: 1, height: 2, background: "currentColor", opacity: 0.5 }} />
      <span style={{ transform: "rotate(45deg)", width: 8, height: 8, background: "currentColor" }} />
      <span style={{ flex: 1, height: 2, background: "currentColor", opacity: 0.5 }} />
    </div>
  );
}

function Biography({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div>
      <SectionHeading>{CARD_LABELS.biography}</SectionHeading>
      <div style={{ columnCount: 1 }}>
        {paragraphs.map((p, i) => (
          <p
            key={i}
            style={{
              fontSize: 12.5,
              lineHeight: 1.6,
              color: "var(--card-ink)",
              margin: "0 0 8px",
              textAlign: "justify",
            }}
          >
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}

function Placeholder({
  loading,
  label,
  small = false,
}: {
  loading: boolean;
  label: string;
  small?: boolean;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: small ? 60 : 360,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px dashed var(--card-frame)",
        color: "var(--card-ink-soft)",
        fontSize: small ? 9 : 12,
        textAlign: "center",
        backgroundColor: loading ? "transparent" : "rgba(0,0,0,0.03)",
        backgroundImage: loading
          ? "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)"
          : undefined,
        backgroundSize: "200% 100%",
        animation: loading ? "shimmer 1.4s linear infinite" : undefined,
      }}
    >
      {loading ? "summoning…" : label}
    </div>
  );
}

/* Four corner ornaments: class icon (top-left), faction icon (bottom-right),
   decorative fleurons on the other two. */
function CornerOrnaments({
  classIcon: ClassIcon,
  factionIcon: FactionIcon,
}: {
  classIcon: ReturnType<typeof getIconComponent>;
  factionIcon: ReturnType<typeof getIconComponent>;
}) {
  return (
    <>
      <CornerFrame position="top-left">
        <ClassIcon size={30} color="var(--card-frame-dark)" />
      </CornerFrame>
      <CornerFrame position="bottom-right">
        <FactionIcon size={30} color="var(--card-frame-dark)" />
      </CornerFrame>
      <Fleuron position="top-right" />
      <Fleuron position="bottom-left" />
    </>
  );
}

function cornerStyle(position: string): CSSProperties {
  const base: CSSProperties = { position: "absolute" };
  const offset = -6;
  if (position === "top-left") return { ...base, top: offset, left: offset };
  if (position === "top-right") return { ...base, top: offset, right: offset };
  if (position === "bottom-left")
    return { ...base, bottom: offset, left: offset };
  return { ...base, bottom: offset, right: offset };
}

function CornerFrame({
  position,
  children,
}: {
  position: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        ...cornerStyle(position),
        width: 46,
        height: 46,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(145deg, var(--card-banner-fill), var(--card-parchment-edge))",
        border: "2px solid var(--card-frame)",
        boxShadow: "inset 0 0 6px rgba(0,0,0,0.25)",
        transform: "rotate(45deg)",
      }}
    >
      <div style={{ transform: "rotate(-45deg)", display: "flex" }}>
        {children}
      </div>
    </div>
  );
}

function Fleuron({ position }: { position: string }) {
  return (
    <div
      style={{
        ...cornerStyle(position),
        width: 34,
        height: 34,
        transform: "rotate(45deg)",
        border: "2px solid var(--card-frame)",
        background: "var(--card-parchment-edge)",
        boxShadow: "inset 0 0 5px rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 7,
          border: "1px solid var(--card-frame-dark)",
        }}
      />
    </div>
  );
}
