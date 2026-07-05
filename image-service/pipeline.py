"""Animagine XL 4.0 image pipeline for the character card generator.

Runs locally via diffusers. On Apple Silicon it uses the MPS backend.
Hero art = full-body anime character (background removed with rembg).
Sprite  = retro pixel-art version using a pixel-art LoRA on the same base model.
"""

from __future__ import annotations

import os
import threading

# Allow ops without an MPS kernel to fall back to CPU instead of crashing.
os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")

# Fast model downloads: use the Rust-based hf_transfer and avoid the Xet path,
# which throttles badly for unauthenticated requests (set BEFORE hub imports).
os.environ.setdefault("HF_HUB_ENABLE_HF_TRANSFER", "1")
os.environ.setdefault("HF_HUB_DISABLE_XET", "1")

import torch  # noqa: E402
from diffusers import (  # noqa: E402
    StableDiffusionXLPipeline,
    EulerAncestralDiscreteScheduler,
)
from PIL import Image  # noqa: E402

MODEL_ID = os.environ.get("ANIMAGINE_MODEL", "cagliostrolab/animagine-xl-4.0")
PIXEL_LORA_REPO = os.environ.get("PIXEL_LORA_REPO", "nerijs/pixel-art-xl")
PIXEL_LORA_FILE = os.environ.get("PIXEL_LORA_FILE", "pixel-art-xl.safetensors")

# Recommended negative prompt from the Animagine XL 4.0 model card.
DEFAULT_NEGATIVE = (
    "lowres, bad anatomy, bad hands, text, error, missing finger, extra digits, "
    "fewer digits, cropped, worst quality, low quality, low score, bad score, "
    "average score, signature, watermark, username, blurry"
)


# ---------------------------------------------------------------------------
# Per-job progress registry
#
# Generation is a blocking request, so we publish step progress (0-100) into a
# small in-memory map keyed by a client-supplied job id. A separate lightweight
# `GET /progress/{job_id}` endpoint reads it, letting the UI poll for a live
# percentage. Dict access is guarded by a lock (the generation and the progress
# read run in different FastAPI threadpool threads).
# ---------------------------------------------------------------------------
_PROGRESS: dict[str, float] = {}
_PROGRESS_LOCK = threading.Lock()


def set_progress(job_id: str | None, pct: float) -> None:
    if not job_id:
        return
    with _PROGRESS_LOCK:
        _PROGRESS[job_id] = max(0.0, min(100.0, pct))


def get_progress(job_id: str) -> float:
    with _PROGRESS_LOCK:
        return _PROGRESS.get(job_id, 0.0)


def clear_progress(job_id: str | None) -> None:
    if not job_id:
        return
    with _PROGRESS_LOCK:
        _PROGRESS.pop(job_id, None)


def pick_device() -> str:
    if torch.backends.mps.is_available():
        return "mps"
    if torch.cuda.is_available():
        return "cuda"
    return "cpu"


# Tags we strip from incoming prompts so the gender we enforce is unambiguous.
_GENDER_TOKENS = {
    "1girl", "2girls", "3girls", "multiple girls", "1boy", "2boys",
    "multiple boys", "1other", "male", "female", "male focus", "female focus",
    "androgynous", "feminine", "masculine",
}


def resolve_gender(gender: str | None) -> str:
    """Map free-text gender to 'female' | 'male' | 'other' (check female first
    because 'male' is a substring of 'female')."""
    g = (gender or "").strip().lower()
    if not g:
        return "other"
    if g[0] == "f" or "female" in g or "woman" in g or "girl" in g:
        return "female"
    if g[0] == "m" or "male" in g or "man" in g or "boy" in g:
        return "male"
    return "other"


def enforce_gender(prompt: str, gender: str | None) -> tuple[str, str]:
    """Force the correct gender tag at the front of the prompt and return any
    extra negative-prompt terms to suppress the opposite gender.

    Anime SDXL models skew female, so for male characters we both reinforce
    'male' in the positive prompt and suppress feminine tags in the negative.
    """
    kind = resolve_gender(gender)
    tokens = [t.strip() for t in prompt.split(",")]
    tokens = [t for t in tokens if t and t.lower() not in _GENDER_TOKENS]

    if kind == "female":
        lead = ["1girl", "female"]
        neg_extra = "1boy, male, masculine, beard, facial hair, flat chest"
    elif kind == "male":
        lead = ["1boy", "male", "male focus", "masculine, toned"]
        neg_extra = "1girl, 2girls, female, feminine, breasts, makeup, lipstick"
    else:
        lead = ["1other"]
        neg_extra = ""

    new_prompt = ", ".join(lead + tokens)
    return new_prompt, neg_extra


