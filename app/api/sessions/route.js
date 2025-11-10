import { NextResponse } from 'next/server';
import { getSessions } from '../../../lib/dynamodb';

export async function GET() {
  try {
    const sessions = await getSessions();
    return NextResponse.json({ sessions, success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions', success: false },
      { status: 500 }
    );
  }
}
