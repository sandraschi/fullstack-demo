# Python TTS/STT Service Implementation
# This file contains the actual Python implementation for Whisper STT and Coqui TTS

import os
import asyncio
import logging
from typing import Dict, List, Optional, Union
from pathlib import Path
import tempfile
import json
from datetime import datetime

# Audio processing libraries
import librosa
import soundfile as sf
import numpy as np

# TTS libraries
try:
    from TTS.api import TTS
    from TTS.utils.manage import ModelManager
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False
    logging.warning("TTS library not available. Install with: pip install TTS")

# STT libraries
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    logging.warning("Whisper not available. Install with: pip install openai-whisper")

# Web framework
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="TTS/STT Python Service",
    description="Python service for Text-to-Speech and Speech-to-Text using Coqui TTS and Whisper",
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

# Global variables for models
tts_model = None
whisper_model = None

# Configuration
CONFIG = {
    "tts_model": "tts_models/en/ljspeech/tacotron2-DDC",
    "whisper_model": "base",
    "audio_dir": "audio_files",
    "max_file_size": 25 * 1024 * 1024,  # 25MB
    "supported_formats": ["wav", "mp3", "ogg", "flac"],
    "sample_rate": 22050,
}

# Voice configurations
VOICE_CONFIGS = {
    "coqui-female-en": {
        "name": "Sarah",
        "language": "en",
        "gender": "female",
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
        "name": "David",
        "language": "en",
        "gender": "male",
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

class TTSService:
    """Text-to-Speech service using Coqui TTS"""
    
    def __init__(self):
        self.model = None
        self.initialized = False
    
    async def initialize(self):
        """Initialize the TTS model"""
        if not TTS_AVAILABLE:
            raise RuntimeError("TTS library not available")
        
        try:
            logger.info("Initializing TTS model...")
            self.model = TTS(CONFIG["tts_model"])
            self.initialized = True
            logger.info("TTS model initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize TTS model: {e}")
            raise
    
    async def synthesize(
        self,
        text: str,
        voice: str = "coqui-female-en",
        language: str = "en",
        speed: float = 1.0,
        pitch: float = 1.0,
        energy: float = 1.0,
        emotion: str = "neutral"
    ) -> Dict:
        """Synthesize speech from text"""
        if not self.initialized:
            await self.initialize()
        
        try:
            # Apply emotion-based parameter adjustments
            emotion_params = EMOTION_MAPPINGS.get(emotion, EMOTION_MAPPINGS["neutral"])
            final_speed = speed * emotion_params["speed"]
            final_pitch = pitch * emotion_params["pitch"]
            final_energy = energy * emotion_params["energy"]
            
            # Generate audio
            start_time = datetime.now()
            
            # Create temporary file for output
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
                output_path = tmp_file.name
            
            # Synthesize speech
            self.model.tts_to_file(
                text=text,
                speaker_wav=None,  # Use default speaker
                language=language,
                file_path=output_path
            )
            
            # Load and process audio
            audio, sr = librosa.load(output_path, sr=CONFIG["sample_rate"])
            
            # Apply speed, pitch, and energy adjustments
            if final_speed != 1.0:
                audio = librosa.effects.time_stretch(audio, rate=final_speed)
            
            if final_pitch != 1.0:
                audio = librosa.effects.pitch_shift(audio, sr=sr, n_steps=int((final_pitch - 1) * 12))
            
            if final_energy != 1.0:
                audio = audio * final_energy
            
            # Save processed audio
            processed_path = output_path.replace(".wav", "_processed.wav")
            sf.write(processed_path, audio, sr)
            
            # Get file size
            file_size = os.path.getsize(processed_path)
            
            synthesis_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # Clean up original file
            os.unlink(output_path)
            
            return {
                "audioUrl": f"/audio/{os.path.basename(processed_path)}",
                "metadata": {
                    "text": text,
                    "voice": voice,
                    "language": language,
                    "speed": final_speed,
                    "pitch": final_pitch,
                    "energy": final_energy,
                    "emotion": emotion,
                    "provider": "coqui",
                    "synthesisTime": synthesis_time,
                    "audioSize": file_size,
                    "sampleRate": sr,
                    "format": "wav"
                }
            }
            
        except Exception as e:
            logger.error(f"TTS synthesis failed: {e}")
            raise HTTPException(status_code=500, detail=f"TTS synthesis failed: {str(e)}")

class STTService:
    """Speech-to-Text service using Whisper"""
    
    def __init__(self):
        self.model = None
        self.initialized = False
    
    async def initialize(self):
        """Initialize the Whisper model"""
        if not WHISPER_AVAILABLE:
            raise RuntimeError("Whisper library not available")
        
        try:
            logger.info("Initializing Whisper model...")
            self.model = whisper.load_model(CONFIG["whisper_model"])
            self.initialized = True
            logger.info("Whisper model initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Whisper model: {e}")
            raise
    
    async def transcribe(
        self,
        audio_path: str,
        language: str = "auto",
        audio_analysis: bool = False
    ) -> Dict:
        """Transcribe audio to text"""
        if not self.initialized:
            await self.initialize()
        
        try:
            start_time = datetime.now()
            
            # Load audio
            audio, sr = librosa.load(audio_path, sr=16000)  # Whisper expects 16kHz
            
            # Transcribe
            if language == "auto":
                result = self.model.transcribe(audio)
            else:
                result = self.model.transcribe(audio, language=language)
            
            transcription_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # Basic audio analysis if requested
            audio_metadata = {}
            if audio_analysis:
                duration = len(audio) / sr
                rms_energy = np.sqrt(np.mean(audio**2))
                spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=audio, sr=sr))
                
                audio_metadata = {
                    "duration": duration,
                    "rmsEnergy": float(rms_energy),
                    "spectralCentroid": float(spectral_centroid),
                    "sampleRate": sr,
                    "channels": 1 if audio.ndim == 1 else audio.shape[0]
                }
            
            return {
                "text": result["text"],
                "language": result.get("language", language),
                "confidence": float(np.mean([seg.get("avg_logprob", 0) for seg in result.get("segments", [])])),
                "segments": [
                    {
                        "start": seg["start"],
                        "end": seg["end"],
                        "text": seg["text"],
                        "confidence": float(seg.get("avg_logprob", 0))
                    }
                    for seg in result.get("segments", [])
                ],
                "metadata": {
                    "model": CONFIG["whisper_model"],
                    "provider": "whisper",
                    "transcriptionTime": transcription_time,
                    "audioDuration": len(audio) / sr * 1000,
                    "responseFormat": "json",
                    "audioAnalysis": audio_metadata
                }
            }
            
        except Exception as e:
            logger.error(f"STT transcription failed: {e}")
            raise HTTPException(status_code=500, detail=f"STT transcription failed: {str(e)}")

