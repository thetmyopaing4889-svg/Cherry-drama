# Cherry Drama — Video Processing Pipeline
## Complete Implementation Guide for the Next Developer / AI Agent

This file contains **everything needed to build the Python video processing pipeline** from scratch.
The frontend (React) and backend API (Express + PostgreSQL) are already built. Only the pipeline is missing.

---

## 🔔 2026 Update Notes — မဖြစ်မနေ ပြောင်းလဲရမည့်အချက်များ

> **Last updated: May 2026**
> Pipeline run မတိုင်ခင် အောက်ပါအချက်များကို အရင်ဆုံး စစ်ဆေးပါ။

### 1. Gemini AI Model — မဖြစ်မနေ ပြောင်းရမည် ⚠️

| | Model |
|---|---|
| **လက်ရှိ (Deprecated)** | `gemini-2.0-flash-exp` |
| **အသစ် (သုံးရမည်)** | `gemini-2.5-flash` |

Google သည် `gemini-2.0-flash-exp` ကို **2026 June 1** တွင် ပိတ်မည်ဟု ကြေညာထားသည်။
ပြောင်းမထားပါက June ရောက်လျှင် pipeline တစ်ခုလုံး run မရဘဲ ချက်ချင်းကျသွားမည်။

**ပြောင်းရမည့် ဖိုင်များ:**
- `pipeline/steps/analyze_scenes.py` — `GenerativeModel("gemini-2.0-flash-exp")` → `GenerativeModel("gemini-2.5-flash")`
- `pipeline/steps/generate_script.py` — အတူတူပြောင်းရမည်

---

### 2. Japanese TTS — မဖြစ်မနေ ပြောင်းရမည် ⚠️

| | TTS Engine |
|---|---|
| **လက်ရှိ (အသုံးမပြုနိုင်)** | Voicevox (local server) |
| **အသစ် (သုံးရမည်)** | Azure TTS — `ja-JP-NanamiNeural` (female) သို့မဟုတ် `ja-JP-KeitaNeural` (male) |

Voicevox သည် ကိုယ်ပိုင် computer ပေါ်တွင်သာ run ၍ရသည်။ Replit, cloud server, VPS တွင် install မရပါ။
Myanmar TTS အတွက် သုံးနေသော Azure key ကိုပင် ထပ်သုံးနိုင်သောကြောင့် key အသစ် မလိုပါ။

**ပြောင်းရမည့် ဖိုင်:** `pipeline/steps/tts_japanese.py`

```python
# Voicevox ကို ဤ Azure TTS code နှင့် အစားထိုးပါ
import azure.cognitiveservices.speech as speechsdk

def generate_japanese_audio(text: str, azure_key: str, output_path: str):
    speech_config = speechsdk.SpeechConfig(subscription=azure_key, region="eastasia")
    speech_config.speech_synthesis_voice_name = "ja-JP-NanamiNeural"  # သို့မဟုတ် ja-JP-KeitaNeural
    speech_config.set_speech_synthesis_output_format(
        speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
    )
    audio_config = speechsdk.audio.AudioOutputConfig(filename=output_path)
    synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)
    result = synthesizer.speak_text_async(text).get()
    if result.reason != speechsdk.ResultReason.SynthesizingAudioCompleted:
        raise RuntimeError(f"Azure TTS (Japanese) failed: {result.cancellation_details.error_details}")
```

---

### 3. Whisper Model — အကြံပြုသည် (Speed + Cost) ✅

| | Model | Speed | Cost |
|---|---|---|---|
| **လက်ရှိ** | `whisper-large-v3` | baseline | baseline |
| **အကြံပြု** | `whisper-large-v3-turbo` | **216x ပိုမြန်** | **63% သက်သာ** |

Accuracy ကွာခြားချက် မသိသာသောကြောင့် turbo version သို့ ပြောင်းသင့်သည်။
Myanmar transcription တိကျမှုပိုကောင်းစေရန် `language="my"` ထည့်ပါ။

**ပြောင်းရမည့် ဖိုင်:** `pipeline/steps/transcribe.py`

```python
# ပြောင်းရမည် (line 2 ခု)
model="whisper-large-v3-turbo",   # whisper-large-v3 မှ
language="my",                     # Myanmar language ထည့်ပါ (Japanese job ဆိုလျှင် "ja")
```

---

### 4. Myanmar TTS — Female Voice ရွေးချယ်နိုင်သည် (Optional) 🎙️

| Voice | Gender | သင့်တော်မှု |
|---|---|---|
| `my-MM-ThihaNeural` | Male | ✅ လက်ရှိ default |
| `my-MM-NilarNeural` | Female | ✅ Drama recap အတွက် ပိုနွေးထွေး |

Azure account တစ်ခုတည်းမှ voice ၂ ခုလုံးရနိုင်သောကြောင့် ကုန်ကျစရိတ်ထပ်မဖြစ်ပါ။
Settings page တွင် user ကိုယ်တိုင် ရွေးချယ်နိုင်အောင် voice dropdown ထည့်နိုင်သည်။

