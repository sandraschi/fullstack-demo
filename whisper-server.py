#!/usr/bin/env python3
"""
Simple Whisper API Server for Speech-to-Text
"""
import os
import sys
import json
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper

app = Flask(__name__)
CORS(app)

# Load Whisper model
print("Loading Whisper model...")
model = whisper.load_model("base")  # You can use "tiny", "base", "small", "medium", "large"
print("Whisper model loaded successfully!")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "Whisper API Server",
        "model": "base"
    })

@app.route('/transcribe', methods=['POST'])
def transcribe():
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({"error": "No audio file selected"}), 400
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_file:
            audio_file.save(tmp_file.name)
            
            # Transcribe audio
            result = model.transcribe(tmp_file.name)
            
            # Clean up temporary file
            os.unlink(tmp_file.name)
            
            return jsonify({
                "text": result["text"],
                "language": result["language"],
                "confidence": 0.9,  # Whisper doesn't provide confidence scores
                "duration": result.get("duration", 0),
                "segments": [
                    {
                        "start": segment["start"],
                        "end": segment["end"],
                        "text": segment["text"]
                    }
                    for segment in result.get("segments", [])
                ]
            })
            
    except Exception as e:
        print(f"Transcription error: {e}")
        return jsonify({"error": f"Transcription failed: {str(e)}"}), 500

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "service": "Whisper API Server",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "transcribe": "/transcribe (POST with audio file)"
        },
        "model": "base"
    })

@app.route('/shutdown', methods=['POST'])
def shutdown():
    """Shutdown the server"""
    print("Shutdown requested via API")
    import threading
    import time
    
    def shutdown_server():
        time.sleep(1)  # Give time for response
        os._exit(0)
    
    threading.Thread(target=shutdown_server).start()
    return jsonify({"message": "Shutting down Whisper server..."})

if __name__ == '__main__':
    print("Starting Whisper API Server on http://localhost:8002")
    print("Shutdown: POST http://localhost:8002/shutdown")
    app.run(host='0.0.0.0', port=8002, debug=False)
