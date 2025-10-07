# Gradio web interface for image generation

import gradio as gr
import requests
import json
import os
from typing import Optional, Tuple
import time

# Configuration
STABLE_DIFFUSION_URL = os.getenv('STABLE_DIFFUSION_URL', 'http://localhost:7860')
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:3002')

# Style templates
STYLE_TEMPLATES = {
    'realistic': {
        'name': 'Realistic',
        'description': 'Photorealistic images with high detail',
        'suffix': ', photorealistic, high detail, sharp focus, professional photography',
        'negative': 'blurry, low quality, distorted, ugly, bad anatomy, cartoon, anime'
    },
    'artistic': {
        'name': 'Artistic',
        'description': 'Artistic and creative interpretations',
        'suffix': ', artistic, creative, stylized, beautiful composition, masterpiece',
        'negative': 'blurry, low quality, distorted, ugly, bad anatomy, photorealistic'
    },
    'anime': {
        'name': 'Anime',
        'description': 'Anime and manga style illustrations',
        'suffix': ', anime style, manga, cel shading, vibrant colors, detailed',
        'negative': 'blurry, low quality, distorted, ugly, bad anatomy, photorealistic, realistic'
    },
    'oil-painting': {
        'name': 'Oil Painting',
        'description': 'Classical oil painting style',
        'suffix': ', oil painting, classical art, brush strokes, traditional painting, masterpiece',
        'negative': 'blurry, low quality, distorted, ugly, bad anatomy, digital art, modern'
    },
    'digital-art': {
        'name': 'Digital Art',
        'description': 'Modern digital art style',
        'suffix': ', digital art, modern art, contemporary, clean lines, vibrant',
        'negative': 'blurry, low quality, distorted, ugly, bad anatomy, traditional, oil painting'
    },
    'sketch': {
        'name': 'Sketch',
        'description': 'Pencil sketch and line art',
        'suffix': ', pencil sketch, line art, black and white, minimal, detailed',
        'negative': 'blurry, low quality, distorted, ugly, bad anatomy, color, painting'
    }
}

