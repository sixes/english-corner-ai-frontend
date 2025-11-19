import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase-admin';
import { createClient } from '@supabase/supabase-js';

// Helper to get user from request
async function getUserFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return null;
  }

  return user;
}

// GET - Fetch all sessions with signups
export async function GET() {
  try {
    // Fetch sessions
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('is_cancelled', false)
      .order('date', { ascending: true });

    if (sessionsError) {
      throw sessionsError;
    }

    // Fetch all signups for these sessions
    const sessionIds = sessions.map(s => s.id);
    const { data: signups, error: signupsError } = await supabaseAdmin
      .from('session_signups')
      .select('*')
      .in('session_id', sessionIds.length > 0 ? sessionIds : ['00000000-0000-0000-0000-000000000000']);

    if (signupsError) {
      throw signupsError;
    }

    // Group signups by session
    const signupsBySession = signups.reduce((acc, signup) => {
      if (!acc[signup.session_id]) {
        acc[signup.session_id] = [];
      }
      acc[signup.session_id].push({
        id: signup.id,
        user_id: signup.user_id,
        user_name: signup.user_name,
        user_gender: signup.user_gender,
        signed_up_at: signup.signed_up_at
      });
      return acc;
    }, {});

    // Attach signups to sessions
    const sessionsWithSignups = sessions.map(session => ({
      id: session.id,
      date: session.date,
      time: session.time,
      location: session.location,
      topic: session.topic,
      max_participants: session.max_participants,
      created_by: session.created_by,
      participants: signupsBySession[session.id] || []
    }));

    return NextResponse.json({ sessions: sessionsWithSignups, success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions', message: error.message, success: false },
      { status: 500 }
    );
  }
}

// POST - Create a new session
export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', success: false },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { date, time, location, topic, max_participants = 20 } = body;

    // Validate required fields
    if (!date || !time || !location || !topic) {
      return NextResponse.json(
        { error: 'Missing required fields: date, time, location, topic', success: false },
        { status: 400 }
      );
    }

    const { data: session, error } = await supabaseAdmin
      .from('sessions')
      .insert({
        date,
        time,
        location,
        topic,
        max_participants,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      session: { ...session, participants: [] },
      success: true
    }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create session', message: error.message, success: false },
      { status: 500 }
    );
  }
}