class ImageEngine:
    """Lazily-loaded singleton wrapping the SDXL pipeline."""

    def __init__(self) -> None:
        self._pipe: StableDiffusionXLPipeline | None = None
        self._lock = threading.Lock()
        self._has_pixel_lora = False
        self.device = pick_device()

    @property
    def loaded(self) -> bool:
        return self._pipe is not None

    def load(self) -> None:
        if self._pipe is not None:
            return
        with self._lock:
            if self._pipe is not None:
                return
            dtype = torch.float16 if self.device in ("mps", "cuda") else torch.float32
            print(f"[image-service] loading {MODEL_ID} on {self.device} ({dtype})…")
            pipe = StableDiffusionXLPipeline.from_pretrained(
                MODEL_ID,
                torch_dtype=dtype,
                use_safetensors=True,
                custom_pipeline="lpw_stable_diffusion_xl",
                add_watermarker=False,
            )
            pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(
                pipe.scheduler.config
            )
            pipe.to(self.device)
            try:
                pipe.load_lora_weights(
                    PIXEL_LORA_REPO,
                    weight_name=PIXEL_LORA_FILE,
                    adapter_name="pixel",
                )
                pipe.set_adapters([])  # disabled until sprite generation
                self._has_pixel_lora = True
                print("[image-service] pixel-art LoRA loaded.")
            except Exception as exc:  # noqa: BLE001
                print(f"[image-service] pixel LoRA unavailable ({exc}); "
                      "sprites will use the base model.")
            self._pipe = pipe
            print("[image-service] pipeline ready.")

    def _generate(
        self,
        prompt: str,
        negative: str | None,
        width: int,
        height: int,
        steps: int,
        guidance: float,
        seed: int,
        use_pixel: bool,
        job_id: str | None = None,
    ) -> Image.Image:
        self.load()
        assert self._pipe is not None

        # Publish denoising progress per step. `step` is 0-based, so the final
        # step reports ~100%; we cap at 99 to leave headroom for post-processing
        # (e.g. background removal) that happens after the loop.
        def _on_step(_pipe, step: int, _timestep, cbk):
            set_progress(job_id, min(99.0, (step + 1) / max(1, steps) * 100.0))
            return cbk

        with self._lock:
            if self._has_pixel_lora:
                if use_pixel:
                    self._pipe.set_adapters(["pixel"], adapter_weights=[1.2])
                else:
                    self._pipe.set_adapters([])
            generator = torch.Generator(device="cpu").manual_seed(int(seed))
            result = self._pipe(
                prompt=prompt,
                negative_prompt=negative or DEFAULT_NEGATIVE,
                width=width,
                height=height,
                num_inference_steps=steps,
                guidance_scale=guidance,
                generator=generator,
                callback_on_step_end=_on_step,
            )
        return result.images[0]

    def hero(
        self,
        prompt: str,
        negative: str | None = None,
        seed: int = 0,
        gender: str | None = None,
        job_id: str | None = None,
    ) -> Image.Image:
        # 20 steps is a good speed/quality balance for SDXL on MPS.
        steps = int(os.environ.get("HERO_STEPS", "20"))
        prompt, neg_extra = enforce_gender(prompt, gender)
        negative = negative or DEFAULT_NEGATIVE
        if neg_extra:
            negative = f"{negative}, {neg_extra}"
        img = self._generate(
            prompt, negative, 832, 1216, steps, 5.0, seed, use_pixel=False,
            job_id=job_id,
        )
        return remove_background(img)

    def sprite(
        self,
        prompt: str,
        negative: str | None = None,
        seed: int = 0,
        job_id: str | None = None,
    ) -> Image.Image:
        # The sprite is heavily pixelated, so render small + few steps for speed.
        steps = int(os.environ.get("SPRITE_STEPS", "14"))
        img = self._generate(
            prompt, negative, 512, 512, steps, 7.0, seed, use_pixel=True,
            job_id=job_id,
        )
        return pixelate(remove_background(img))


def remove_background(img: Image.Image) -> Image.Image:
    """Cut the subject out onto transparency so it composites onto parchment."""
    try:
        from rembg import remove

        return remove(img.convert("RGBA"))
    except Exception as exc:  # noqa: BLE001
        print(f"[image-service] background removal skipped ({exc}).")
        return img.convert("RGBA")


def pixelate(img: Image.Image, blocks: int = 96, out: int = 512) -> Image.Image:
    """Downscale then nearest-neighbour upscale for a crunchy pixel look."""
    rgba = img.convert("RGBA")
    small = rgba.resize((blocks, blocks), Image.NEAREST)
    return small.resize((out, out), Image.NEAREST)


# Module-level singleton shared across requests.
engine = ImageEngine()