def generate_image(
    prompt: str,
    negative_prompt: str,
    style: str,
    width: int,
    height: int,
    steps: int,
    guidance: float,
    seed: int
) -> Tuple[Optional[str], str]:
    """Generate image using Stable Diffusion API"""
    
    try:
        # Enhance prompt with style
        style_template = STYLE_TEMPLATES.get(style, STYLE_TEMPLATES['realistic'])
        enhanced_prompt = prompt + style_template['suffix']
        enhanced_negative = negative_prompt + ', ' + style_template['negative']
        
        # Prepare request
        request_data = {
            'prompt': enhanced_prompt,
            'negative_prompt': enhanced_negative,
            'width': width,
            'height': height,
            'steps': steps,
            'guidance': guidance,
            'seed': seed if seed > 0 else -1,
            'style': style
        }
        
        # Call Stable Diffusion API
        response = requests.post(
            f'{STABLE_DIFFUSION_URL}/api/v1/generate',
            json=request_data,
            timeout=120
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('images') and len(data['images']) > 0:
                # Return the first generated image
                return data['images'][0], f"Image generated successfully! Seed: {data.get('seed', 'random')}"
            else:
                return None, "No images generated"
        else:
            return None, f"API Error: {response.status_code} - {response.text}"
            
    except requests.exceptions.Timeout:
        return None, "Generation timed out. Please try again."
    except requests.exceptions.ConnectionError:
        return None, "Cannot connect to Stable Diffusion server. Please check if it's running."
    except Exception as e:
        return None, f"Error: {str(e)}"

def get_style_info(style: str) -> str:
    """Get information about the selected style"""
    template = STYLE_TEMPLATES.get(style, STYLE_TEMPLATES['realistic'])
    return f"**{template['name']}**\n\n{template['description']}\n\n**Enhancement:** {template['suffix']}"

# Create Gradio interface
with gr.Blocks(
    title="Fullstack Demo - Image Generation",
    theme=gr.themes.Soft(),
    css="""
    .gradio-container {
        max-width: 1200px !important;
    }
    .prompt-box {
        min-height: 100px !important;
    }
    """
) as demo:
    
    gr.Markdown("""
    # 🎨 AI Image Generation
    
    Generate stunning images using Stable Diffusion with various artistic styles.
    
    **Features:**
    - 🎭 Multiple artistic styles
    - 🎛️ Advanced generation parameters
    - 🖼️ High-quality image output
    - ⚡ Fast generation with local processing
    """)
    
    with gr.Row():
        with gr.Column(scale=2):
            # Prompt inputs
            prompt_input = gr.Textbox(
                label="Prompt",
                placeholder="Describe the image you want to generate...",
                lines=3,
                elem_classes=["prompt-box"]
            )
            
            negative_prompt_input = gr.Textbox(
                label="Negative Prompt",
                placeholder="What you don't want in the image...",
                lines=2
            )
            
            # Style selection
            style_dropdown = gr.Dropdown(
                label="Style",
                choices=list(STYLE_TEMPLATES.keys()),
                value="realistic",
                info="Select an artistic style for your image"
            )
            
            style_info = gr.Markdown(get_style_info("realistic"))
            
            # Update style info when selection changes
            style_dropdown.change(
                fn=get_style_info,
                inputs=[style_dropdown],
                outputs=[style_info]
            )
            
        with gr.Column(scale=1):
            # Generation parameters
            with gr.Group():
                gr.Markdown("### 🎛️ Generation Parameters")
                
                width_slider = gr.Slider(
                    label="Width",
                    minimum=256,
                    maximum=1024,
                    value=512,
                    step=64,
                    info="Image width in pixels"
                )
                
                height_slider = gr.Slider(
                    label="Height",
                    minimum=256,
                    maximum=1024,
                    value=512,
                    step=64,
                    info="Image height in pixels"
                )
                
                steps_slider = gr.Slider(
                    label="Steps",
                    minimum=10,
                    maximum=50,
                    value=20,
                    step=5,
                    info="Number of inference steps (more = higher quality, slower)"
                )
                
                guidance_slider = gr.Slider(
                    label="Guidance Scale",
                    minimum=1.0,
                    maximum=20.0,
                    value=7.5,
                    step=0.5,
                    info="How closely to follow the prompt"
                )
                
                seed_input = gr.Number(
                    label="Seed",
                    value=-1,
                    info="Random seed (-1 for random)"
                )
    
    # Generate button
    generate_btn = gr.Button(
        "🎨 Generate Image",
        variant="primary",
        size="lg"
    )
    
    # Output
    with gr.Row():
        with gr.Column():
            output_image = gr.Image(
                label="Generated Image",
                height=512
            )
            
            output_text = gr.Textbox(
                label="Status",
                interactive=False
            )
    
    # Generation function
    generate_btn.click(
        fn=generate_image,
        inputs=[
            prompt_input,
            negative_prompt_input,
            style_dropdown,
            width_slider,
            height_slider,
            steps_slider,
            guidance_slider,
            seed_input
        ],
        outputs=[output_image, output_text]
    )
    
    # Examples
    gr.Markdown("### 📝 Example Prompts")
    
    examples = [
        [
            "A beautiful sunset over mountains",
            "blurry, low quality",
            "realistic",
            512, 512, 20, 7.5, -1
        ],
        [
            "A futuristic city with flying cars",
            "blurry, low quality",
            "digital-art",
            512, 512, 25, 8.0, -1
        ],
        [
            "A cute anime girl with blue hair",
            "blurry, low quality, realistic",
            "anime",
            512, 512, 20, 7.5, -1
        ],
        [
            "A serene landscape with a lake",
            "blurry, low quality, distorted",
            "oil-painting",
            512, 512, 30, 7.0, -1
        ]
    ]
    
    gr.Examples(
        examples=examples,
        inputs=[
            prompt_input,
            negative_prompt_input,
            style_dropdown,
            width_slider,
            height_slider,
            steps_slider,
            guidance_slider,
            seed_input
        ],
        outputs=[output_image, output_text],
        fn=generate_image,
        cache_examples=False
    )

if __name__ == "__main__":
    # Launch Gradio interface
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True,
        quiet=False
    )


