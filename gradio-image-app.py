#!/usr/bin/env python3
"""
Gradio Image Generation Interface
"""
import gradio as gr
import requests
import json
from PIL import Image
import io
import base64

def generate_image(prompt, style, api_url="http://localhost:9200"):
    """Generate image using the backend API"""
    try:
        response = requests.post(f"{api_url}/api/image/generate", 
                               json={"prompt": prompt, "style": style},
                               timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                # Decode base64 image
                image_data = data['data']['imageUrl']
                if image_data.startswith('data:image'):
                    # Extract base64 part
                    base64_data = image_data.split(',')[1]
                    image_bytes = base64.b64decode(base64_data)
                    image = Image.open(io.BytesIO(image_bytes))
                    return image, f"✅ Generated successfully!\nStyle: {style}\nPrompt: {prompt}\nProvider: {data['data'].get('provider', 'unknown')}"
                else:
                    return None, f"❌ Invalid image data received"
            else:
                return None, f"❌ API Error: {data.get('error', 'Unknown error')}"
        else:
            return None, f"❌ HTTP Error: {response.status_code}"
            
    except requests.exceptions.RequestException as e:
        return None, f"❌ Connection Error: {str(e)}"
    except Exception as e:
        return None, f"❌ Error: {str(e)}"

def generate_with_ollama(prompt, style):
    """Generate image using Ollama's image generation capabilities"""
    try:
        # Try to use Ollama for image generation if available
        response = requests.post("http://localhost:11434/api/generate",
                               json={
                                   "model": "llava",  # or whatever image model you have
                                   "prompt": f"Generate an image of: {prompt} in {style} style",
                                   "stream": False
                               },
                               timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            # This would need to be adapted based on Ollama's image generation response
            return None, f"🔄 Ollama response: {data.get('response', 'No response')}"
        else:
            return None, f"❌ Ollama not available or error: {response.status_code}"
            
    except Exception as e:
        return None, f"❌ Ollama error: {str(e)}"

# Create Gradio interface
with gr.Blocks(title="AI Image Generation", theme=gr.themes.Soft()) as demo:
    gr.Markdown("""
    # 🎨 AI Image Generation
    
    Generate images using AI! Enter a prompt and select a style to create unique images.
    
    **Features:**
    - Real-time image generation
    - Multiple artistic styles
    - Integration with backend API
    - Download generated images
    """)
    
    with gr.Row():
        with gr.Column(scale=2):
            prompt_input = gr.Textbox(
                label="🎯 Prompt",
                placeholder="Describe the image you want to generate...",
                lines=3,
                value="A beautiful sunset over mountains"
            )
            
            style_dropdown = gr.Dropdown(
                label="🎨 Style",
                choices=[
                    ("Realistic", "realistic"),
                    ("Anime", "anime"), 
                    ("Artistic", "artistic"),
                    ("Fantasy", "fantasy"),
                    ("Cyberpunk", "cyberpunk")
                ],
                value="realistic"
            )
            
            with gr.Row():
                generate_btn = gr.Button("🚀 Generate Image", variant="primary", size="lg")
                ollama_btn = gr.Button("🤖 Try Ollama", variant="secondary")
        
        with gr.Column(scale=3):
            image_output = gr.Image(
                label="Generated Image",
                height=400,
                type="pil"
            )
            
            status_output = gr.Textbox(
                label="Status",
                lines=3,
                interactive=False
            )
    
    # Examples
    gr.Examples(
        examples=[
            ["A majestic dragon flying over a medieval castle", "fantasy"],
            ["A futuristic city with flying cars", "cyberpunk"],
            ["A peaceful forest with sunlight filtering through trees", "realistic"],
            ["A cute anime character with big eyes", "anime"],
            ["An abstract painting with vibrant colors", "artistic"]
        ],
        inputs=[prompt_input, style_dropdown]
    )
    
    # Event handlers
    generate_btn.click(
        fn=generate_image,
        inputs=[prompt_input, style_dropdown],
        outputs=[image_output, status_output]
    )
    
    ollama_btn.click(
        fn=generate_with_ollama,
        inputs=[prompt_input, style_dropdown],
        outputs=[image_output, status_output]
    )
    
    # Additional info
    gr.Markdown("""
    ### 💡 Tips for Better Results:
    - Be specific in your descriptions
    - Include details about lighting, mood, and composition
    - Try different styles for the same prompt
    - Use descriptive adjectives (beautiful, majestic, peaceful, etc.)
    
    ### 🔧 Technical Info:
    - Backend API: http://localhost:9200
    - Image size: 512x512 pixels
    - Supported formats: PNG, JPEG
    - Generation time: 5-30 seconds
    """)

if __name__ == "__main__":
    print("Starting Gradio Image Generation Interface...")
    print("Access at: http://localhost:7861")
    print("Backend API: http://localhost:9200")
    
    demo.launch(
        server_name="0.0.0.0",
        server_port=7861,
        share=False,
        debug=False
    )
