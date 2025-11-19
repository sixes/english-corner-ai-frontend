import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabase-admin';
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

// POST - Sign up for a session
export async function POST(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in to join this session', success: false },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if session exists and is not cancelled
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('*, session_signups(count)')
      .eq('id', id)
      .eq('is_cancelled', false)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found or has been cancelled', success: false },
        { status: 404 }
      );
    }

    // Check if session is full
    const currentSignups = await supabaseAdmin
      .from('session_signups')
      .select('id', { count: 'exact' })
      .eq('session_id', id);

    if (currentSignups.count >= session.max_participants) {
      return NextResponse.json(
        { error: 'Sorry, this session is full! Try another one.', success: false },
        { status: 400 }
      );
    }

    // Check if user already signed up
    const { data: existingSignup } = await supabaseAdmin
      .from('session_signups')
      .select('id')
      .eq('session_id', id)
      .eq('user_id', user.id)
      .single();

    if (existingSignup) {
      return NextResponse.json(
        { error: 'You\'re already signed up for this session!', success: false },
        { status: 400 }
      );
    }

    // Create signup
    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous';
    const userGender = user.user_metadata?.gender || 'undisclosed';

    const { data: signup, error } = await supabaseAdmin
      .from('session_signups')
      .insert({
        session_id: id,
        user_id: user.id,
        user_name: userName,
        user_email: user.email,
        user_gender: userGender
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      signup: {
        id: signup.id,
        user_id: signup.user_id,
        user_name: signup.user_name,
        user_gender: signup.user_gender,
        signed_up_at: signup.signed_up_at
      },
      message: 'You\'re in! See you at the session!',
      success: true
    }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to sign up for session', message: error.message, success: false },
      { status: 500 }
    );
  }
}

// DELETE - Cancel signup for a session
export async function DELETE(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', success: false },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if signup exists
    const { data: existingSignup, error: checkError } = await supabaseAdmin
      .from('session_signups')
      .select('id')
      .eq('session_id', id)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existingSignup) {
      return NextResponse.json(
        { error: 'You\'re not signed up for this session', success: false },
        { status: 404 }
      );
    }

    // Delete signup
    const { error } = await supabaseAdmin
      .from('session_signups')
      .delete()
      .eq('session_id', id)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: 'Your spot has been freed up. Hope to see you next time!',
      success: true
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel signup', message: error.message, success: false },
      { status: 500 }
    );
  }
}
