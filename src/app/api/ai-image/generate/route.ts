import { NextResponse } from "next/server";

const OPENAI_IMAGES = "https://api.openai.com/v1/images/generations";

/** GPT Image models accept much longer prompts than legacy DALL·E 2. */
const MAX_PROMPT_GPT_IMAGE = 32000;
const MAX_PROMPT_DALLE2 = 1000;

/**
 * Default after DALL·E 3 API retirement (~May 2026). Override with OPENAI_IMAGE_MODEL if needed.
 * @see https://platform.openai.com/docs/api-reference/images/create
 */
const DEFAULT_IMAGE_MODEL = "gpt-image-1.5";

function isGptImageModel(model: string): boolean {
  return model.startsWith("gpt-image");
}

/**
 * Server-only: OpenAI Images API (GPT Image by default). Requires OPENAI_API_KEY.
 * Optional: OPENAI_IMAGE_MODEL — e.g. gpt-image-1.5 (default), gpt-image-1-mini, dall-e-2.
 */
export async function POST(request: Request) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return NextResponse.json(
      { error: "AI images are not configured. Set OPENAI_API_KEY in .env.local." },
      { status: 503 }
    );
  }

  let body: { prompt?: string };
  try {
    body = (await request.json()) as { prompt?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prompt = (body.prompt ?? "").trim();
  if (!prompt) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  const model = (process.env.OPENAI_IMAGE_MODEL ?? DEFAULT_IMAGE_MODEL).trim() || DEFAULT_IMAGE_MODEL;
  const gpt = isGptImageModel(model);
  const maxLen = gpt ? MAX_PROMPT_GPT_IMAGE : MAX_PROMPT_DALLE2;
  const safePrompt = prompt.slice(0, maxLen);

  const payload: Record<string, unknown> = gpt
    ? {
        model,
        prompt: safePrompt,
        n: 1,
        size: "1536x1024",
        quality: "medium",
        output_format: "png",
      }
    : {
        model,
        prompt: safePrompt,
        n: 1,
        size: "1024x1024",
        response_format: "url",
      };

  const res = await fetch(OPENAI_IMAGES, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as {
    data?: Array<{ url?: string; b64_json?: string; revised_prompt?: string }>;
    error?: { message?: string };
  };

  if (!res.ok) {
    const msg = data.error?.message ?? "OpenAI request failed";
    const st = res.status;
    return NextResponse.json({ error: msg }, { status: st === 500 ? 502 : st >= 400 && st < 600 ? st : 502 });
  }

  let url: string | undefined;
  if (gpt) {
    const b64 = data.data?.[0]?.b64_json;
    if (b64) {
      url = `data:image/png;base64,${b64}`;
    }
  } else {
    url = data.data?.[0]?.url;
  }

  if (!url) {
    return NextResponse.json({ error: "No image data in response" }, { status: 502 });
  }

  const revised = data.data?.[0]?.revised_prompt;
  return NextResponse.json({
    url,
    revisedPrompt: revised ?? safePrompt,
  });
}
