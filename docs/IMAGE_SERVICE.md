# Image Generation Service - Quick Reference

**Port:** 7860 | **Tech:** Python/Gradio/Stable Diffusion | **Purpose:** Text/image-to-image generation

## Features

- **Text-to-Image:** Generate from text prompts
- **Image-to-Image:** Transform existing images
- **Style Templates:** Pre-configured styles
- **Queue System:** Background processing
- **Gradio UI:** Web interface included

## Style Templates

```json
{
  "anime": {
    "positive": ", anime style, high quality, detailed",
    "negative": "realistic, photographic, 3d"
  },
  "realistic": {
    "positive": ", photorealistic, 8k, detailed",
    "negative": "anime, cartoon, painting"
  },
  "artistic": {
    "positive": ", digital art, artstation trending",
    "negative": "photo, realistic, blurry"
  },
  "cinematic": {
    "positive": ", cinematic lighting, film grain",
    "negative": "amateur, low quality"
  },
  "oil_painting": {
    "positive": ", oil painting, impressionist",
    "negative": "digital, photographic"
  }
}
```

## Gradio Interface Components

```python
with gr.Blocks() as interface:
    with gr.Row():
        with gr.Column():
            prompt = gr.Textbox(label="Prompt", lines=3)
            negative = gr.Textbox(label="Negative Prompt", lines=2)
            style = gr.Dropdown(["anime", "realistic", ...])
            
            with gr.Accordion("Advanced", open=False):
                steps = gr.Slider(20, 50, value=25)
                cfg = gr.Slider(5, 15, value=7.5)
                seed = gr.Number(value=-1)
                size = gr.Radio(["512x512", "768x768", "1024x1024"])
            
            generate_btn = gr.Button("Generate")
        
        with gr.Column():
            output = gr.Gallery(label="Generated Images")
            download_btn = gr.Button("Download")
```

## API Endpoints (for Dashboard)

```typescript
GET /api/health
{
  "status": "healthy",
  "model": "stable-diffusion-v1-5",
  "queue": { "pending": 2, "processing": 1 }
}

GET /api/metrics
{
  "totalGenerations": 150,
  "avgGenerationTime": 25.3,
  "queueDepth": 2,
  "gpuUtilization": 85
}
```

## Configuration

```env
PORT=7860
MODEL_PATH=models/stable-diffusion-v1-5
DEVICE=cuda              # or cpu
QUEUE_SIZE=3
MAX_STEPS=50
DEFAULT_SIZE=512x512
SAFETY_CHECKER=true      # NSFW filter
```

## Generation Parameters

| Parameter | Range | Default | Purpose |
|-----------|-------|---------|---------|
| Steps | 20-50 | 25 | Quality vs speed |
| CFG Scale | 5-15 | 7.5 | Prompt adherence |
| Seed | -1 or 0-9999 | -1 | Reproducibility |
| Size | 512-1024 | 512x512 | Output dimensions |

## Performance

- **512x512, 25 steps:** ~15s (GPU), ~120s (CPU)
- **768x768, 25 steps:** ~25s (GPU), ~180s (CPU)
- **1024x1024, 25 steps:** ~45s (GPU), ~300s (CPU)

## Model Options

**Recommended for MVP:**
- `stable-diffusion-v1-5` - General purpose, well-tested
- `realistic-vision-v5` - Better realism
- `anything-v4` - Anime style

**Download from:** HuggingFace model hub

## Example Prompts

```python
EXAMPLES = [
    ["a cat sitting on a windowsill, anime style", "anime"],
    ["mountain landscape at sunset, oil painting", "oil_painting"],
    ["futuristic city with flying cars, cinematic", "cinematic"],
    ["portrait of a person, photorealistic", "realistic"]
]
```

## Implementation Notes

- Keep Gradio app.py < 200 lines
- Separate style config to styles.json
- Use FastAPI for health/metrics endpoints
- Queue in memory (Redis for production)

## Next: See IMAGE_SERVICE_IMPL.md for code examples
