AK TEXT TO VOICE - PERSONAL VOICE DATASET

1. Put your own voice recordings inside dataset/raw/
2. Give each recording a matching transcript text file.

Example:
dataset/raw/sample-001.webm
dataset/raw/sample-001.txt

The TXT file must contain exactly the words spoken in the audio.
Use UTF-8 for Hindi and other languages.

3. Run:
python tools/prepare_voice_dataset.py

Output:
dataset/processed/wavs/
dataset/processed/train.csv
dataset/processed/validation.csv

Do not upload personal voice recordings publicly.
Only use voices you own or have permission to use.