---

### ✅ 2026 Update Checklist

- [ ] `gemini-2.0-flash-exp` → `gemini-2.5-flash` (analyze_scenes.py + generate_script.py)
- [ ] Voicevox → Azure TTS `ja-JP-NanamiNeural` (tts_japanese.py)
- [ ] `whisper-large-v3` → `whisper-large-v3-turbo` + `language="my"` (transcribe.py)
- [ ] Myanmar voice: ThihaNeural (male) သို့မဟုတ် NilarNeural (female) ရွေးချယ်

---

## What Is Already Built (Do NOT rebuild these)

| Component | Location | Status |
|---|---|---|
| React frontend (4 pages) | `artifacts/cherry-drama/src/` | ✅ Done |
| Express API server | `artifacts/api-server/src/` | ✅ Done |
| PostgreSQL jobs table | `lib/db/src/schema/jobs.ts` | ✅ Done |
| OpenAPI spec + React Query hooks | `lib/api-spec/`, `lib/api-client-react/` | ✅ Done |
| Cherry Drama logo | `artifacts/cherry-drama/public/cherry-drama-logo.jpg` | ✅ Done |

---

## What Needs to Be Built (Your Job)

A **Python worker** that:
1. Watches for `pending` jobs in the database
2. Runs the full pipeline: Upload → Transcribe → Analyze → Script → TTS → Compose → Thumbnail
3. Updates job progress in real time via the API
4. Saves the output video + thumbnail and writes their URLs back to the job

---

## Database Schema (already exists)

```sql
CREATE TABLE jobs (
  id              SERIAL PRIMARY KEY,
  movie_title     TEXT NOT NULL,
  language        TEXT NOT NULL,          -- 'myanmar' or 'japanese'
  video_filename  TEXT,                   -- original uploaded filename
  status          TEXT DEFAULT 'pending', -- pending | processing | completed | failed
  progress        INTEGER DEFAULT 0,      -- 0–100
  stage           TEXT DEFAULT 'Waiting', -- human-readable current step label
  output_url      TEXT,                   -- URL to final output video
  thumbnail_url   TEXT,                   -- URL to thumbnail image
  duration_seconds INTEGER,              -- actual output video duration
  recommended_duration INTEGER,          -- AI-suggested duration (seconds)
  error           TEXT,                   -- error message if failed
  created_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ
);
```

---

## API Endpoints (already working on Express server at `/api`)

### Update job progress (call this throughout the pipeline):
```
PATCH /api/jobs/{id}/progress
Content-Type: application/json

{
  "status": "processing",
  "progress": 25,
  "stage": "Transcribing audio",
  "outputUrl": null,
  "thumbnailUrl": null,
  "error": null
}
```

### Mark job completed:
```
PATCH /api/jobs/{id}/progress
{
  "status": "completed",
  "progress": 100,
  "stage": "Done",
  "outputUrl": "/outputs/job_5/recap.mp4",
  "thumbnailUrl": "/outputs/job_5/thumbnail.jpg",
  "durationSeconds": 487
}
```

### Mark job failed:
```
PATCH /api/jobs/{id}/progress
{
  "status": "failed",
  "progress": 0,
  "stage": "Failed",
  "error": "Groq API key invalid"
}
```

---

## API Keys

**Stored in the browser's localStorage only** — frontend sends them in request headers when triggering a job.
The Express API server must forward these to the Python worker.

| Key | localStorage key | Header to forward |
|---|---|---|
| Groq API Key | `GROQ_API_KEY` | `X-Groq-Key` |
| Gemini API Key | `GEMINI_API_KEY` | `X-Gemini-Key` |
| Azure TTS Key | `AZURE_TTS_KEY` | `X-Azure-Key` |

**Alternative approach**: User enters keys in Settings page → stored in localStorage →
when "Start Recap" is clicked, keys are sent as JSON body fields to `POST /api/jobs` →
Express stores them temporarily (in-memory or Redis) → Python worker fetches them.

---

## File Organization

```
pipeline/                          ← CREATE THIS DIRECTORY
├── worker.py                      ← Main job queue daemon (polls DB for pending jobs)
├── pipeline.py                    ← Orchestrates all steps for one job
├── steps/
│   ├── upload_handler.py          ← Saves uploaded video to disk
│   ├── transcribe.py              ← Whisper via Groq API → SRT
│   ├── extract_frames.py          ← FFmpeg → key frame images every 60s
│   ├── analyze_scenes.py          ← Gemini Vision → scene descriptions
│   ├── generate_script.py         ← Gemini → full recap script with timestamps
│   ├── tts_myanmar.py             ← Azure TTS my-MM-ThihaNeural → MP3
│   ├── tts_japanese.py            ← Voicevox local API → WAV
│   ├── compose_video.py           ← FFmpeg → final video with logo/subtitles
│   └── generate_thumbnail.py      ← Pillow → movie poster thumbnail
├── assets/
│   └── logo.jpg                   ← Copy of cherry-drama-logo.jpg (for FFmpeg use)
├── outputs/                       ← Output videos saved here (one folder per job id)
│   └── job_{id}/
│       ├── recap.mp4
│       └── thumbnail.jpg
├── temp/                          ← Temporary files (frames, audio, clips) — delete after
└── requirements.txt
```

