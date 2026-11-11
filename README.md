# SaaS Video Generator — RecapMaker web app

FastAPI backend for the movie-clip recap SaaS: upload a video, get a narrated
recap video back. This repo holds the **web app**. The offline pipeline
scripts and the durable record of the tested v2 run live in
[`samiullahme/recapmaker-v2`](https://github.com/samiullahme/recapmaker-v2).

## Status — work in progress, paused 2026-11-08

This is the backend skeleton only. It was paused while the v2 pipeline was
tested by hand. What exists:

- `app/config.py` — all settings from environment variables, never hardcoded keys
- `app/providers.py` — OpenAI-compatible LLM / vision / TTS providers, with a
  keyless test-agent mode and retries
- `app/store.py` — job store: one directory per job, `job.json` + `stages/*.json`
  on disk, resumable from the failed stage

What does **not** exist yet: the server entrypoint (`main.py` with the FastAPI
app and routes), the frontend, and the worker that runs the stages. Do not
expect this repo to run as-is.

## How a job flows (once the worker exists)

Upload → Transcribe (faster-whisper) → Detect shots → Describe shots →
Write script (outline, narration, verification) → Generate voiceover →
Render. Each stage's output is saved as JSON before the next stage starts, so
a failed job resumes from the failed stage. Results are kept 24 hours
(`JOB_TTL_HOURS`).

## Install

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in your keys; never commit .env
```

`requirements.txt` pins **`av==13.1.0`** — do not "upgrade" it.
faster-whisper 1.2.1 passes `metadata_errors` to `av.open`, which av ≥ 14
removed, and av 11 has no Python 3.12 wheel. 13.1.0 is the working pin
(verified 2026-11-08).

## Configuration

Copy `.env.example` to `.env` and fill in the keys. All provider settings take
a specific key/url/model, falling back to `OPENAI_API_KEY`. Key names:

- `TRANSCRIBE_API_KEY` / `TRANSCRIBE_API_URL` / `TRANSCRIBE_MODEL` (default `whisper-1`)
- `VISION_LLM_API_KEY` / `VISION_LLM_API_URL` / `VISION_LLM_MODEL` (default `gpt-4o-mini`)
- `SCRIPT_LLM_API_KEY` / `SCRIPT_LLM_API_URL` / `SCRIPT_LLM_MODEL` (default `gpt-4o-mini`)
- `TTS_API_KEY` / `TTS_API_URL` / `TTS_MODEL` / `TTS_VOICE`
- `WHISPER_MODEL` (local faster-whisper model when no `TRANSCRIBE_API_KEY` is set: `tiny`/`base`/`small`)
- `RECAPMAKER_PORT` (default `3150`), `RECAPMAKER_DATA_DIR` (default `data`),
  `RECAPMAKER_TEST_AGENT` (`1` = keyless test mode, stages wait for operator input)

In test mode (`RECAPMAKER_TEST_AGENT=1`, no keys), the vision/script stages
write a `<name>_request.json` into the job's stages dir and wait for the
operator to drop `<name>_agent.json` with the answer; TTS uses the local
`/opt/hatch/bin/tts` CLI.

## File map

```
README.md               this file
requirements.txt        fastapi, uvicorn, faster-whisper, av==13.1.0, scenedetect, httpx
.env.example            config template (keys empty — never commit real keys)
app/
  config.py             env-based settings
  providers.py          LLM / vision / TTS provider layer
  store.py              job store (jobs/<id>/job.json + stages/*.json)
data/                   runtime job storage (gitignored, not committed)
```

## Related

- [`samiullahme/recapmaker-v2`](https://github.com/samiullahme/recapmaker-v2) —
  the pipeline scripts and the v2 test run outputs (transcript, shots,
  descriptions, script, voiceover timings, subtitles).
