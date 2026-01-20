import { NextRequest, NextResponse } from 'next/server';

const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY!;
const WAVESPEED_BASE_URL = process.env.WAVESPEED_BASE_URL || 'https://api.wavespeed.ai';

// Simple rate limiter: 10 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetIn: RATE_WINDOW_MS };
  }
  
  if (record.count >= RATE_LIMIT) {
    // Exceeded limit
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }
  
  // Increment count
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count, resetIn: record.resetTime - now };
}

interface GenerateRequestBody {
  prompt: string;
  width: number;
  height: number;
  seed?: number;
  num_images?: number;
  mode?: 'std' | 'turbo';
  reference_images?: { url: string; priority: number }[];
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const rateCheck = checkRateLimit(ip);
  
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { 
        success: false, 
        error: `Rate limit exceeded. Try again in ${Math.ceil(rateCheck.resetIn / 1000)} seconds.` 
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rateCheck.resetIn / 1000)),
        }
      }
    );
  }
  try {
    const body: GenerateRequestBody = await request.json();
    const { prompt, width, height, seed, num_images = 1, mode = 'std', reference_images } = body;

    // Validate required fields
    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Validate API key
    if (!WAVESPEED_API_KEY) {
      console.error('[API] Missing WAVESPEED_API_KEY');
      return NextResponse.json(
        { success: false, error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Extract image URLs from reference images
    const images = (reference_images || [])
      .filter((img) => img && img.url)
      .map((img) => img.url);

    // Determine endpoint based on whether we have reference images
    // Per Wavespeed docs: /api/v3/bytedance/seedream-v4.5 for text-to-image
    // /api/v3/bytedance/seedream-v4.5/edit for image editing
    let endpoint: string;
    if (images.length > 0) {
      endpoint = '/api/v3/bytedance/seedream-v4.5/edit';
    } else {
      endpoint = '/api/v3/bytedance/seedream-v4.5';
    }

    // Build payload per Wavespeed API spec
    // Note: API uses "max_images" NOT "num_images"
    // Size format: "width*height" with asterisk
    const payload: Record<string, unknown> = {
      prompt,
      size: `${width}*${height}`,
      max_images: num_images,  // CORRECT: max_images, not num_images
      enable_sync_mode: true,
      enable_base64_output: false,
    };

    // Add images if present (for edit mode)
    if (images.length > 0) {
      payload.images = images;
    }

    // Add seed if specified (not -1)
    if (seed !== undefined && seed !== -1) {
      payload.seed = seed;
    }

    console.log(`[API] Calling Wavespeed: ${endpoint}`);
    console.log(`[API] Payload:`, {
      ...payload,
      images: images.length > 0 ? `[${images.length} images]` : undefined,
    });

    // Make API call
    const response = await fetch(`${WAVESPEED_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WAVESPEED_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[API] Wavespeed error:', data);
      
      // Handle specific error codes
      if (response.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Authentication failed. Check your API key.' },
          { status: 401 }
        );
      }
      if (response.status === 403) {
        return NextResponse.json(
          { success: false, error: 'Access forbidden. Account may be suspended.' },
          { status: 403 }
        );
      }
      if (response.status === 429) {
        return NextResponse.json(
          { success: false, error: 'Rate limited. Please wait before trying again.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { success: false, error: data.message || data.error || `API Error: ${response.status}` },
        { status: response.status }
      );
    }

    console.log('[API] Wavespeed response:', JSON.stringify(data, null, 2));

    // Parse response - per Wavespeed API docs:
    // Response structure:
    // {
    //   code: 200,
    //   message: "success",
    //   data: {
    //     id: "task-12345abc",
    //     outputs: ["url1", "url2", ...],
    //     seed: 12345,
    //     status: "completed"
    //   }
    // }
    let imageUrls: string[] = [];
    let resultSeed = seed;

    // Primary response structure from Wavespeed
    if (data.data?.outputs && Array.isArray(data.data.outputs)) {
      imageUrls = data.data.outputs;
      resultSeed = data.data.seed || seed;
    }
    // Alternative: outputs at root level
    else if (data.outputs && Array.isArray(data.outputs)) {
      imageUrls = data.outputs;
      resultSeed = data.seed || seed;
    }
    // Single output
    else if (data.data?.output) {
      imageUrls = [data.data.output];
      resultSeed = data.data.seed || seed;
    }
    else if (data.output) {
      imageUrls = Array.isArray(data.output) ? data.output : [data.output];
      resultSeed = data.seed || seed;
    }
    // Images array (some models)
    else if (data.images && Array.isArray(data.images)) {
      imageUrls = data.images;
      resultSeed = data.seed || seed;
    }

    // Check if still processing (async mode fallback)
    if (imageUrls.length === 0 && data.data?.status === 'processing') {
      console.log('[API] Task still processing, returning task ID for polling');
      return NextResponse.json({
        success: true,
        processing: true,
        taskId: data.data.id,
        message: 'Image generation in progress',
      });
    }

    if (imageUrls.length === 0) {
      console.warn('[API] No images in response:', data);
      return NextResponse.json(
        { success: false, error: 'No images were generated. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      images: imageUrls,
      seed: resultSeed,
      requestId: data.data?.id || data.id || data.requestId,
    });

  } catch (error) {
    console.error('[API] Generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