---

## requirements.txt

```
groq>=0.9.0
google-generativeai>=0.7.0
azure-cognitiveservices-speech>=1.38.0
requests>=2.31.0
Pillow>=10.0.0
psycopg2-binary>=2.9.0
python-dotenv>=1.0.0
```

> FFmpeg must be installed as a system binary: `apt-get install ffmpeg`

---

## Step-by-Step Implementation

---

### STEP 0: Worker Daemon (`pipeline/worker.py`)

Polls the database every 10 seconds for pending jobs and runs them one at a time.

```python
import time
import psycopg2
import os
from pipeline import run_pipeline

DB_URL = os.environ["DATABASE_URL"]

def get_pending_job(conn):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT id, movie_title, language, video_filename
            FROM jobs
            WHERE status = 'pending'
            ORDER BY created_at ASC
            LIMIT 1
        """)
        return cur.fetchone()

def main():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    print("Cherry Drama worker started — polling for jobs...")
    while True:
        job = get_pending_job(conn)
        if job:
            job_id, movie_title, language, video_filename = job
            print(f"[Job {job_id}] Starting: {movie_title} ({language})")
            run_pipeline(job_id, movie_title, language, video_filename)
        else:
            time.sleep(10)

if __name__ == "__main__":
    main()
```

---

### STEP 1: Progress Updater (helper used by all steps)

```python
# pipeline/progress.py
import requests

API_BASE = "http://localhost:8080/api"  # Express API server

def update_progress(job_id: int, status: str, progress: int, stage: str,
                    output_url=None, thumbnail_url=None,
                    duration_seconds=None, error=None):
    payload = {
        "status": status,
        "progress": progress,
        "stage": stage,
    }
    if output_url: payload["outputUrl"] = output_url
    if thumbnail_url: payload["thumbnailUrl"] = thumbnail_url
    if duration_seconds: payload["durationSeconds"] = duration_seconds
    if error: payload["error"] = error

    requests.patch(f"{API_BASE}/jobs/{job_id}/progress", json=payload)
```

---

### STEP 2: Transcription (`pipeline/steps/transcribe.py`)

Uses Groq's Whisper API to transcribe the video audio into SRT format with timestamps.

```python
from groq import Groq
import subprocess
import os

def extract_audio(video_path: str, output_path: str):
    """Extract audio from video as MP3 for Whisper."""
    subprocess.run([
        "ffmpeg", "-i", video_path,
        "-vn", "-ar", "16000", "-ac", "1",
        "-b:a", "64k", output_path, "-y"
    ], check=True, capture_output=True)

def transcribe(video_path: str, groq_api_key: str, temp_dir: str) -> list[dict]:
    """
    Returns list of segments:
    [{"start": 0.0, "end": 5.2, "text": "..."}, ...]
    """
    audio_path = os.path.join(temp_dir, "audio.mp3")
    extract_audio(video_path, audio_path)

    client = Groq(api_key=groq_api_key)
    with open(audio_path, "rb") as f:
        response = client.audio.transcriptions.create(
            file=("audio.mp3", f),
            model="whisper-large-v3",
            response_format="verbose_json",
            timestamp_granularities=["segment"]
        )

    segments = []
    for seg in response.segments:
        segments.append({
            "start": seg.start,
            "end": seg.end,
            "text": seg.text.strip()
        })
    return segments

def segments_to_srt(segments: list[dict]) -> str:
    """Convert segments list to SRT format string."""
    def fmt(t):
        h = int(t // 3600)
        m = int((t % 3600) // 60)
        s = int(t % 60)
        ms = int((t % 1) * 1000)
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

    lines = []
    for i, seg in enumerate(segments, 1):
        lines.append(str(i))
        lines.append(f"{fmt(seg['start'])} --> {fmt(seg['end'])}")
        lines.append(seg["text"])
        lines.append("")
    return "\n".join(lines)
```

---

### STEP 3: Key Frame Extraction (`pipeline/steps/extract_frames.py`)

```python
import subprocess
import os
import glob

def extract_key_frames(video_path: str, output_dir: str, interval_seconds: int = 60):
    """
    Extract one frame every `interval_seconds` from the video.
    Returns list of (timestamp_seconds, image_path) tuples.
    """
    os.makedirs(output_dir, exist_ok=True)
    subprocess.run([
        "ffmpeg", "-i", video_path,
        "-vf", f"fps=1/{interval_seconds}",
        os.path.join(output_dir, "frame_%04d.jpg"),
        "-y"
    ], check=True, capture_output=True)

    frames = sorted(glob.glob(os.path.join(output_dir, "frame_*.jpg")))
    result = []
    for i, path in enumerate(frames):
        timestamp = i * interval_seconds
        result.append((timestamp, path))
    return result
```

