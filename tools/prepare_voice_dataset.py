import csv
import random
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "dataset" / "raw"
OUT = ROOT / "dataset" / "processed"
WAVS = OUT / "wavs"

SUPPORTED = {
    ".webm", ".wav", ".mp3", ".m4a",
    ".ogg", ".flac", ".aac", ".opus"
}

def run():
    RAW.mkdir(parents=True, exist_ok=True)
    WAVS.mkdir(parents=True, exist_ok=True)

    files = sorted(
        p for p in RAW.iterdir()
        if p.is_file() and p.suffix.lower() in SUPPORTED
    )

    if not files:
        print("NO AUDIO FOUND.")
        print("Copy your recordings into:", RAW)
        print("For every audio file, create a matching .txt transcript.")
        print("Example: sample-001.webm and sample-001.txt")
        return 2

    rows = []
    errors = []

    for index, source in enumerate(files, 1):
        transcript_file = source.with_suffix(".txt")

        if not transcript_file.exists():
            errors.append(f"Missing transcript: {source.name}")
            continue

        transcript = transcript_file.read_text(
            encoding="utf-8"
        ).strip()

        if not transcript:
            errors.append(f"Empty transcript: {source.name}")
            continue

        target = WAVS / f"sample-{index:04d}.wav"

        command = [
            "ffmpeg", "-y", "-v", "error",
            "-i", str(source),
            "-vn",
            "-ac", "1",
            "-ar", "22050",
            "-af", "highpass=f=70,loudnorm=I=-20:TP=-2:LRA=11",
            "-c:a", "pcm_s16le",
            str(target)
        ]

        result = subprocess.run(command)

        if result.returncode != 0 or not target.exists():
            errors.append(f"Conversion failed: {source.name}")
            continue

        if target.stat().st_size < 5000:
            target.unlink(missing_ok=True)
            errors.append(f"Audio too short or empty: {source.name}")
            continue

        rows.append({
            "audio": f"wavs/{target.name}",
            "text": transcript,
            "speaker": "my_voice"
        })

        print(f"OK: {source.name} -> {target.name}")

    if not rows:
        print("No usable audio/transcript pairs found.")
        for error in errors:
            print("WARNING:", error)
        return 1

    random.Random(42).shuffle(rows)

    if len(rows) >= 10:
        val_count = max(1, round(len(rows) * 0.1))
    elif len(rows) >= 2:
        val_count = 1
    else:
        val_count = 0

    validation = rows[:val_count]
    training = rows[val_count:]

    def write_csv(path, data):
        with path.open("w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(
                f, fieldnames=["audio", "text", "speaker"]
            )
            writer.writeheader()
            writer.writerows(data)

    write_csv(OUT / "train.csv", training)
    write_csv(OUT / "validation.csv", validation)

    print("\n===== DATASET REPORT =====")
    print("Audio files found:", len(files))
    print("Usable samples:", len(rows))
    print("Training samples:", len(training))
    print("Validation samples:", len(validation))
    print("Output folder:", OUT)

    for error in errors:
        print("WARNING:", error)

    if len(rows) < 10:
        print("\nRECOMMENDATION: Record at least 10-20 clean samples")
        print("for an initial dataset check. A serious voice model")
        print("usually needs substantially more varied, clean audio.")

    return 0

if __name__ == "__main__":
    sys.exit(run())
