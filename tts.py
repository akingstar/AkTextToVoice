import argparse
import asyncio
from pathlib import Path
import edge_tts

VOICES = {
    "hindi-female": "hi-IN-SwaraNeural",
    "hindi-male": "hi-IN-MadhurNeural",
    "english-female": "en-US-AriaNeural",
    "english-male": "en-US-GuyNeural",
    "indian-english-female": "en-IN-NeerjaNeural",
    "indian-english-male": "en-IN-PrabhatNeural",
}

async def generate(text, voice, output, rate):
    output = Path(output)
    output.parent.mkdir(parents=True, exist_ok=True)

    communicate = edge_tts.Communicate(
        text=text,
        voice=voice,
        rate=rate
    )
    await communicate.save(str(output))

    if not output.exists() or output.stat().st_size < 1000:
        raise RuntimeError("Audio generation failed or produced an empty file.")

    print("SUCCESS: Audio generated")
    print("Voice:", voice)
    print("File:", output.resolve())
    print("Size:", output.stat().st_size, "bytes")

def main():
    parser = argparse.ArgumentParser(description="AkTextToVoice TTS")
    parser.add_argument("--text", required=True, help="Text to speak")
    parser.add_argument("--voice", default="hindi-female",
                        choices=list(VOICES.keys()) + list(VOICES.values()))
    parser.add_argument("--output", default="audio/ak-tts.mp3")
    parser.add_argument("--rate", default="+0%")
    args = parser.parse_args()

    voice = VOICES.get(args.voice, args.voice)
    asyncio.run(generate(args.text, voice, args.output, args.rate))

if __name__ == "__main__":
    main()