---

### STEP 4: Scene Analysis + Script Generation (`pipeline/steps/generate_script.py`)

Uses Gemini Vision to analyze key frames, then generates the full recap script.

```python
import google.generativeai as genai
from PIL import Image
import json

def analyze_scenes(frames: list[tuple], segments: list[dict], gemini_api_key: str) -> str:
    """
    frames: [(timestamp, image_path), ...]
    segments: [{"start", "end", "text"}, ...]
    Returns: scene descriptions as a combined text
    """
    genai.configure(api_key=gemini_api_key)
    model = genai.GenerativeModel("gemini-2.0-flash-exp")

    scene_parts = []
    for timestamp, img_path in frames[:10]:  # max 10 frames to save tokens
        img = Image.open(img_path)
        # Get dialogue near this timestamp
        nearby = [s["text"] for s in segments if abs(s["start"] - timestamp) < 60]
        dialogue_context = " ".join(nearby[:5])

        prompt = f"""This is a frame from minute {timestamp//60} of a movie/drama.
Dialogue near this moment: "{dialogue_context}"
Describe: who is in the scene, what is happening, what emotion/tone is present.
Be concise (2-3 sentences)."""

        response = model.generate_content([prompt, img])
        scene_parts.append(f"[Minute {timestamp//60}] {response.text}")

    return "\n\n".join(scene_parts)


def generate_recap_script(
    movie_title: str,
    language: str,
    segments: list[dict],
    scene_descriptions: str,
    gemini_api_key: str
) -> dict:
    """
    Returns dict:
    {
      "hook_timestamp": 1234.5,    # seconds into original video for hook clip
      "hook_duration": 15,
      "recommended_duration": 480, # seconds for full recap
      "script": [
        {
          "text": "narrator text here...",
          "clip_start": 123.0,     # timestamp in original video to show
          "clip_end": 135.0,
          "duration": 12.0
        },
        ...
      ],
      "outro_text": "If you enjoyed this recap, subscribe to Cherry Drama!"
    }
    """
    genai.configure(api_key=gemini_api_key)
    model = genai.GenerativeModel("gemini-2.0-flash-exp")

    full_transcript = " ".join(s["text"] for s in segments)
    lang_instruction = (
        "Write ALL narrator text in Myanmar language (Burmese script)."
        if language == "myanmar"
        else "Write ALL narrator text in Japanese language (日本語)."
    )

    prompt = f"""You are a professional YouTube drama recap creator for the channel "Cherry Drama".

Movie/Drama: {movie_title}
{lang_instruction}

TRANSCRIPT (with timestamps):
{json.dumps(segments[:100], ensure_ascii=False)}

SCENE DESCRIPTIONS:
{scene_descriptions}

Create a complete recap script. Return ONLY valid JSON in this exact format:
{{
  "hook_timestamp": <float, seconds into the video of the most dramatic/shocking moment>,
  "hook_duration": 15,
  "recommended_duration": <integer, recommended total recap length in seconds, between 180-900>,
  "script": [
    {{
      "text": "<narrator text in {language} language>",
      "clip_start": <float, timestamp in original video>,
      "clip_end": <float, timestamp in original video>,
      "duration": <float, clip_end - clip_start>
    }}
  ],
  "outro_text": "<closing line in {language} language>"
}}

Rules:
- hook_timestamp: pick the most emotionally intense / shocking moment
- script: 8-15 segments covering the full story arc (beginning, conflict, climax, resolution)
- Each segment text should be dramatic and engaging, narrator-style
- clip timestamps must be real timestamps from the transcript
- Total script duration should match recommended_duration
- outro_text: encourage viewers to subscribe to Cherry Drama channel"""

    response = model.generate_content(prompt)
    text = response.text.strip()
    # Strip markdown code fences if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())
```

---

### STEP 5: Myanmar TTS (`pipeline/steps/tts_myanmar.py`)

Uses Azure Cognitive Services — voice: `my-MM-ThihaNeural`

```python
import azure.cognitiveservices.speech as speechsdk
import os

def generate_myanmar_audio(text: str, azure_key: str, output_path: str):
    """
    Generate MP3 audio from Myanmar text using Azure TTS.
    Voice: my-MM-ThihaNeural (male, dramatic)
    """
    speech_config = speechsdk.SpeechConfig(
        subscription=azure_key,
        region="eastasia"  # or "southeastasia" — choose closest to Myanmar
    )
    speech_config.speech_synthesis_voice_name = "my-MM-ThihaNeural"
    speech_config.set_speech_synthesis_output_format(
        speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
    )

    audio_config = speechsdk.audio.AudioOutputConfig(filename=output_path)
    synthesizer = speechsdk.SpeechSynthesizer(
        speech_config=speech_config,
        audio_config=audio_config
    )

    # Use SSML for dramatic pacing
    ssml = f"""<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="my-MM">
  <voice name="my-MM-ThihaNeural">
    <prosody rate="0.95" pitch="-2%">
      {text}
    </prosody>
  </voice>
</speak>"""

    result = synthesizer.speak_ssml_async(ssml).get()
    if result.reason != speechsdk.ResultReason.SynthesizingAudioCompleted:
        raise RuntimeError(f"Azure TTS failed: {result.cancellation_details.error_details}")
```

