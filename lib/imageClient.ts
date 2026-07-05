const IMAGE_SERVICE_URL =
  process.env.IMAGE_SERVICE_URL ?? "http://localhost:8000";

export class ImageServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageServiceError";
  }
}

interface GenerateResult {
  /** PNG data URL returned by the service. */
  image: string;
  seed: number;
}

async function callService(
  endpoint: "hero",
  prompt: string,
  seed: number,
  gender?: string,
  jobId?: string,
): Promise<GenerateResult> {
  let res: Response;
  try {
    res = await fetch(`${IMAGE_SERVICE_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, seed, gender, job_id: jobId }),
    });
  } catch (err) {
    throw new ImageServiceError(
      `Could not reach the image service at ${IMAGE_SERVICE_URL}. Is it running? (${
        (err as Error).message
      })`,
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ImageServiceError(
      `Image service returned ${res.status}: ${text || res.statusText}`,
    );
  }

  return (await res.json()) as GenerateResult;
}

export function generateHero(
  prompt: string,
  seed: number,
  gender?: string,
  jobId?: string,
) {
  return callService("hero", prompt, seed, gender, jobId);
}

/** Fetch the live 0-100 denoising progress for an in-flight job. */
export async function getImageProgress(jobId: string): Promise<number> {
  const res = await fetch(`${IMAGE_SERVICE_URL}/progress/${jobId}`, {
    cache: "no-store",
  });
  if (!res.ok) return 0;
  const data = (await res.json()) as { progress?: number };
  return typeof data.progress === "number" ? data.progress : 0;
}
