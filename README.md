# Oathforge — Character Card Generator

Generate ornate RPG character cards — faithful to the reference template — with
**locally-run AI**: lore and stats written by a local LLM (Ollama), full-body
hero art painted by **Animagine XL 4.0** (diffusers), faction/class theming, a
saved-character archive, and prompt-based editing.

Everything runs on your machine. No cloud APIs, no keys.

## What it does

- Click **New Character**, optionally describe preferences in a popup.
- A local LLM invents the character (name, title, age, race, class, faction,
  alignment, languages, 8 stats — 7 core stats plus a signature stat unique to
  the class — and a multi-paragraph biography) plus the image prompt.
- Animagine XL generates the full-body hero art, with its background removed so
  it composites cleanly onto the card's parchment.
- The card renders in the QuestUI-styled studio and can be **exported to PNG**.
- A prompt box under the card lets you **refine** the character ("give her a
  crimson cloak", "raise her luck", "rewrite the bio grimmer") — visual changes
  re-render the art automatically.
- While art generates or an edit re-renders, a **live percentage ring** (driven
  by the model's real denoising steps) shows in the hero area and on the
  **Re-roll Art** / **Apply** buttons — scoped to the card being worked on.
- Every character is saved to a local database and listed in the sidebar.

The card background color and the class/faction corner icons change with the
character — gold/noble, crimson/war, azure/arcane, verdant/nature, etc.

## Architecture

```
Next.js app (UI + SQLite via Prisma)
   ├── Ollama daemon          ── text generation (character JSON)
   └── Python image service   ── Animagine XL 4.0 (full-body hero art)
```

- Class icon (top-left) and faction icon (bottom-right) come from
  [game-icons.net](https://game-icons.net) (CC BY 3.0) via `react-icons/gi`.
- The image service also exposes a pixel-sprite endpoint (`/sprite`), but the
  app currently renders only the hero art.
- See [`reference/questui-DESIGN.md`](reference/questui-DESIGN.md) for the design
  system informing the app chrome.

## Prerequisites

- Node.js 18+ and npm
- [Ollama](https://ollama.com) for local text generation
- Python 3.11 or 3.12 for the image service (recommended over 3.13/3.14, which
  PyTorch wheels may not support yet)
- ~16 GB free disk for the models; an Apple Silicon (M-series) or NVIDIA GPU is
  strongly recommended

## Setup

### 1. App

```bash
npm install
npm run db:migrate     # creates the SQLite database (prisma/dev.db)
```

### 2. Ollama (text)

```bash
# Install from https://ollama.com, then:
ollama pull qwen3.5:9b      # default; great creative writing on a 24GB M4
# (fallback if you prefer: `ollama pull llama3.3:8b` and set OLLAMA_MODEL)
```

Ollama serves automatically on `http://localhost:11434`.

### 3. Image service (Animagine XL)

```bash
cd image-service
python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

The first generation downloads Animagine XL 4.0 (~6.5 GB) and the pixel-art LoRA.

> **Apple Silicon note:** if generated images come out black or noisy, your
> PyTorch build is too new for the MPS backend. Pin a known-good version:
> `pip install "torch==2.9.0"`. Avoid 2.10 / 2.11.

## Run

A single command starts everything — the Next.js app, the Ollama daemon, and the
Python image service — together via `concurrently`:

```bash
npm run dev
```

Then open <http://localhost:3000>.

It's resilient: if Ollama or the image service is already running, that part is
skipped rather than erroring. To run just the web app (no AI services), use
`npm run dev:web`. The services can also be started individually:

```bash
npm run dev:ollama   # `ollama serve` (skipped if :11434 is already up)
npm run dev:image    # uvicorn on :8000 (skipped if already up)
```

> Note: text generation and editing require the `OLLAMA_MODEL` (default
> `qwen3.5:9b`) to be pulled locally — run `ollama pull qwen3.5:9b` once.

> Tip: to preview the card layout and PNG export without running the AI
> services, load a sample character: `npm run seed:demo` (art slots show
> placeholders until you re-roll with the image service running).

## Configuration

Environment variables (see [`.env`](.env)):

| Variable            | Default                          | Purpose                       |
| ------------------- | -------------------------------- | ----------------------------- |
| `DATABASE_URL`      | `file:./dev.db`                  | SQLite database               |
| `OLLAMA_BASE_URL`   | `http://localhost:11434`         | Ollama daemon                 |
| `OLLAMA_MODEL`      | `qwen3.5:9b`                     | Text generation model         |
| `IMAGE_SERVICE_URL` | `http://localhost:8000`          | Python image service          |

Image-service model selection is configurable via `ANIMAGINE_MODEL`,
`PIXEL_LORA_REPO`, and `PIXEL_LORA_FILE` (see `image-service/README.md`).

## How accurate is it to the reference?

- **Card layout / style:** ~90-95% — banner, info block, 8 stat bars, biography,
  parchment + metallic frame, blackletter headings. Intentional differences:
  a simpler decorative border and class/faction icon corners (instead of the
  candelabra filigree and sun/spirit emblems).
- **Content:** structurally complete — every field, all 8 stats, multi-paragraph
  bio, all generated and themed.
- **Hero artwork:** high-quality, on-theme anime illustration; not a
  pixel-identical clone of the reference's painterly style, and pose/quality
  vary per seed (use **Re-roll Art**).

## Project layout

```
app/                     Next.js routes + API
  api/generate           POST: create character (text) + row
  api/characters         GET: list;  [id] GET/DELETE
  api/characters/[id]/images   POST: (re)generate art
  api/characters/[id]/edit     POST: prompt-based edit
  api/progress/[jobId]         GET: live art-generation progress (0-100)
components/               Studio, Sidebar, CharacterCard, CardStage,
                          GeneratePopup, InfoButton, CircularProgress, ui
lib/                      prisma, types/zod, ollama, imageClient, themes, icons,
                          constants, characterService, storage, exportCard, prompts
prisma/                   schema + migrations
image-service/            Python FastAPI + Animagine XL pipeline
public/generated/         saved hero art (gitignored)
```

## License notes

- Animagine XL 4.0: CreativeML Open RAIL++-M.
- Icons: game-icons.net, CC BY 3.0 — see `public/icons/ATTRIBUTION.md`.