---

### STEP 6: Japanese TTS (`pipeline/steps/tts_japanese.py`)

Uses Voicevox (free, local, open source). Must run Voicevox Engine locally on port 50021.

```python
import requests
import json

VOICEVOX_URL = "http://localhost:50021"
SPEAKER_ID = 2  # Zundamon (or change to preferred voice)

def generate_japanese_audio(text: str, output_path: str):
    """
    Generate WAV audio from Japanese text using local Voicevox engine.
    Voicevox must be running: ./voicevox_engine --host 0.0.0.0
    """
    # Step 1: Get audio query
    query_response = requests.post(
        f"{VOICEVOX_URL}/audio_query",
        params={"text": text, "speaker": SPEAKER_ID}
    )
    query_response.raise_for_status()
    audio_query = query_response.json()

    # Adjust for dramatic narration
    audio_query["speedScale"] = 0.95
    audio_query["pitchScale"] = -0.02
    audio_query["intonationScale"] = 1.2

    # Step 2: Synthesize audio
    synthesis_response = requests.post(
        f"{VOICEVOX_URL}/synthesis",
        params={"speaker": SPEAKER_ID},
        data=json.dumps(audio_query),
        headers={"Content-Type": "application/json"}
    )
    synthesis_response.raise_for_status()

    with open(output_path, "wb") as f:
        f.write(synthesis_response.content)
```

---

### STEP 7: Video Composition (`pipeline/steps/compose_video.py`)

The most complex step — uses FFmpeg to assemble everything.

