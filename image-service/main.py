"""FastAPI wrapper around the Animagine XL image pipeline.

Endpoints:
  GET  /health              -> service + device status
  GET  /progress/{job_id}   -> live 0-100 denoising progress for a job
  POST /hero                -> full-body hero art (transparent PNG, base64)
  POST /sprite              -> retro pixel-art sprite (transparent PNG, base64)

The Next.js app calls this service over http://localhost:8000.
"""

from __future__ import annotations

import base64
import io

from fastapi import FastAPI, HTTPException
from PIL import Image
from pydantic import BaseModel, Field

from pipeline import clear_progress, engine, get_progress

app = FastAPI(title="Character Card Image Service")


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    negative_prompt: str | None = None
    seed: int = 0
    gender: str | None = None
    job_id: str | None = None


class GenerateResponse(BaseModel):
    image: str  # data URL (PNG, base64)
    seed: int


class ProgressResponse(BaseModel):
    progress: float  # 0-100


def to_data_url(img: Image.Image) -> str:
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/png;base64,{encoded}"


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "device": engine.device,
        "loaded": engine.loaded,
    }


@app.get("/progress/{job_id}", response_model=ProgressResponse)
def progress(job_id: str) -> ProgressResponse:
    return ProgressResponse(progress=get_progress(job_id))


@app.post("/hero", response_model=GenerateResponse)
def hero(req: GenerateRequest) -> GenerateResponse:
    try:
        img = engine.hero(
            req.prompt, req.negative_prompt, req.seed, req.gender, req.job_id
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        clear_progress(req.job_id)
    return GenerateResponse(image=to_data_url(img), seed=req.seed)


@app.post("/sprite", response_model=GenerateResponse)
def sprite(req: GenerateRequest) -> GenerateResponse:
    try:
        img = engine.sprite(
            req.prompt, req.negative_prompt, req.seed, req.job_id
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        clear_progress(req.job_id)
    return GenerateResponse(image=to_data_url(img), seed=req.seed)
