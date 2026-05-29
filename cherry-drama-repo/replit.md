# Cherry Drama

AI-powered drama recap generator that takes a raw movie/episode video and produces a professional narrated recap video with burned-in subtitles, Myanmar or Japanese voiceover, and Cherry Drama branding.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000 / 8080)
- `pnpm --filter @workspace/cherry-drama run dev` — run the React frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + shadcn/ui + Tailwind CSS (artifact: cherry-drama)
- API: Express 5 (artifact: api-server)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Routing: wouter
- State: TanStack Query v5

## Where things live

- `artifacts/cherry-drama/` — React frontend (all 4 pages)
- `artifacts/api-server/src/routes/jobs.ts` — all job CRUD endpoints
- `lib/db/src/schema/jobs.ts` — DB schema (jobs table)
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `artifacts/cherry-drama/public/cherry-drama-logo.jpg` — brand logo

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed React Query hooks
- API keys (Groq, Gemini, Azure TTS) stored in browser localStorage only — never sent to server
- Jobs table tracks status, progress (0-100), stage label, outputUrl, thumbnailUrl
- All DB access goes through Drizzle ORM; raw SQL is avoided
- Python video processing pipeline (Whisper, FFmpeg, Gemini, Azure TTS) planned as next phase

## Product

Cherry Drama is a creator tool for a Myanmar/Japanese drama recap YouTube channel. It lets creators:
1. Upload a raw episode/movie video and enter the title + language
2. Watch the AI processing pipeline run in real time (Transcription → Script → Voice → Video composition)
3. Download the finished recap video from the library
4. Manage their Groq/Gemini/Azure API keys securely in Settings

## Video output spec (IMPORTANT for pipeline)

The final output video must include Cherry Drama logo in TWO ways:
1. **Intro slide (0:15–0:20)** — logo slides in to center of screen with movie title beneath it (animated, ~5 seconds)
2. **Corner watermark** — after intro, logo stays as semi-transparent watermark in bottom-right corner for the entire duration of the video

Logo file: `artifacts/cherry-drama/public/cherry-drama-logo.jpg`
Implementation: FFmpeg `overlay` filter with `fade` for slide-in animation, then fixed corner position

Full output video structure:
- Hook teaser (0–15s): dramatic scene clip
- Cherry Drama logo intro (15–20s): slide-in animation + movie title
- Main recap body: scene clips synced to narrator voiceover + burned-in subtitles
- Logo watermark: bottom-right corner throughout entire video

## User preferences

- Brand: deep dark maroon (#1a0a0f), cherry pink (#C2185B), soft pink (#ffb3cc)
- No emojis in the UI
- API keys stored in localStorage only
- Myanmar narrator: Azure TTS my-MM-ThihaNeural
- Japanese narrator: Voicevox

## Gotchas

- Always run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck` — the DB lib must be built first so `jobsTable` is exported
- Express 5 async route handlers must use `{ res.status(...); return; }` pattern (not `return res...`)
- Do not run `pnpm run dev` at workspace root — use workflows or per-package `--filter` commands

## Pointers

- See `PIPELINE.md` — **complete Python pipeline implementation guide** with actual working code for every step (Whisper, Gemini, Azure TTS, FFmpeg composition, thumbnail, worker daemon, file organization, checklist)
- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