```python
import subprocess
import os
import json

LOGO_PATH = os.path.join(os.path.dirname(__file__), "../assets/logo.jpg")

def extract_clip(video_path: str, start: float, end: float, output_path: str):
    """Extract a clip from the source video."""
    subprocess.run([
        "ffmpeg",
        "-ss", str(start),
        "-to", str(end),
        "-i", video_path,
        "-c:v", "libx264", "-c:a", "aac",
        "-avoid_negative_ts", "1",
        output_path, "-y"
    ], check=True, capture_output=True)


def apply_copyright_transform(clip_path: str, output_path: str):
    """
    Apply copyright fingerprint-reducing transforms:
    - Speed: +3%
    - Color grade: slight saturation/contrast shift
    - Crop: 1% border crop
    """
    subprocess.run([
        "ffmpeg", "-i", clip_path,
        "-vf", "crop=iw*0.99:ih*0.99,eq=saturation=1.1:contrast=1.05,setpts=0.97*PTS",
        "-af", "atempo=1.03,asetrate=44100*1.03,aresample=44100",
        output_path, "-y"
    ], check=True, capture_output=True)


def create_concat_list(clip_paths: list[str], list_file: str):
    """Create FFmpeg concat list file."""
    with open(list_file, "w") as f:
        for path in clip_paths:
            f.write(f"file '{os.path.abspath(path)}'\n")


def add_logo_watermark(input_path: str, output_path: str, logo_path: str = LOGO_PATH):
    """
    Add Cherry Drama logo:
    - Full video: semi-transparent watermark at bottom-right corner (70% opacity)
    - First 5 seconds: logo slides in from left to center, then moves to corner

    FFmpeg overlay filter:
    - x/y for bottom-right: W-w-20, H-h-20
    - Slide-in animation for first 5s using 'if(lt(t,5), ...)' expression
    """
    logo_size = "80:80"  # resize logo to 80x80 pixels

    # Complex filter:
    # [logo] scaled + alpha 0.7
    # First 5s: x slides from -logo_width to corner (slide-in from left)
    # After 5s: fixed at bottom-right corner
    filter_complex = (
        f"[1:v]scale={logo_size},format=rgba,"
        f"colorchannelmixer=aa=0.7[logo];"
        f"[0:v][logo]overlay="
        f"x='if(lt(t,2), -w+t*(main_w-20+w)/2, main_w-w-20)':"
        f"y='if(lt(t,2), main_h/2-h/2, main_h-h-20)'"
    )

    subprocess.run([
        "ffmpeg", "-i", input_path,
        "-i", logo_path,
        "-filter_complex", filter_complex,
        "-c:v", "libx264", "-c:a", "copy",
        "-preset", "fast",
        output_path, "-y"
    ], check=True, capture_output=True)


def burn_subtitles(input_path: str, srt_path: str, output_path: str):
    """Burn SRT subtitles into video."""
    subprocess.run([
        "ffmpeg", "-i", input_path,
        "-vf", f"subtitles='{srt_path}':force_style='FontSize=22,PrimaryColour=&Hffffff,OutlineColour=&H000000,Outline=2,Bold=1'",
        "-c:a", "copy",
        output_path, "-y"
    ], check=True, capture_output=True)


def replace_audio(video_path: str, audio_path: str, output_path: str):
    """Replace video audio with TTS narration."""
    subprocess.run([
        "ffmpeg",
        "-i", video_path,
        "-i", audio_path,
        "-map", "0:v",
        "-map", "1:a",
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",
        output_path, "-y"
    ], check=True, capture_output=True)


def create_intro_slide(logo_path: str, movie_title: str, output_path: str, duration: int = 5):
    """
    Create a 5-second intro slide:
    - Black background
    - Cherry Drama logo slides in from left to center
    - Movie title fades in below
    """
    safe_title = movie_title.replace("'", "\\'")
    subprocess.run([
        "ffmpeg",
        "-f", "lavfi", "-i", f"color=c=0x1a0a0f:size=1920x1080:duration={duration}",
        "-i", logo_path,
        "-filter_complex",
        f"[1:v]scale=200:200[logo];"
        f"[0:v][logo]overlay="
        f"x='if(lt(t,1), -200+t*1160, 860)':"
        f"y='if(lt(t,1), 440, 440)'[bg];"
        f"[bg]drawtext=text='{safe_title}':fontcolor=white:fontsize=48:"
        f"x=(w-text_w)/2:y=680:"
        f"alpha='if(lt(t,1),0,min(1,t-1))'",
        "-c:v", "libx264", "-t", str(duration),
        output_path, "-y"
    ], check=True, capture_output=True)


def compose_full_video(
    source_video: str,
    script: list[dict],
    audio_segments: list[str],   # paths to TTS audio files, one per script segment
    narrator_srt: str,           # SRT of narrator text
    movie_title: str,
    temp_dir: str,
    output_path: str,
    logo_path: str = LOGO_PATH
):
    """
    Full composition pipeline:
    1. Extract scene clips for each script segment
    2. Apply copyright transforms
    3. Replace audio with TTS narration
    4. Burn subtitles
    5. Prepend Cherry Drama intro slide
    6. Add logo watermark to full video
    7. Concatenate everything: [intro] + [recap segments]
    """
    clips_dir = os.path.join(temp_dir, "clips")
    os.makedirs(clips_dir, exist_ok=True)

    final_clips = []

    # Create intro slide
    intro_path = os.path.join(clips_dir, "intro.mp4")
    create_intro_slide(logo_path, movie_title, intro_path)
    final_clips.append(intro_path)

    # Process each script segment
    for i, (segment, audio_path) in enumerate(zip(script, audio_segments)):
        raw_clip = os.path.join(clips_dir, f"clip_{i:03d}_raw.mp4")
        transformed = os.path.join(clips_dir, f"clip_{i:03d}_transformed.mp4")
        with_audio = os.path.join(clips_dir, f"clip_{i:03d}_audio.mp4")
        final_clip = os.path.join(clips_dir, f"clip_{i:03d}_final.mp4")

        # Extract clip from source video
        extract_clip(source_video, segment["clip_start"], segment["clip_end"], raw_clip)

        # Apply copyright transforms
        apply_copyright_transform(raw_clip, transformed)

        # Replace audio with TTS
        replace_audio(transformed, audio_path, with_audio)

        # Burn subtitles (if SRT provided)
        if narrator_srt and os.path.exists(narrator_srt):
            burn_subtitles(with_audio, narrator_srt, final_clip)
        else:
            os.rename(with_audio, final_clip)

        final_clips.append(final_clip)

    # Concatenate all clips
    concat_list = os.path.join(temp_dir, "concat.txt")
    create_concat_list(final_clips, concat_list)
    concat_output = os.path.join(temp_dir, "concat_out.mp4")
    subprocess.run([
        "ffmpeg", "-f", "concat", "-safe", "0",
        "-i", concat_list,
        "-c", "copy",
        concat_output, "-y"
    ], check=True, capture_output=True)

    # Add logo watermark to entire video
    add_logo_watermark(concat_output, output_path, logo_path)
```

---

### STEP 8: Thumbnail Generation (`pipeline/steps/generate_thumbnail.py`)

