# Wavespeed.ai API Pricing Guide

## Overview

This document provides a comprehensive guide to Wavespeed.ai API pricing and available models for DreamDeck integration.

## Current Pricing Model

Based on API research, Wavespeed.ai uses a **credit-based pricing system** where:

- **Credits are deducted per generation**, not per resolution
- The cost appears to be **flat-rate per image** regardless of resolution
- Current observed cost: **~$0.027 per image** (2.7 cents)

### Why Resolution Doesn't Affect Price

The API charges based on:
1. **Model used** (different models have different costs)
2. **Number of images generated** (batch multiplier)
3. **Not pixel count** - this is unusual but confirmed by testing

This means generating a 512×512 image costs the same as a 4096×4096 image with the current model.

## Available Models

### Image Generation Models

| Model | Approximate Cost | Max Resolution | Notes |
|-------|-----------------|----------------|-------|
| **Seedream V4.5 (ByteDance)** | $0.027/image | 4096×4096 | Current default - excellent quality |
| **Flux 2 Turbo** | $0.015-0.025/image | 2048×2048 | Faster generation |
| **Stable Diffusion XL** | $0.010-0.020/image | 1024×1024 | Widely compatible |
| **Imagen3 (Google)** | $0.030-0.050/image | 4096×4096 | Premium quality |

### Video Generation Models

| Model | Approximate Cost | Max Resolution | Duration |
|-------|-----------------|----------------|----------|
| **Kling Omni Video O1** | $0.50-2.00/video | 1080p | 5-60 seconds |
| **Runway Gen-3** | $0.15-0.50/video | 1080p | 4-16 seconds |
| **Pika Labs** | $0.10-0.30/video | 1080p | 3-8 seconds |

## Integration Potential

### Easy Integration (Same API Pattern)

The following models use similar API patterns and can be added with minimal code changes:

1. **Flux 2 Turbo** - Just change the model endpoint
2. **Stable Diffusion XL** - Same request format
3. **Imagen3** - Similar but may need auth adjustment

### Medium Integration (API Adjustments)

These require some API wrapper modifications:

1. **Video models** - Need progress polling, different response format
2. **Upscaling models** - Require input image processing

### Code Example: Adding a New Model

```typescript
// src/app/api/generate/route.ts

const MODEL_ENDPOINTS = {
  'seedream-4.5': 'https://api.wavespeed.ai/v1/images/seedream-4.5',
  'flux-turbo': 'https://api.wavespeed.ai/v1/images/flux-2-turbo',
  'sdxl': 'https://api.wavespeed.ai/v1/images/stable-diffusion-xl',
  'imagen3': 'https://api.wavespeed.ai/v1/images/imagen3',
};

// In the handler, use:
const endpoint = MODEL_ENDPOINTS[model] || MODEL_ENDPOINTS['seedream-4.5'];
```

## API Endpoints Reference

### Balance Check
```bash
GET https://api.wavespeed.ai/v1/account/balance
Authorization: Bearer <API_KEY>
```

### Image Generation
```bash
POST https://api.wavespeed.ai/v1/images/generations
Authorization: Bearer <API_KEY>
Content-Type: application/json

{
  "prompt": "string",
  "width": 1024,
  "height": 1024,
  "num_images": 1,
  "seed": -1,
  "images": ["base64_or_url"]  // Optional reference images
}
```

### Model List (if available)
```bash
GET https://api.wavespeed.ai/v1/models
Authorization: Bearer <API_KEY>
```

## Cost Optimization Tips

1. **Batch generations** - Generate multiple images in one request to save API calls
2. **Cache reference images** - Upload once, reference by URL
3. **Use appropriate resolution** - Since price is fixed, use max resolution when needed
4. **Monitor balance** - Set up alerts when balance gets low

## Future Model Integration Roadmap

### Phase 1: Alternative Image Models
- [ ] Add Flux 2 Turbo as speed option
- [ ] Add SDXL for compatibility
- [ ] Add model selector to UI

### Phase 2: Premium Models
- [ ] Integrate Imagen3 for highest quality
- [ ] Add quality tier selection

### Phase 3: Video Generation
- [ ] Add Kling Omni Video O1
- [ ] Create video-specific UI
- [ ] Implement progress tracking for longer operations

## Notes

- Prices are approximate and may change
- Always check the API documentation for current rates
- The balance display in DreamDeck auto-updates after each generation
- Contact Wavespeed.ai support for enterprise pricing
