#!/usr/bin/env python3
"""
Simple TTS Server using Windows SAPI
"""
import os
import sys
import json
import tempfile
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "TTS Server (Windows SAPI)",
        "voices": get_available_voices()
    })

@app.route('/api/tts', methods=['POST'])
def tts():
    try:
        data = request.get_json()
        text = data.get('text', '')
        voice = data.get('voice', 'default')
        
        if not text:
            return jsonify({"error": "Text is required"}), 400
        
        # Create temporary file for audio output
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_file:
            audio_file = tmp_file.name
        
        # Use Windows SAPI to generate speech
        try:
            # PowerShell command to generate TTS
            ps_command = f'''
            Add-Type -AssemblyName System.Speech
            $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
            $synth.SetOutputToWaveFile('{audio_file}')
            $synth.Speak('{text.replace("'", "''")}')
            $synth.Dispose()
            '''
            
            result = subprocess.run(
                ['powershell', '-Command', ps_command],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0 and os.path.exists(audio_file):
                # Read the generated audio file
                with open(audio_file, 'rb') as f:
                    audio_data = f.read()
                
                # Clean up temporary file
                os.unlink(audio_file)
                
                # Convert to base64
                import base64
                audio_base64 = base64.b64encode(audio_data).decode('utf-8')
                
                return jsonify({
                    "success": True,
                    "data": {
                        "audioUrl": f"data:audio/wav;base64,{audio_base64}",
                        "text": text,
                        "voice": voice,
                        "duration": len(text) * 0.1,  # Rough estimate
                        "timestamp": "2025-10-07T06:51:23.984Z",
                        "provider": "windows-sapi"
                    }
                })
            else:
                return jsonify({"error": f"TTS generation failed: {result.stderr}"}), 500
                
        except subprocess.TimeoutExpired:
            return jsonify({"error": "TTS generation timed out"}), 500
        except Exception as e:
            return jsonify({"error": f"TTS generation failed: {str(e)}"}), 500
            
    except Exception as e:
        return jsonify({"error": f"TTS request failed: {str(e)}"}), 500

def get_available_voices():
    """Get available Windows SAPI voices"""
    try:
        ps_command = '''
        Add-Type -AssemblyName System.Speech
        $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
        $voices = $synth.GetInstalledVoices()
        $voiceList = @()
        foreach ($voice in $voices) {
            $voiceList += @{
                id = $voice.VoiceInfo.Name
                name = $voice.VoiceInfo.Name
                language = $voice.VoiceInfo.Culture.Name
                gender = if ($voice.VoiceInfo.Gender -eq "Female") { "female" } elseif ($voice.VoiceInfo.Gender -eq "Male") { "male" } else { "neutral" }
            }
        }
        $synth.Dispose()
        $voiceList | ConvertTo-Json
        '''
        
        result = subprocess.run(
            ['powershell', '-Command', ps_command],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            return []
            
    except Exception as e:
        print(f"Error getting voices: {e}")
        return []

@app.route('/api/voices', methods=['GET'])
def voices():
    return jsonify({
        "success": True,
        "data": get_available_voices()
    })

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "service": "TTS Server (Windows SAPI)",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "tts": "/api/tts (POST with text)",
            "voices": "/api/voices"
        },
        "provider": "Windows SAPI"
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
    return jsonify({"message": "Shutting down TTS server..."})

if __name__ == '__main__':
    print("Starting TTS Server on http://localhost:8001")
    print("Using Windows SAPI for text-to-speech")
    print("Shutdown: POST http://localhost:8001/shutdown")
    app.run(host='0.0.0.0', port=8001, debug=False)
