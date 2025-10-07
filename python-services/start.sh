#!/bin/bash
# Startup script for Python TTS/STT Service

set -e

echo "Starting Python TTS/STT Service..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is required but not installed."
    exit 1
fi

# Check Python version
python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "Python 3.8+ is required. Current version: $python_version"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create necessary directories
echo "Creating directories..."
mkdir -p audio_files
mkdir -p models
mkdir -p logs

# Download models (this might take a while on first run)
echo "Downloading models..."
python3 -c "
import whisper
import TTS
print('Downloading Whisper model...')
whisper.load_model('base')
print('Downloading TTS model...')
TTS.api.TTS('tts_models/en/ljspeech/tacotron2-DDC')
print('Models downloaded successfully!')
"

# Start the service
echo "Starting TTS/STT service..."
uvicorn tts_stt_service:app --host 0.0.0.0 --port 8001 --reload


