#!/usr/bin/env python3
"""
Real Stable Diffusion API Server
Uses diffusers library for actual AI image generation
"""
import os
import json
import base64
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import torch
from diffusers import StableDiffusionPipeline
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variables for the model
pipe = None
device = "cuda" if torch.cuda.is_available() else "cpu"

def load_model():
    """Load the Stable Diffusion model"""
    global pipe
    try:
        logger.info(f"Loading Stable Diffusion model on {device}...")
        pipe = StableDiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            safety_checker=None,
            requires_safety_checker=False
        )
        pipe = pipe.to(device)
        logger.info("Model loaded successfully!")
        return True
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        return False

def generate_image(prompt, style="realistic", steps=20, guidance_scale=7.5):
    """Generate an image using Stable Diffusion"""
    global pipe
    
    if pipe is None:
        return None, "Model not loaded"
    
    try:
        # Enhance prompt based on style
        style_prompts = {
            "realistic": f"photorealistic, high quality, detailed, {prompt}",
            "anime": f"anime style, manga, japanese animation, {prompt}",
            "artistic": f"artistic, painting, masterpiece, {prompt}",
            "fantasy": f"fantasy art, magical, mystical, {prompt}",
            "cyberpunk": f"cyberpunk, futuristic, neon, sci-fi, {prompt}"
        }
        
        enhanced_prompt = style_prompts.get(style, prompt)
        negative_prompt = "blurry, low quality, distorted, ugly, bad anatomy"
        
        logger.info(f"Generating image with prompt: {enhanced_prompt}")
        
        # Generate image
        with torch.no_grad():
            result = pipe(
                prompt=enhanced_prompt,
                negative_prompt=negative_prompt,
                num_inference_steps=steps,
                guidance_scale=guidance_scale,
                width=512,
                height=512
            )
        
        image = result.images[0]
        return image, "Success"
        
    except Exception as e:
        logger.error(f"Image generation failed: {e}")
        return None, str(e)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy" if pipe is not None else "loading",
        "service": "Real Stable Diffusion API",
        "device": device,
        "model_loaded": pipe is not None
    })

@app.route('/sdapi/v1/txt2img', methods=['POST'])
def txt2img():
    """Stable Diffusion WebUI compatible endpoint"""
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')
        negative_prompt = data.get('negative_prompt', 'blurry, low quality, distorted')
        steps = data.get('steps', 20)
        cfg_scale = data.get('cfg_scale', 7.5)
        width = data.get('width', 512)
        height = data.get('height', 512)
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        logger.info(f"Generating image: {prompt}")
        
        # Generate image
        image, status = generate_image(prompt, steps=steps, guidance_scale=cfg_scale)
        
        if image is None:
            return jsonify({"error": f"Generation failed: {status}"}), 500
        
        # Convert to base64
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        img_data = buffer.getvalue()
        img_base64 = base64.b64encode(img_data).decode('utf-8')
        
        return jsonify({
            "images": [img_base64],
            "info": {
                "prompt": prompt,
                "negative_prompt": negative_prompt,
                "steps": steps,
                "cfg_scale": cfg_scale,
                "width": width,
                "height": height,
                "device": device
            }
        })
        
    except Exception as e:
        logger.error(f"API error: {e}")
        return jsonify({"error": f"API error: {str(e)}"}), 500

@app.route('/api/generate', methods=['POST'])
def generate():
    """Simple generation endpoint"""
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')
        style = data.get('style', 'realistic')
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        logger.info(f"Generating image: {prompt} in {style} style")
        
        # Generate image
        image, status = generate_image(prompt, style)
        
        if image is None:
            return jsonify({"error": f"Generation failed: {status}"}), 500
        
        # Convert to base64
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        img_data = buffer.getvalue()
        img_base64 = base64.b64encode(img_data).decode('utf-8')
        
        return jsonify({
            "success": True,
            "data": {
                "imageUrl": f"data:image/png;base64,{img_base64}",
                "prompt": prompt,
                "style": style,
                "timestamp": "2025-10-07T12:30:00.000Z",
                "provider": "stable-diffusion-diffusers"
            }
        })
        
    except Exception as e:
        logger.error(f"Generation error: {e}")
        return jsonify({"error": f"Generation failed: {str(e)}"}), 500

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "service": "Real Stable Diffusion API",
        "version": "1.0.0",
        "device": device,
        "model_loaded": pipe is not None,
        "endpoints": {
            "health": "/health",
            "generate": "/api/generate (POST with prompt and style)",
            "txt2img": "/sdapi/v1/txt2img (Stable Diffusion WebUI compatible)"
        }
    })

if __name__ == '__main__':
    print("Loading Stable Diffusion model...")
    if load_model():
        print(f"Starting Real Stable Diffusion API on http://localhost:7860")
        print(f"Device: {device}")
        print("Model loaded successfully!")
        app.run(host='0.0.0.0', port=7860, debug=False)
    else:
        print("Failed to load model. Exiting.")
