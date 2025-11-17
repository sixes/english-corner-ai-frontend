import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('[client-debug]', JSON.stringify(body));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[client-debug] Failed to record log:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
