"""Job store: one directory per job, job.json + stages/*.json on disk.

A failed job can resume from the failed stage because every stage's output
is saved as JSON before the next stage starts.
"""
import json
import shutil
import threading
import time
import uuid
from pathlib import Path

from . import config

STAGES = [
    ("upload", "Upload"),
    ("transcribe", "Transcribe"),
    ("shots", "Detect shots"),
    ("describe", "Describe shots"),
    ("script", "Write script"),  # covers outline (D) + narration (E) + verify (F)
    ("voiceover", "Generate voiceover"),
    ("render", "Render"),
]

_lock = threading.Lock()


def jobs_dir() -> Path:
    d = config.DATA_DIR / "jobs"
    d.mkdir(parents=True, exist_ok=True)
    return d


def job_dir(job_id: str) -> Path:
    return jobs_dir() / job_id


def new_job(options: dict) -> dict:
    job_id = uuid.uuid4().hex[:12]
    jd = job_dir(job_id)
    (jd / "stages").mkdir(parents=True)
    (jd / "keyframes").mkdir(parents=True)
    (jd / "vo").mkdir(parents=True)
    job = {
        "id": job_id,
        "created_at": time.time(),
        "status": "queued",  # queued | running | done | failed
        "options": options,
        "stages": {k: {"status": "waiting", "progress": 0, "error": None, "detail": ""}
                   for k, _ in STAGES},
        "queue_position": None,
        "result_path": None,
        "error": None,
    }
    job["stages"]["upload"]["status"] = "waiting"
    save(job)
    return job


def load(job_id: str) -> dict | None:
    p = job_dir(job_id) / "job.json"
    if not p.exists():
        return None
    return json.loads(p.read_text())


def save(job: dict) -> None:
    with _lock:
        p = job_dir(job["id"]) / "job.json"
        p.write_text(json.dumps(job, indent=2))


def set_stage(job: dict, stage: str, status: str, progress: int = None,
              error: str = None, detail: str = None) -> None:
    s = job["stages"][stage]
    s["status"] = status
    if progress is not None:
        s["progress"] = progress
    if error is not None:
        s["error"] = error
    if detail is not None:
        s["detail"] = detail
    save(job)


def stage_path(job_id: str, name: str) -> Path:
    return job_dir(job_id) / "stages" / f"{name}.json"


def save_stage(job_id: str, name: str, data) -> Path:
    p = stage_path(job_id, name)
    p.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    return p


def load_stage(job_id: str, name: str):
    p = stage_path(job_id, name)
    if not p.exists():
        return None
    return json.loads(p.read_text())


def delete_job(job_id: str) -> None:
    shutil.rmtree(job_dir(job_id), ignore_errors=True)


def all_jobs() -> list[dict]:
    out = []
    for d in sorted(jobs_dir().iterdir(), reverse=True):
        if d.is_dir():
            j = load(d.name)
            if j:
                out.append(j)
    return out
