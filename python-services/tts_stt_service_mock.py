# Simplified Python TTS/STT Service for Testing
# This version provides mock responses without requiring heavy ML dependencies

import os
import asyncio
import logging
from typing import Dict, List, Optional
from datetime import datetime
import json
import tempfile

# Web framework
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="TTS/STT Python Service (Mock)",
    description="Mock Python service for Text-to-Speech and Speech-to-Text testing",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
CONFIG = {
    "audio_dir": "audio_files",
    "max_file_size": 25 * 1024 * 1024,  # 25MB
    "supported_formats": ["wav", "mp3", "ogg", "flac"],
    "sample_rate": 22050,
}

# Voice configurations
VOICE_CONFIGS = {
    "coqui-female-en": {
        "id": "coqui-female-en",
        "name": "Sarah",
        "language": "en",
        "gender": "female",
        "provider": "coqui",
        "description": "Natural female English voice with clear pronunciation",
        "isDefault": True,
        "isPremium": False,
        "supportedFeatures": {
            "speed": True,
            "pitch": True,
            "energy": True,
            "emotion": True
        },
        "metadata": {
            "age": "adult",
            "accent": "american",
            "style": "neutral",
            "quality": "high"
        }
    },
    "coqui-male-en": {
        "id": "coqui-male-en",
        "name": "David",
        "language": "en",
        "gender": "male",
        "provider": "coqui",
        "description": "Natural male English voice with warm tone",
        "isDefault": True,
        "isPremium": False,
        "supportedFeatures": {
            "speed": True,
            "pitch": True,
            "energy": True,
            "emotion": True
        },
        "metadata": {
            "age": "adult",
            "accent": "american",
            "style": "neutral",
            "quality": "high"
        }
    }
}

# Emotion mappings for TTS
EMOTION_MAPPINGS = {
    "neutral": {"speed": 1.0, "pitch": 1.0, "energy": 1.0},
    "happy": {"speed": 1.1, "pitch": 1.2, "energy": 1.3},
    "sad": {"speed": 0.9, "pitch": 0.8, "energy": 0.7},
    "angry": {"speed": 1.2, "pitch": 1.1, "energy": 1.4},
    "excited": {"speed": 1.3, "pitch": 1.3, "energy": 1.5},
    "calm": {"speed": 0.8, "pitch": 0.9, "energy": 0.8},
    "confident": {"speed": 1.0, "pitch": 1.1, "energy": 1.2},
    "friendly": {"speed": 1.0, "pitch": 1.0, "energy": 1.1},
}

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        # Create audio directory
        os.makedirs(CONFIG["audio_dir"], exist_ok=True)
        logger.info("TTS/STT mock service started successfully")
    except Exception as e:
        logger.error(f"Failed to start TTS/STT service: {e}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "tts": True,
            "stt": True
        }
    }

@app.get("/api/tts/status")
async def get_tts_status():
    """Get TTS service status"""
    return {
        "status": "online",
        "voices": list(VOICE_CONFIGS.values()),
        "languages": [
            {"code": "en", "name": "English", "voices": 2},
            {"code": "es", "name": "Spanish", "voices": 0},
            {"code": "fr", "name": "French", "voices": 0},
        ],
        "supportedFormats": CONFIG["supported_formats"],
        "maxTextLength": 5000
    }

class SynthesisRequest(BaseModel):
    text: str
    voice: str = "coqui-female-en"
    language: str = "en"
    speed: float = 1.0
    pitch: float = 1.0
    energy: float = 1.0
    emotion: str = "neutral"
    batchMode: bool = False

@app.post("/api/tts/synthesize")
async def synthesize_speech(request: SynthesisRequest):
    """Synthesize speech from text (mock implementation)"""
    try:
        # Apply emotion-based parameter adjustments
        emotion_params = EMOTION_MAPPINGS.get(request.emotion, EMOTION_MAPPINGS["neutral"])
        final_speed = request.speed * emotion_params["speed"]
        final_pitch = request.pitch * emotion_params["pitch"]
        final_energy = request.energy * emotion_params["energy"]
        
        # Generate mock audio file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        audio_filename = f"synthesis_{timestamp}.wav"
        audio_path = os.path.join(CONFIG["audio_dir"], audio_filename)
        
        # Create a mock audio file (empty WAV file)
        with open(audio_path, "wb") as f:
            # Write minimal WAV header
            f.write(b'RIFF')
            f.write((36).to_bytes(4, 'little'))
            f.write(b'WAVE')
            f.write(b'fmt ')
            f.write((16).to_bytes(4, 'little'))
            f.write((1).to_bytes(2, 'little'))  # PCM
            f.write((1).to_bytes(2, 'little'))  # Mono
            f.write((22050).to_bytes(4, 'little'))  # Sample rate
            f.write((44100).to_bytes(4, 'little'))  # Byte rate
            f.write((2).to_bytes(2, 'little'))  # Block align
            f.write((16).to_bytes(2, 'little'))  # Bits per sample
            f.write(b'data')
            f.write((0).to_bytes(4, 'little'))  # Data size
        
        # Calculate mock metrics
        synthesis_time = len(request.text) * 50 + 200  # Mock calculation
        audio_size = os.path.getsize(audio_path)
        
        result = {
            "audioUrl": f"/audio/{audio_filename}",
            "metadata": {
                "text": request.text,
                "voice": request.voice,
                "language": request.language,
                "speed": final_speed,
                "pitch": final_pitch,
                "energy": final_energy,
                "emotion": request.emotion,
                "batchMode": request.batchMode,
                "provider": "coqui",
                "synthesisTime": synthesis_time,
                "audioSize": audio_size,
                "sampleRate": CONFIG["sample_rate"],
                "format": "wav"
            }
        }
        
        return {"success": True, "data": result}
        
    except Exception as e:
        logger.error(f"TTS synthesis failed: {e}")
        return {"success": False, "error": {"code": "TTS_SYNTHESIS_ERROR", "message": str(e)}}

