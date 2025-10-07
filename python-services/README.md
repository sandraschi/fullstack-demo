# Python TTS/STT Service

This is the Python implementation of the TTS/STT service using Coqui TTS and OpenAI Whisper.

## Features

### Text-to-Speech (TTS)
- **Coqui TTS Integration**: High-quality neural text-to-speech synthesis
- **Multiple Voices**: Support for different voice personalities and languages
- **Emotion Control**: Adjust speech parameters based on emotional context
- **Batch Processing**: Process multiple texts simultaneously
- **Audio Customization**: Control speed, pitch, and energy parameters
- **Real-time Synthesis**: Fast audio generation with caching

### Speech-to-Text (STT)
- **Whisper Integration**: State-of-the-art speech recognition
- **Multi-language Support**: Automatic language detection and manual selection
- **Audio Analysis**: Quality analysis and speaker detection
- **Batch Processing**: Process multiple audio files
- **High Accuracy**: Advanced neural network models
- **Format Support**: Multiple audio formats (WAV, MP3, OGG, FLAC)

## Installation

### Prerequisites
- Python 3.8 or higher
- FFmpeg (for audio processing)
- espeak-ng (for TTS)

### System Dependencies (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install -y ffmpeg espeak-ng espeak-ng-data libespeak1 libespeak-dev libsndfile1 libsndfile1-dev
```

### Python Dependencies
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Docker Installation
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t tts-stt-python .
docker run -p 8001:8001 tts-stt-python
```

## Usage

### Starting the Service
```bash
# Using startup script
chmod +x start.sh
./start.sh

# Or manually
uvicorn tts_stt_service:app --host 0.0.0.0 --port 8001 --reload
```

### API Endpoints

#### Health Check
```bash
curl http://localhost:8001/health
```

#### TTS Status
```bash
curl http://localhost:8001/api/tts/status
```

#### Speech Synthesis
```bash
curl -X POST http://localhost:8001/api/tts/synthesize \
  -F "text=Hello, this is a test of the text-to-speech service." \
  -F "voice=coqui-female-en" \
  -F "language=en" \
  -F "speed=1.0" \
  -F "pitch=1.0" \
  -F "energy=1.0" \
  -F "emotion=neutral"
```

#### STT Status
```bash
curl http://localhost:8001/api/stt/status
```

#### Audio Transcription
```bash
curl -X POST http://localhost:8001/api/stt/transcribe \
  -F "audio=@audio_file.wav" \
  -F "language=auto" \
  -F "audioAnalysis=true"
```

#### Voice Management
```bash
# Get all voices
curl http://localhost:8001/api/voices

# Get voice statistics
curl http://localhost:8001/api/voices/stats/summary
```

## Configuration

### Environment Variables
- `TTS_MODEL`: TTS model to use (default: tts_models/en/ljspeech/tacotron2-DDC)
- `WHISPER_MODEL`: Whisper model size (default: base)
- `MAX_FILE_SIZE`: Maximum audio file size in bytes (default: 25MB)
- `LOG_LEVEL`: Logging level (default: INFO)

### Model Configuration
The service supports different model sizes for Whisper:
- `tiny`: Fastest, least accurate
- `base`: Balanced speed and accuracy
- `small`: Better accuracy, slower
- `medium`: High accuracy, slower
- `large`: Best accuracy, slowest

## Advanced Features

### Emotion Control
The TTS service supports emotion-based parameter adjustment:
- `neutral`: Standard parameters
- `happy`: Increased speed, pitch, and energy
- `sad`: Decreased speed, pitch, and energy
- `angry`: Increased speed and energy
- `excited`: High speed, pitch, and energy
- `calm`: Decreased speed and energy
- `confident`: Slightly increased pitch and energy
- `friendly`: Slightly increased energy

### Batch Processing
Both TTS and STT services support batch processing:
- **TTS Batch**: Process multiple texts with staggered requests
- **STT Batch**: Process multiple audio files sequentially
- **Progress Tracking**: Monitor batch processing status
- **Error Handling**: Individual file error handling

### Audio Analysis
The STT service can perform audio quality analysis:
- **Duration**: Audio length in seconds
- **RMS Energy**: Average audio energy
- **Spectral Centroid**: Frequency center of mass
- **Sample Rate**: Audio sample rate
- **Channels**: Number of audio channels

## Performance

### Optimization Tips
1. **Model Caching**: Models are loaded once and cached in memory
2. **Audio Caching**: Generated audio files are cached for reuse
3. **Batch Processing**: Use batch mode for multiple requests
4. **GPU Acceleration**: Enable CUDA for faster processing (if available)

### Resource Requirements
- **CPU**: Multi-core processor recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB for models, additional space for audio files
- **GPU**: Optional, but significantly improves performance

## Troubleshooting

### Common Issues

#### Model Download Failures
```bash
# Clear model cache and retry
rm -rf ~/.local/share/tts
rm -rf ~/.cache/whisper
```

#### Audio Format Issues
```bash
# Install additional audio codecs
sudo apt-get install -y libavcodec-extra
```

#### Memory Issues
- Reduce batch size
- Use smaller Whisper models
- Enable audio compression

#### Performance Issues
- Enable GPU acceleration
- Use SSD storage
- Increase system memory
- Optimize audio parameters

### Logging
Logs are written to stdout and can be redirected:
```bash
uvicorn tts_stt_service:app --host 0.0.0.0 --port 8001 > logs/service.log 2>&1
```

## Development

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest tests/
```

### Code Quality
```bash
# Format code
black tts_stt_service.py

# Lint code
flake8 tts_stt_service.py

# Type checking
mypy tts_stt_service.py
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs
3. Open an issue on GitHub
4. Contact the development team


