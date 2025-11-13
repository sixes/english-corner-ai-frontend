import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error('NEXT_PUBLIC_BACKEND_URL is not defined. Please configure the backend URL in your environment.');
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('Proxy: Forwarding to backend:', BACKEND_URL);
    console.log('Proxy: Payload:', body);

    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Proxy: Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Proxy: Backend error:', errorText);
      return NextResponse.json(
        { error: 'Backend error', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Proxy: Backend response data:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy: Error:', error);
    return NextResponse.json(
      { error: 'Proxy error', message: error.message },
      { status: 500 }
    );
  }
}
