"""Provider layer.

Production: OpenAI-compatible HTTP APIs (base URL + key + model from env).
Test mode (RECAPMAKER_TEST_AGENT=1, no key): the call writes a
`<name>_request.json` into the job's stages dir and waits for the test agent
(a human/operator acting as the model) to drop `<name>_agent.json` with the
answer. This keeps the production code path intact while allowing a keyless
test run. Every agent-performed stage is flagged in the saved stage JSON.

All HTTP calls retry up to 3 times with exponential backoff.
"""
import base64
import json
import subprocess
import time
from pathlib import Path

import httpx

from . import config, store

MAX_RETRIES = 3


def _retry(fn, what: str):
    last = None
    for attempt in range(MAX_RETRIES):
        try:
            return fn()
        except Exception as e:  # noqa: BLE001 - retried, then raised
            last = e
            if attempt < MAX_RETRIES - 1:
                time.sleep(2 ** attempt)
    raise RuntimeError(f"{what} failed after {MAX_RETRIES} attempts: {last}")


class LLMProvider:
    """OpenAI-compatible chat-completions provider (text + optional images)."""

    def __init__(self, cfg: dict):
        self.key = cfg["key"]
        self.url = cfg["url"]
        self.model = cfg["model"]

    @property
    def configured(self) -> bool:
        return bool(self.key)

    def chat(self, messages: list, job_id: str, name: str,
             expect_json: bool = False, images: list[Path] = None) -> dict:
        """messages: OpenAI chat messages. Returns parsed JSON (or {'text': ...}).

        In test-agent mode with no key, waits for the agent's answer file.
        """
        if self.configured:
            return self._chat_http(messages, expect_json)
        if config.TEST_AGENT:
            return self._chat_agent(messages, job_id, name, images)
        raise RuntimeError(
            f"No API key for {name} (set the *_API_KEY env var) and "
            "RECAPMAKER_TEST_AGENT is not enabled.")

    def _chat_http(self, messages: list, expect_json: bool) -> dict:
        def call():
            with httpx.Client(timeout=300) as c:
                r = c.post(
                    f"{self.url}/chat/completions",
                    headers={"Authorization": f"Bearer {self.key}"},
                    json={"model": self.model, "messages": messages,
                          "temperature": 0.3,
                          **({"response_format": {"type": "json_object"}}
                             if expect_json else {})},
                )
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"]

        last_err = None
        for attempt in range(2):  # +1 retry on invalid JSON, per spec
            text = _retry(call, "LLM chat call")
            if not expect_json:
                return {"text": text}
            try:
                return json.loads(text)
            except json.JSONDecodeError as e:
                last_err = e
                messages = messages + [{"role": "user",
                                        "content": "Your last reply was not valid JSON. "
                                                   "Reply with valid JSON only."}]
        raise RuntimeError(f"LLM returned invalid JSON twice: {last_err}")

    def _chat_agent(self, messages: list, job_id: str, name: str,
                    images: list[Path] = None) -> dict:
        """Write the request; block until <name>_agent.json appears."""
        req_path = store.stage_path(job_id, f"{name}_request")
        ans_path = store.stage_path(job_id, f"{name}_agent")
        payload = {
            "stage": name,
            "model_wanted": self.model,
            "messages": messages,
            "images": [str(p) for p in (images or [])],
            "note": "TEST MODE: no API key. An operator acting as the model "
                    f"should write the answer JSON to {ans_path.name} "
                    "(same directory) and the pipeline will continue.",
        }
        req_path.with_suffix(".json").write_text(
            json.dumps(payload, indent=2, ensure_ascii=False))
        deadline = time.time() + 1800  # 30 min for the operator
        while time.time() < deadline:
            if ans_path.with_suffix(".json").exists():
                data = json.loads(ans_path.with_suffix(".json").read_text())
                data["_agent_performed"] = True
                return data
            time.sleep(5)
        raise RuntimeError(f"Timed out waiting for agent input for stage {name}")


def vision_message(text: str, image_paths: list[Path]) -> dict:
    """One chat message with text + base64 JPEGs (never combined into one image)."""
    content = [{"type": "text", "text": text}]
    for p in image_paths:
        b64 = base64.b64encode(p.read_bytes()).decode()
        content.append({"type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{b64}"}})
    return {"role": "user", "content": content}


def tts_line(text: str, language: str, out_path: Path) -> Path:
    """Test-mode TTS: local /opt/hatch/bin/tts CLI (no key needed).

    Production: if TTS_API_KEY is set, the OpenAI-compatible TTS endpoint
    is used instead (see tts_line_api)."""
    if config.TTS["key"]:
        return tts_line_api(text, language, out_path)
    cmd = ["/opt/hatch/bin/tts", "speak",
           "--language", language, "--output", str(out_path), "--text-stdin"]

    def run():
        p = subprocess.run(cmd, input=text.encode(), capture_output=True,
                           timeout=180)
        if p.returncode != 0 or not out_path.exists():
            raise RuntimeError(
                f"tts CLI failed (rc={p.returncode}): "
                f"{p.stderr.decode(errors='ignore')[:500]}")
        return out_path

    return _retry(run, "TTS synthesis")


def tts_line_api(text: str, language: str, out_path: Path) -> Path:
    def call():
        with httpx.Client(timeout=180) as c:
            r = c.post(
                f"{config.TTS['url']}/audio/speech",
                headers={"Authorization": f"Bearer {config.TTS['key']}"},
                json={"model": config.TTS["model"],
                      "input": text,
                      "voice": config.env("TTS_VOICE", "alloy"),
                      "response_format": "mp3"},
            )
        r.raise_for_status()
        out_path.write_bytes(r.content)
        return out_path

    return _retry(call, "TTS API call")
