import { NextResponse } from 'next/server';

const API_KEY = process.env.WAVESPEED_API_KEY;

export async function POST(request: Request) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { start_time, end_time, model_uuid } = body;

    // Validate required fields
    if (!start_time || !end_time) {
      return NextResponse.json(
        { error: 'start_time and end_time are required' },
        { status: 400 }
      );
    }

    const payload: Record<string, string> = {
      start_time,
      end_time,
    };

    if (model_uuid) {
      payload.model_uuid = model_uuid;
    }

    const response = await fetch('https://api.wavespeed.ai/api/v3/user/usage_stats', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Usage stats API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch usage stats: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Usage stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
}

// GET endpoint for quick last 7 days
export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // Calculate last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const response = await fetch('https://api.wavespeed.ai/api/v3/user/usage_stats', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Usage stats API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch usage stats: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Usage stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
}
