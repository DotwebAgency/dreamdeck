import { NextResponse } from 'next/server';

const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY!;
const WAVESPEED_BASE_URL = process.env.WAVESPEED_BASE_URL || 'https://api.wavespeed.ai';

export async function GET() {
  try {
    const response = await fetch(`${WAVESPEED_BASE_URL}/api/v3/balance`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WAVESPEED_API_KEY}`,
      },
      // Don't cache balance requests
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[API] Balance fetch failed:', response.status);
      
      if (response.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Authentication failed' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: `Failed to fetch balance: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Handle different response structures
    const balance = data.data?.balance ?? data.balance ?? null;

    if (typeof balance !== 'number') {
      console.error('[API] Invalid balance response:', data);
      return NextResponse.json(
        { success: false, error: 'Invalid balance response' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      balance,
    });

  } catch (error) {
    console.error('[API] Balance error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