```python
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import subprocess
import os

LOGO_PATH = os.path.join(os.path.dirname(__file__), "../assets/logo.jpg")

def extract_best_frame(video_path: str, timestamp: float, output_path: str):
    """Extract a single frame from the video at the given timestamp."""
    subprocess.run([
        "ffmpeg", "-ss", str(timestamp),
        "-i", video_path,
        "-frames:v", "1",
        "-q:v", "2",
        output_path, "-y"
    ], check=True, capture_output=True)


def generate_thumbnail(
    video_path: str,
    movie_title: str,
    hook_timestamp: float,
    output_path: str,
    logo_path: str = LOGO_PATH
):
    """
    Generate movie-poster style thumbnail (1280x720):
    - Best frame from video as background
    - Dark gradient overlay (bottom 60%)
    - Movie title text (bold, white)
    - "RECAP" badge (cherry pink #C2185B)
    - Cherry Drama logo (bottom-right)
    """
    frame_path = output_path.replace(".jpg", "_frame.jpg")
    extract_best_frame(video_path, hook_timestamp, frame_path)

    # Base image
    img = Image.open(frame_path).resize((1280, 720), Image.LANCZOS)

    # Dark gradient overlay
    overlay = Image.new("RGBA", (1280, 720), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for y in range(300, 720):
        alpha = int(200 * (y - 300) / 420)
        draw.rectangle([(0, y), (1280, y + 1)], fill=(26, 10, 15, alpha))
    img = Image.alpha_composite(img.convert("RGBA"), overlay)

    draw = ImageDraw.Draw(img)

    # Try to load a font, fallback to default
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 64)
        badge_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
    except Exception:
        title_font = ImageFont.load_default()
        badge_font = ImageFont.load_default()

    # "RECAP" badge (cherry pink pill)
    draw.rounded_rectangle([(40, 600), (160, 648)], radius=8, fill="#C2185B")
    draw.text((58, 608), "RECAP", fill="white", font=badge_font)

    # Movie title
    # Wrap long titles
    words = movie_title.split()
    lines = []
    line = ""
    for word in words:
        test = f"{line} {word}".strip()
        bbox = draw.textbbox((0, 0), test, font=title_font)
        if bbox[2] > 1200:
            lines.append(line)
            line = word
        else:
            line = test
    if line:
        lines.append(line)

    y_start = 660 - len(lines) * 70
    for line_text in lines:
        draw.text((40, y_start), line_text, fill="white", font=title_font,
                  stroke_width=3, stroke_fill="black")
        y_start += 70

    # Cherry Drama logo (bottom-right)
    try:
        logo = Image.open(logo_path).resize((80, 80), Image.LANCZOS).convert("RGBA")
        img.paste(logo, (1180, 620), logo)
    except Exception:
        pass

    img.convert("RGB").save(output_path, "JPEG", quality=92)
    os.remove(frame_path)
```

---

### STEP 9: Main Pipeline Orchestrator (`pipeline/pipeline.py`)

```python
import os
import shutil
import traceback
from progress import update_progress
from steps.transcribe import transcribe, segments_to_srt
from steps.extract_frames import extract_key_frames
from steps.generate_script import analyze_scenes, generate_recap_script
from steps.tts_myanmar import generate_myanmar_audio
from steps.tts_japanese import generate_japanese_audio
from steps.compose_video import compose_full_video
from steps.generate_thumbnail import generate_thumbnail

UPLOADS_DIR = "uploads"     # where uploaded videos are stored
OUTPUTS_DIR = "outputs"     # where finished recaps go
TEMP_BASE = "temp"

# API keys — read from environment or pass from the job record
# In production: Express API should save these when job is created
GROQ_KEY = os.environ.get("GROQ_API_KEY", "")
GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "")
AZURE_KEY = os.environ.get("AZURE_TTS_KEY", "")


def run_pipeline(job_id: int, movie_title: str, language: str, video_filename: str):
    temp_dir = os.path.join(TEMP_BASE, f"job_{job_id}")
    output_dir = os.path.join(OUTPUTS_DIR, f"job_{job_id}")
    os.makedirs(temp_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)

    video_path = os.path.join(UPLOADS_DIR, video_filename)
    output_video = os.path.join(output_dir, "recap.mp4")
    output_thumb = os.path.join(output_dir, "thumbnail.jpg")

    try:
        # --- Stage 1: Transcription (0→20%) ---
        update_progress(job_id, "processing", 5, "Transcribing audio")
        segments = transcribe(video_path, GROQ_KEY, temp_dir)
        srt_text = segments_to_srt(segments)
        srt_path = os.path.join(temp_dir, "transcript.srt")
        with open(srt_path, "w", encoding="utf-8") as f:
            f.write(srt_text)
        update_progress(job_id, "processing", 20, "Transcription complete")

        # --- Stage 2: Scene Analysis (20→35%) ---
        update_progress(job_id, "processing", 22, "Extracting key frames")
        frames_dir = os.path.join(temp_dir, "frames")
        frames = extract_key_frames(video_path, frames_dir, interval_seconds=60)

        update_progress(job_id, "processing", 28, "Analyzing scenes")
        scene_descriptions = analyze_scenes(frames, segments, GEMINI_KEY)

        # --- Stage 3: Script Generation (35→50%) ---
        update_progress(job_id, "processing", 35, "Writing recap script")
        script_data = generate_recap_script(
            movie_title, language, segments, scene_descriptions, GEMINI_KEY
        )
        hook_ts = script_data["hook_timestamp"]
        recommended = script_data["recommended_duration"]
        script_segments = script_data["script"]
        update_progress(job_id, "processing", 50, "Recap script ready")

        # --- Stage 4: TTS Voice Generation (50→70%) ---
        update_progress(job_id, "processing", 52, "Generating narrator voice")
        audio_dir = os.path.join(temp_dir, "audio")
        os.makedirs(audio_dir, exist_ok=True)
        audio_files = []

        for i, seg in enumerate(script_segments):
            audio_path = os.path.join(audio_dir, f"seg_{i:03d}.mp3")
            if language == "myanmar":
                generate_myanmar_audio(seg["text"], AZURE_KEY, audio_path)
            else:
                wav_path = audio_path.replace(".mp3", ".wav")
                generate_japanese_audio(seg["text"], wav_path)
                # Convert WAV to MP3 for consistency
                os.system(f"ffmpeg -i '{wav_path}' '{audio_path}' -y")
                audio_path = audio_path  # use .mp3
            audio_files.append(audio_path)
            pct = 52 + int(18 * (i + 1) / len(script_segments))
            update_progress(job_id, "processing", pct, "Generating narrator voice")

        update_progress(job_id, "processing", 70, "Voice generation complete")

        # --- Stage 5: Video Composition (70→90%) ---
        update_progress(job_id, "processing", 72, "Composing final video")
        compose_full_video(
            source_video=video_path,
            script=script_segments,
            audio_segments=audio_files,
            narrator_srt=srt_path,
            movie_title=movie_title,
            temp_dir=temp_dir,
            output_path=output_video
        )
        update_progress(job_id, "processing", 88, "Video composition done")

        # --- Stage 6: Thumbnail (90→100%) ---
        update_progress(job_id, "processing", 90, "Generating thumbnail")
        generate_thumbnail(video_path, movie_title, hook_ts, output_thumb)

        # --- Done ---
        output_url = f"/outputs/job_{job_id}/recap.mp4"
        thumb_url = f"/outputs/job_{job_id}/thumbnail.jpg"
        update_progress(
            job_id, "completed", 100, "Done",
            output_url=output_url,
            thumbnail_url=thumb_url,
            duration_seconds=recommended
        )

    except Exception as e:
        error_msg = traceback.format_exc()
        print(f"[Job {job_id}] FAILED: {error_msg}")
        update_progress(job_id, "failed", 0, "Failed", error=str(e))

    finally:
        # Clean up temp files to save disk space
        shutil.rmtree(temp_dir, ignore_errors=True)
```

