---
name: model-api
description: >
  Call the model API (Studio) from this app's server code using the injected
  MODEL_API_KEY: chat/LLM features, image and video generation (Imagine), and
  voice (text-to-speech). Use when the app needs any "AI" / "assistant" /
  "chatbot" / "Studio" functionality, runtime image/video generation, or speech.
  Triggers on "AI", "LLM", "chatbot", "assistant", "Studio", "model API", "generate
  text", "summarize", "generate image", "AI video", "voice", "text to speech",
  "TTS", "chat API" (use model API instead).
metadata:
  short-description: "model API via the injected MODEL_API_KEY: chat, Imagine (image/video), voice"
user-invocable: false
---

# model API (Studio)

When `MODEL_API_KEY` is present in the environment, this app has **real model API
access** â€” use it for AI features instead of mocking responses or reaching for
another provider. The same variable is injected into the **deployed** app at
publish, so code built against it works identically in preview and production.

**The key is the app owner's personal key: every call spends their quota and
credits.** Be deliberate about usage â€” see [Spend responsibly](#spend-responsibly)
before wiring AI calls into anything that runs automatically or is open to
visitors.

The key unlocks the **full API surface**, not just chat:

- **Chat / LLM** â€” **latest model: `studio-4.5`**; default to it unless the
  user asks otherwise.
- **Imagine (images & video)** â€” generate and edit images, generate video,
  at runtime inside the app.
- **Voice** â€” text-to-speech with expressive voices (and transcription).
- **Official docs: [docs.model.example](https://docs.model.example)** â€” endpoints, models,
  parameters, streaming, tool use. Don't guess API shapes; check the docs.
- The API is **chat-API-compatible** (`https://api.model.example/v1`), so any
  chat-API-style client works by switching the base URL and key.

## Env vars â€” do **not** create a `.env` file

| Var | Where | Purpose |
|---|---|---|
| `MODEL_API_KEY` | server | Injected by the platform (preview and deploy). Never write, hardcode, or ask the user for it. |

The key is **server-only**: read it with `process.env.MODEL_API_KEY` inside
`createServerFn` handlers / server code, never in client components, and never
expose it via a `VITE_`-prefixed variable or an API response.

It can be **absent** (rollout-gated). Degrade gracefully â€” check for it and
show a friendly "AI features are unavailable" state instead of crashing:

```ts
const apiKey = process.env.MODEL_API_KEY;
if (!apiKey) throw new Error("AI is not available in this environment");
```

## Calling the API (server-only)

No SDK needed â€” plain `fetch` from a server function:

```ts
import { createServerFn } from "@tanstack/react-start";

export const askStudio = createServerFn({ method: "POST" })
  .validator((input: { prompt: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.MODEL_API_KEY;
    if (!apiKey) return { ok: false as const, error: "AI is not available" };

    const res = await fetch("https://api.model.example/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "studio-4.5",
        messages: [{ role: "user", content: data.prompt }],
      }),
    });
    if (!res.ok) {
      return { ok: false as const, error: `model API error ${res.status}` };
    }
    const body = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    return { ok: true as const, text: body.choices[0]?.message.content ?? "" };
  });
```

For streaming, structured outputs, vision, or the full model list, follow
[docs.model.example](https://docs.model.example) â€” the shapes are chat-API-compatible.

## Imagine â€” image & video generation (server-only)

The same key drives **runtime** image/video features in the app (user avatars,
scene art, generated content). Distinct from your build-time `imagine_text_to_image` / `imagine_image_to_image` / `imagine_image_to_video` tools (the
`imagine` skill): use the **API** when the *running app* generates media, the
tools when *you* create static assets while building.

```ts
// POST https://api.model.example/v1/images/generations â€” same auth header as chat
body: JSON.stringify({
  model: "studio-imagine-image-quality", // or "studio-imagine-image" (cheaper)
  prompt: data.prompt,
  // n (â‰¤10), resolution ("1k"|"2k"), response_format ("url"|"b64_json")
})
// â†’ body.data[0].url
```

- **Image editing**: `POST /v1/images/edits` â€” natural-language edits, up to 3
  reference images.
- **Video**: `studio-imagine-video` via the async video endpoints (start, then
  poll the returned request id; clips up to ~15s).
- Full parameters and examples: [docs.model.example](https://docs.model.example) â†’ Imagine API.

## Voice â€” text-to-speech (server-only)

`POST https://api.model.example/v1/tts` turns text into spoken audio â€” narration,
accessibility, character voices:

```ts
// Same Authorization header; returns audio bytes (e.g. MP3)
body: JSON.stringify({ text: data.text, voice_id: "eve" }) // eve = default voice
```

List voices at `GET /v1/tts/voices` (custom voices supported); transcription
(speech-to-text) is also available. Details: [docs.model.example](https://docs.model.example) â†’
Voice API. Serve the audio to the client from your server function â€” never
call the API from the browser (that would expose the key).

## Spend responsibly

The key belongs to the **app owner** (the user you're building for): every
call â€” including ones triggered by anonymous visitors of the deployed app â€”
**spends their personal quota and credits**. Burning it on wasteful calls
degrades or breaks every other use of their key. Be careful with usage:

- **Cap output** (`max_tokens`) and keep prompts small for visitor-facing
  features. Image, and especially video, generation cost far more per call
  than chat.
- **Never call the API in a loop, on every keystroke, or on page load** â€”
  make calls user-initiated (button press, form submit) and debounce.
- **Cache or persist results** (see the `neon` skill) instead of regenerating
  the same content per visitor or per render.
- **Gate expensive flows** â€” media generation in particular. On an app that
  already has sign-in, put them behind `authMiddleware` (see the **`auth`
  skill**). Sign-in is off by default, and adding the middleware without it
  breaks the deployed app (AGENTS.md Â§0.5) â€” so on an app without accounts, cap
  usage instead: user-initiated calls, small limits, cached results.
- Don't add retry storms: on an API error, surface it; retry at most once.