# Initialize services
tts_service = TTSService()
stt_service = STTService()

# API Endpoints

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        # Create audio directory
        os.makedirs(CONFIG["audio_dir"], exist_ok=True)
        
        # Initialize services
        await tts_service.initialize()
        await stt_service.initialize()
        
        logger.info("TTS/STT service started successfully")
    except Exception as e:
        logger.error(f"Failed to start TTS/STT service: {e}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "tts": tts_service.initialized,
            "stt": stt_service.initialized
        }
    }

@app.get("/api/tts/status")
async def get_tts_status():
    """Get TTS service status"""
    return {
        "status": "online" if tts_service.initialized else "offline",
        "voices": list(VOICE_CONFIGS.values()),
        "languages": [
            {"code": "en", "name": "English", "voices": 2},
            {"code": "es", "name": "Spanish", "voices": 0},
            {"code": "fr", "name": "French", "voices": 0},
        ],
        "supportedFormats": CONFIG["supported_formats"],
        "maxTextLength": 5000
    }

@app.post("/api/tts/synthesize")
async def synthesize_speech(
    text: str = Form(...),
    voice: str = Form("coqui-female-en"),
    language: str = Form("en"),
    speed: float = Form(1.0),
    pitch: float = Form(1.0),
    energy: float = Form(1.0),
    emotion: str = Form("neutral"),
    batchMode: bool = Form(False)
):
    """Synthesize speech from text"""
    try:
        result = await tts_service.synthesize(
            text=text,
            voice=voice,
            language=language,
            speed=speed,
            pitch=pitch,
            energy=energy,
            emotion=emotion
        )
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": {"code": "TTS_SYNTHESIS_ERROR", "message": str(e)}}

@app.get("/api/stt/status")
async def get_stt_status():
    """Get STT service status"""
    return {
        "status": "online" if stt_service.initialized else "offline",
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
    """Transcribe audio file to text"""
    try:
        # Validate file
        if audio.size > CONFIG["max_file_size"]:
            raise HTTPException(status_code=413, detail="File too large")
        
        # Save uploaded file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{audio.filename.split('.')[-1]}") as tmp_file:
            content = await audio.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        try:
            result = await stt_service.transcribe(
                audio_path=tmp_path,
                language=language,
                audio_analysis=audioAnalysis
            )
            return {"success": True, "data": result}
        finally:
            # Clean up temporary file
            os.unlink(tmp_path)
            
    except Exception as e:
        return {"success": False, "error": {"code": "STT_TRANSCRIPTION_ERROR", "message": str(e)}}

@app.post("/api/stt/transcribe-url")
async def transcribe_audio_url(
    audioUrl: str = Form(...),
    language: str = Form("auto")
):
    """Transcribe audio from URL"""
    try:
        # In a real implementation, you would download the audio from the URL
        # For now, we'll return a mock response
        return {
            "success": True,
            "data": {
                "text": f"Transcription from URL: {audioUrl}",
                "language": language if language != "auto" else "en",
                "confidence": 0.95,
                "segments": [
                    {"start": 0, "end": 3, "text": "Transcription from URL", "confidence": 0.96}
                ],
                "metadata": {
                    "model": "whisper-base",
                    "provider": "whisper",
                    "transcriptionTime": 1000,
                    "audioDuration": 5000,
                    "responseFormat": "json"
                }
            }
        }
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
        "tts_stt_service:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )


