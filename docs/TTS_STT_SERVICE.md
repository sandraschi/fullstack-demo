# TTS/STT Service - Quick Reference

**Port:** 3002 | **Tech:** Python/FastAPI | **Purpose:** Text-to-Speech & Speech-to-Text

## Features

### Text-to-Speech (TTS)
- Multiple voices (male/female, accents)
- Speed/pitch control
- Format: WAV, MP3
- Languages: EN, DE, FR, ES, JA

### Speech-to-Text (STT)
- Audio upload → text transcription
- Support: WAV, MP3, OGG
- Timestamp support (optional)
- Multiple languages

## Endpoints

```typescript
// TTS
POST /api/tts
{
  "text": "Hello world",
  "voice": "en-us-female",
  "speed": 1.0,
  "pitch": 1.0,
  "format": "wav"
}
Response: Audio file (binary)

// STT
POST /api/stt
Content-Type: multipart/form-data
file: audio.wav
language: "en"

Response: { "text": "transcribed text", "confidence": 0.95 }

// Available voices
GET /api/tts/voices
Response: [
  { "id": "en-us-female", "name": "US Female", "language": "en" },
  { "id": "en-gb-male", "name": "UK Male", "language": "en" },
  ...
]

// Health
GET /api/health
```

## Voice Options

### English
- `en-us-female` - US Female (default)
- `en-us-male` - US Male
- `en-gb-female` - UK Female
- `en-gb-male` - UK Male

### Other Languages
- `de-de-female` - German Female
- `fr-fr-female` - French Female
- `es-es-female` - Spanish Female
- `ja-jp-female` - Japanese Female

## TTS Providers

### Local (Recommended for MVP)
**Coqui TTS:**
- Open source, runs locally
- Good quality voices
- Fast generation
- `pip install TTS`

**piper-tts:**
- Lightweight, very fast
- Lower quality but practical
- `pip install piper-tts`

### Cloud (Optional)
**ElevenLabs:**
- Best quality voices
- Natural prosody
- $5/month for 30k chars

**Google Cloud TTS:**
- Wide language support
- WaveNet voices
- Pay per use

## STT Providers

### Local (Recommended)
**Whisper:**
- State-of-the-art accuracy
- Multiple model sizes
- `pip install openai-whisper`

**faster-whisper:**
- 4x faster than Whisper
- Same accuracy
- `pip install faster-whisper`

### Cloud
**Google Speech-to-Text:**
- Very accurate
- Real-time streaming
- Pay per use

## Configuration

```env
PORT=3002
TTS_PROVIDER=local          # or elevenlabs, google
STT_PROVIDER=local          # or google, assemblyai
WHISPER_MODEL=base          # tiny, base, small, medium, large
TTS_MODEL=tts_models/en/ljspeech/tacotron2-DDC
MAX_AUDIO_SIZE=10485760     # 10MB
CACHE_ENABLED=true
```

## Whisper Model Sizes

| Model | Size | Speed | Accuracy | Use Case |
|-------|------|-------|----------|----------|
| tiny | 39MB | Very fast | Good | Quick transcription |
| base | 74MB | Fast | Better | MVP default |
| small | 244MB | Medium | Great | Production |
| medium | 769MB | Slow | Excellent | High accuracy |
| large | 1550MB | Very slow | Best | Professional |

## Performance Targets

**TTS:**
- 100 words → < 2s generation
- Real-time factor: 2x (generate 1min audio in 30s)

**STT:**
- 30s audio → < 5s transcription
- 5min audio → < 30s transcription

## Implementation Example

```python
# TTS endpoint (< 150 lines)
@app.post("/api/tts")
async def text_to_speech(request: TTSRequest):
    tts = get_tts_provider()  # Coqui or ElevenLabs
    audio = await tts.synthesize(
        text=request.text,
        voice=request.voice,
        speed=request.speed
    )
    return Response(content=audio, media_type="audio/wav")

# STT endpoint (< 150 lines)
@app.post("/api/stt")
async def speech_to_text(file: UploadFile):
    stt = get_stt_provider()  # Whisper or Google
    audio = await file.read()
    result = await stt.transcribe(audio)
    return {"text": result.text, "confidence": result.confidence}
```

## File Size Limits

- Audio upload: 10MB max
- TTS text: 5000 chars max
- Supported formats: WAV (recommended), MP3, OGG

## Demo UI (Optional)

Simple Gradio interface:
```python
with gr.Blocks() as demo:
    with gr.Tab("Text-to-Speech"):
        text_input = gr.Textbox(label="Text", lines=5)
        voice_select = gr.Dropdown(voices, label="Voice")
        tts_btn = gr.Button("Generate Speech")
        audio_output = gr.Audio(label="Result")
    
    with gr.Tab("Speech-to-Text"):
        audio_input = gr.Audio(label="Upload Audio", type="filepath")
        stt_btn = gr.Button("Transcribe")
        text_output = gr.Textbox(label="Transcription")
```

## Next: See TTS_STT_IMPL.md for detailed implementation