@app.get("/api/stt/status")
async def get_stt_status():
    """Get STT service status"""
    return {
        "status": "online",
        "models": [
            {"id": "whisper-base", "name": "Whisper Base", "description": "Base Whisper model"},
            {"id": "whisper-small", "name": "Whisper Small", "description": "Small Whisper model"},
            {"id": "whisper-medium", "name": "Whisper Medium", "description": "Medium Whisper model"},
        ],
        "supportedLanguages": ["en", "es", "fr", "de", "it", "pt", "ru", "ja", "ko", "zh"],
        "maxFileSize": CONFIG["max_file_size"]
    }

@app.post("/api/stt/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: str = Form("auto"),
    batchMode: bool = Form(False),
    audioAnalysis: bool = Form(False)
):
    """Transcribe audio file to text (mock implementation)"""
    try:
        # Validate file
        if audio.size > CONFIG["max_file_size"]:
            raise HTTPException(status_code=413, detail="File too large")
        
        # Generate mock transcription based on filename
        filename = audio.filename or "unknown"
        mock_text = f"This is a mock transcription of the audio file '{filename}'. The actual transcription would be generated by Whisper STT."
        
        # Mock confidence based on file size
        confidence = min(0.95, 0.7 + (audio.size / CONFIG["max_file_size"]) * 0.25)
        
        # Mock segments
        segments = [
            {"start": 0, "end": 2.5, "text": "This is a mock transcription", "confidence": confidence},
            {"start": 2.5, "end": 5.0, "text": f"of the audio file '{filename}'", "confidence": confidence - 0.02},
            {"start": 5.0, "end": 8.0, "text": "The actual transcription would be generated by Whisper STT.", "confidence": confidence - 0.05},
        ]
        
        # Mock audio analysis
        audio_metadata = {}
        if audioAnalysis:
            audio_metadata = {
                "duration": 8.0,
                "rmsEnergy": 0.5,
                "spectralCentroid": 1000.0,
                "sampleRate": 22050,
                "channels": 1
            }
        
        result = {
            "text": mock_text,
            "language": language if language != "auto" else "en",
            "confidence": confidence,
            "segments": segments,
            "metadata": {
                "model": "whisper-base",
                "provider": "whisper",
                "transcriptionTime": 1500,
                "audioDuration": 8000,
                "responseFormat": "json",
                "audioAnalysis": audio_metadata
            }
        }
        
        return {"success": True, "data": result}
        
    except Exception as e:
        logger.error(f"STT transcription failed: {e}")
        return {"success": False, "error": {"code": "STT_TRANSCRIPTION_ERROR", "message": str(e)}}

@app.post("/api/stt/transcribe-url")
async def transcribe_audio_url(
    audioUrl: str = Form(...),
    language: str = Form("auto")
):
    """Transcribe audio from URL (mock implementation)"""
    try:
        mock_text = f"This is a mock transcription of the audio from URL: {audioUrl}. The actual transcription would be generated by Whisper STT."
        
        result = {
            "text": mock_text,
            "language": language if language != "auto" else "en",
            "confidence": 0.92,
            "segments": [
                {"start": 0, "end": 3, "text": "This is a mock transcription", "confidence": 0.94},
                {"start": 3, "end": 6, "text": "of the audio from URL", "confidence": 0.91},
                {"start": 6, "end": 9, "text": "The actual transcription would be generated by Whisper STT.", "confidence": 0.89},
            ],
            "metadata": {
                "model": "whisper-base",
                "provider": "whisper",
                "transcriptionTime": 2000,
                "audioDuration": 9000,
                "responseFormat": "json"
            }
        }
        
        return {"success": True, "data": result}
        
    except Exception as e:
        return {"success": False, "error": {"code": "STT_URL_TRANSCRIPTION_ERROR", "message": str(e)}}

@app.get("/api/voices")
async def get_voices():
    """Get available voices"""
    return {"success": True, "data": list(VOICE_CONFIGS.values())}

@app.get("/api/voices/stats/summary")
async def get_voice_stats():
    """Get voice statistics"""
    voices = list(VOICE_CONFIGS.values())
    return {
        "success": True,
        "data": {
            "total": len(voices),
            "byLanguage": {"en": len([v for v in voices if v["language"] == "en"])},
            "byGender": {
                "female": len([v for v in voices if v["gender"] == "female"]),
                "male": len([v for v in voices if v["gender"] == "male"])
            },
            "byProvider": {"coqui": len(voices)},
            "premium": len([v for v in voices if v["isPremium"]]),
            "default": len([v for v in voices if v["isDefault"]])
        }
    }

@app.get("/audio/{filename}")
async def serve_audio(filename: str):
    """Serve generated audio files"""
    file_path = os.path.join(CONFIG["audio_dir"], filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="audio/wav")
    else:
        raise HTTPException(status_code=404, detail="Audio file not found")

if __name__ == "__main__":
    uvicorn.run(
        "tts_stt_service_mock:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
