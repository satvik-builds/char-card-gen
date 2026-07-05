# Image Service (Animagine XL 4.0)

Local Python service that generates the hero art and pixel sprite for each card.

## Setup

```bash
cd image-service
python3.11 -m venv .venv          # 3.11 or 3.12 recommended
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

> Apple Silicon: if generated images come out black/noisy, your PyTorch is too
> new for MPS. Pin a known-good build: `pip install "torch==2.9.0"`.

## Run

```bash
source .venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000
```

The first request downloads Animagine XL 4.0 (~6.5 GB) and the pixel-art LoRA,
then loads them onto the GPU (MPS). Subsequent generations take ~20-40s each.

## Endpoints

- `GET /health` — `{ status, device, loaded }`
- `GET /progress/{job_id}` — `{ progress }` (0-100 denoising progress for an
  in-flight job; pass a `job_id` in the generate request to track it)
- `POST /hero` — `{ prompt, negative_prompt?, seed, gender?, job_id? }` -> `{ image (data URL), seed }`
- `POST /sprite` — same shape; returns a pixelated sprite.

## Configuration (env vars)

- `ANIMAGINE_MODEL` (default `cagliostrolab/animagine-xl-4.0`)
- `PIXEL_LORA_REPO` (default `nerijs/pixel-art-xl`)
- `PIXEL_LORA_FILE` (default `pixel-art-xl.safetensors`)