---

## How to Connect Pipeline to the Express API

The Express API server needs two additions:

### 1. Video Upload Endpoint

Add to `artifacts/api-server/src/routes/jobs.ts`:

```typescript
// POST /api/jobs/upload  — receives video file, saves to disk, returns filename
router.post("/jobs/upload", upload.single("video"), (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No file" }); return; }
  res.json({ filename: req.file.filename });
});
```

Use `multer` for multipart upload handling. Save files to `pipeline/uploads/`.

### 2. Trigger Python Worker

When `POST /api/jobs` creates a job, spawn the Python worker:

```typescript
import { spawn } from "child_process";

// After inserting the job:
spawn("python3", ["pipeline/worker.py"], {
  detached: true,
  stdio: "ignore",
  env: { ...process.env }
}).unref();
```

Or run the worker as a separate always-on process.

### 3. Serve Output Files

Add static file serving in Express:
```typescript
import path from "path";
app.use("/outputs", express.static(path.join(process.cwd(), "pipeline/outputs")));
```

---

## Progress Stage Labels (used in frontend)

The frontend displays these stage strings — use them exactly:

| Stage string | Meaning |
|---|---|
| `"Waiting"` | Job is pending |
| `"Transcribing audio"` | Whisper running |
| `"Extracting key frames"` | FFmpeg frame extraction |
| `"Analyzing scenes"` | Gemini Vision |
| `"Writing recap script"` | Gemini script generation |
| `"Generating narrator voice"` | TTS (Azure/Voicevox) |
| `"Composing final video"` | FFmpeg composition |
| `"Generating thumbnail"` | Pillow thumbnail |
| `"Done"` | Completed |
| `"Failed"` | Error occurred |

---

## Checklist for Next Developer

- [ ] Create `pipeline/` directory with all files above
- [ ] Copy `artifacts/cherry-drama/public/cherry-drama-logo.jpg` → `pipeline/assets/logo.jpg`
- [ ] Install Python requirements: `pip install -r pipeline/requirements.txt`
- [ ] Install FFmpeg: `sudo apt-get install ffmpeg`
- [ ] Add video upload endpoint to Express API (`multer`)
- [ ] Add `/outputs` static file serving to Express API
- [ ] Set env vars or pass API keys from job record to worker
- [ ] (Optional) Install Voicevox Engine locally for Japanese TTS
- [ ] Test each step individually before running full pipeline
- [ ] Run `python3 pipeline/worker.py` as background process
