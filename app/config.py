"""Config: everything comes from environment variables, never hardcoded keys."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def _load_dotenv() -> None:
    env_path = BASE_DIR / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip())


_load_dotenv()


def env(name: str, default: str = "") -> str:
    return os.environ.get(name, default)


PORT = int(env("RECAPMAKER_PORT", "3150"))
DATA_DIR = Path(env("RECAPMAKER_DATA_DIR", "data"))
if not DATA_DIR.is_absolute():
    DATA_DIR = BASE_DIR / DATA_DIR
TEST_AGENT = env("RECAPMAKER_TEST_AGENT", "0") == "1"

# Provider settings: specific key/url/model, falling back to OPENAI_API_KEY.
OPENAI_API_KEY = env("OPENAI_API_KEY", "")


def provider_cfg(prefix: str, default_model: str) -> dict:
    key = env(f"{prefix}_API_KEY", "") or OPENAI_API_KEY
    url = env(f"{prefix}_API_URL", "https://api.openai.com/v1").rstrip("/")
    model = env(f"{prefix}_MODEL", default_model)
    return {"key": key, "url": url, "model": model}


TRANSCRIBE = provider_cfg("TRANSCRIBE", "whisper-1")
VISION = provider_cfg("VISION_LLM", "gpt-4o-mini")
SCRIPT = provider_cfg("SCRIPT_LLM", "gpt-4o-mini")
TTS = provider_cfg("TTS", "tts-1")
WHISPER_MODEL = env("WHISPER_MODEL", "tiny")

PRICE_IN = float(env("PRICE_INPUT_PER_1K_TOKENS", "0.00015"))
PRICE_OUT = float(env("PRICE_OUTPUT_PER_1K_TOKENS", "0.0006"))
PRICE_TTS = float(env("PRICE_TTS_PER_1K_CHARS", "0.015"))

MAX_UPLOAD_MB = 500
MAX_DURATION_SEC = 300  # 5 minutes
JOB_TTL_HOURS = 24
