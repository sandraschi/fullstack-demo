// Style templates for image generation

import { createLogger } from '@shared/utils/logger'

const logger = createLogger('image-service-styles')

export interface StyleTemplate {
  id: string
  name: string
  description: string
  promptSuffix: string
  negativePrompt: string
  defaultSettings: {
    width: number
    height: number
    steps: number
    guidance: number
  }
  tags: string[]
  preview: string
}

export const STYLE_TEMPLATES: Record<string, StyleTemplate> = {
  realistic: {
    id: 'realistic',
    name: 'Realistic',
    description: 'Photorealistic images with high detail and sharp focus',
    promptSuffix: ', photorealistic, high detail, sharp focus, professional photography, 8k, ultra detailed',
    negativePrompt: 'blurry, low quality, distorted, ugly, bad anatomy, cartoon, anime, painting, drawing',
    defaultSettings: {
      width: 512,
      height: 512,
      steps: 25,
      guidance: 7.5,
    },
    tags: ['photography', 'realistic', 'detailed', 'professional'],
    preview: 'https://picsum.photos/200/200?random=realistic',
  },
  artistic: {
    id: 'artistic',
    name: 'Artistic',
    description: 'Artistic and creative interpretations with stylized elements',
    promptSuffix: ', artistic, creative, stylized, beautiful composition, masterpiece, art',
    negativePrompt: 'blurry, low quality, distorted, ugly, bad anatomy, photorealistic, realistic',
    defaultSettings: {
      width: 512,
      height: 512,
      steps: 30,
      guidance: 8.0,
    },
    tags: ['art', 'creative', 'stylized', 'artistic'],
    preview: 'https://picsum.photos/200/200?random=artistic',
  },
  anime: {
    id: 'anime',
    name: 'Anime',
    description: 'Anime and manga style illustrations with vibrant colors',
    promptSuffix: ', anime style, manga, cel shading, vibrant colors, detailed, high quality',
    negativePrompt: 'blurry, low quality, distorted, ugly, bad anatomy, photorealistic, realistic, 3d',
    defaultSettings: {
      width: 512,
      height: 512,
      steps: 20,
      guidance: 7.0,
    },
    tags: ['anime', 'manga', 'cartoon', 'japanese'],
    preview: 'https://picsum.photos/200/200?random=anime',
  },
  'oil-painting': {
    id: 'oil-painting',
    name: 'Oil Painting',
    description: 'Classical oil painting style with brush strokes and traditional techniques',
    promptSuffix: ', oil painting, classical art, brush strokes, traditional painting, masterpiece, canvas',
    negativePrompt: 'blurry, low quality, distorted, ugly, bad anatomy, digital art, modern, photography',
    defaultSettings: {
      width: 512,
      height: 512,
      steps: 35,
      guidance: 7.0,
    },
    tags: ['painting', 'classical', 'traditional', 'oil'],
    preview: 'https://picsum.photos/200/200?random=oil',
  },
  'digital-art': {
    id: 'digital-art',
    name: 'Digital Art',
    description: 'Modern digital art style with clean lines and contemporary aesthetics',
    promptSuffix: ', digital art, modern art, contemporary, clean lines, vibrant, digital painting',
    negativePrompt: 'blurry, low quality, distorted, ugly, bad anatomy, traditional, oil painting, realistic',
    defaultSettings: {
      width: 512,
      height: 512,
      steps: 25,
      guidance: 8.0,
    },
    tags: ['digital', 'modern', 'contemporary', 'clean'],
    preview: 'https://picsum.photos/200/200?random=digital',
  },
  sketch: {
    id: 'sketch',
    name: 'Sketch',
    description: 'Pencil sketch and line art with minimal, clean aesthetics',
    promptSuffix: ', pencil sketch, line art, black and white, minimal, detailed, clean lines',
    negativePrompt: 'blurry, low quality, distorted, ugly, bad anatomy, color, painting, realistic',
    defaultSettings: {
      width: 512,
      height: 512,
      steps: 20,
      guidance: 6.0,
    },
    tags: ['sketch', 'line-art', 'minimal', 'black-white'],
    preview: 'https://picsum.photos/200/200?random=sketch',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Futuristic cyberpunk style with neon lights and urban aesthetics',
    promptSuffix: ', cyberpunk, futuristic, neon lights, urban, sci-fi, dark, atmospheric',
    negativePrompt: 'blurry, low quality, distorted, ugly, bad anatomy, bright, cheerful, natural',
    defaultSettings: {
      width: 512,
      height: 512,
      steps: 30,
      guidance: 8.5,
    },
    tags: ['cyberpunk', 'futuristic', 'neon', 'sci-fi'],
    preview: 'https://picsum.photos/200/200?random=cyberpunk',
  },
  fantasy: {
    id: 'fantasy',
    name: 'Fantasy',
    description: 'Fantasy art style with magical elements and mystical atmospheres',
    promptSuffix: ', fantasy art, magical, mystical, ethereal, enchanting, detailed fantasy',
    negativePrompt: 'blurry, low quality, distorted, ugly, bad anatomy, realistic, modern, urban',
    defaultSettings: {
      width: 512,
      height: 512,
      steps: 30,
      guidance: 8.0,
    },
    tags: ['fantasy', 'magical', 'mystical', 'ethereal'],
    preview: 'https://picsum.photos/200/200?random=fantasy',
  },
}

export class StyleManager {
  private templates: Map<string, StyleTemplate> = new Map()

  constructor() {
    // Initialize with default templates
    Object.values(STYLE_TEMPLATES).forEach(template => {
      this.templates.set(template.id, template)
    })
    
    logger.info('Style Manager initialized', {
      templates: Array.from(this.templates.keys()),
    })
  }

  getTemplate(styleId: string): StyleTemplate | null {
    return this.templates.get(styleId) || null
  }

  getAllTemplates(): StyleTemplate[] {
    return Array.from(this.templates.values())
  }

  addTemplate(template: StyleTemplate): void {
    this.templates.set(template.id, template)
    logger.info('Style template added', { styleId: template.id, name: template.name })
  }

  removeTemplate(styleId: string): boolean {
    const removed = this.templates.delete(styleId)
    if (removed) {
      logger.info('Style template removed', { styleId })
    }
    return removed
  }

  updateTemplate(styleId: string, updates: Partial<StyleTemplate>): boolean {
    const template = this.templates.get(styleId)
    if (template) {
      Object.assign(template, updates)
      logger.info('Style template updated', { styleId, updates: Object.keys(updates) })
      return true
    }
    return false
  }

  searchTemplates(query: string): StyleTemplate[] {
    const lowercaseQuery = query.toLowerCase()
    return this.getAllTemplates().filter(template =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }

  getTemplatesByTag(tag: string): StyleTemplate[] {
    const lowercaseTag = tag.toLowerCase()
    return this.getAllTemplates().filter(template =>
      template.tags.some(t => t.toLowerCase().includes(lowercaseTag))
    )
  }

  enhancePrompt(prompt: string, styleId: string): { enhancedPrompt: string; negativePrompt: string } {
    const template = this.getTemplate(styleId)
    if (!template) {
      return {
        enhancedPrompt: prompt,
        negativePrompt: 'blurry, low quality, distorted, ugly, bad anatomy',
      }
    }

    return {
      enhancedPrompt: prompt + template.promptSuffix,
      negativePrompt: template.negativePrompt,
    }
  }

  getDefaultSettings(styleId: string): StyleTemplate['defaultSettings'] | null {
    const template = this.getTemplate(styleId)
    return template ? template.defaultSettings : null
  }
}

// Singleton instance
export const styleManager = new StyleManager()


