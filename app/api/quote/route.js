import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.viewbits.com/v1/zenquotes?mode=today', {
      cache: 'no-store'
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
