# Cherry Drama

AI-powered drama recap video generator for a Myanmar/Japanese YouTube channel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, path `/api`)
- `pnpm --filter @workspace/cherry-drama run dev` — run the web frontend (port 3000, path `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter + Tailwind + shadcn/ui
- API: Express 5 + multer (chunked upload)
- DB: PostgreSQL + Drizzle ORM (`lib/db/src/schema/jobs.ts`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Pipeline: Python 3 — Whisper (Groq), Gemini 2.5 Flash, Azure TTS, FFmpeg

## Where things live

- `artifacts/cherry-drama/` — React frontend (Upload, Processing, Library, Settings)
- `artifacts/api-server/` — Express API server (jobs CRUD + chunked upload)
- `lib/db/src/schema/jobs.ts` — DB schema (jobs table)
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `cherry-drama-repo/pipeline/` — Python AI pipeline (worker.py, pipeline.py, steps/)
- `cherry-drama-repo/pipeline/assets/logo.jpg` — Cherry Drama logo for video branding

## Architecture decisions

- API keys (Groq, Gemini, Azure TTS) stored in browser localStorage only — never sent to server at rest. Passed as request headers on upload start, stored in server memory Map for the job duration.
- Chunked upload: 5 MB chunks, 3 retries with exponential backoff. Server merges chunks before creating job record.
- Python worker runs as a child process of the API server. Polls `/api/jobs?status=pending` for new jobs.
- Internal `/api/jobs/:id/keys` endpoint is localhost-only (IP check) — Python worker calls it to fetch API keys.
- Pipeline: `cherry-drama-repo/pipeline/` is mounted at PIPELINE_DIR env var (default: relative to api-server dist).

## Product

- Upload a raw drama video file (any size via chunked upload)
- Select language (Myanmar or Japanese) and enter movie title
- AI pipeline: transcribes audio (Whisper turbo via Groq), generates recap script (Gemini 2.5 Flash), synthesizes narrator voice (Azure TTS — Myanmar: `my-MM-ThihaNeural`, Japanese: `ja-JP-NanamiNeural`), composes final video with subtitles + Cherry Drama branding + thumbnail
- Live progress tracking in Processing Queue
- Download completed recap videos from Recap Library

## User preferences

- API keys managed entirely in browser localStorage — no server persistence
- Myanmar and Japanese as the two target output languages

## Gotchas

- Python worker requires: `python3`, `pip install -r cherry-drama-repo/pipeline/requirements.txt`, `ffmpeg` system binary
- `python3` ENOENT at startup is expected if Python is not installed; server still starts, upload/queue work fine
- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change
- Run `pnpm --filter @workspace/db run push` after any schema change (requires DATABASE_URL)
- The cherry-drama-repo/ subdirectory is a GitHub clone — edits to the pipeline go there, edits to the web app / API go in root `artifacts/`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
