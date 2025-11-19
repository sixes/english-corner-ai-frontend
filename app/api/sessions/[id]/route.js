import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase-admin';
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

// DELETE - Cancel/delete a session
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

    // Check if user owns the session
    const { data: session, error: fetchError } = await supabaseAdmin
      .from('sessions')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError || !session) {
      return NextResponse.json(
        { error: 'Session not found', success: false },
        { status: 404 }
      );
    }

    if (session.created_by !== user.id) {
      return NextResponse.json(
        { error: 'You can only cancel sessions you created', success: false },
        { status: 403 }
      );
    }

    // Mark session as cancelled (soft delete)
    const { error } = await supabaseAdmin
      .from('sessions')
      .update({ is_cancelled: true })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Session cancelled' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel session', message: error.message, success: false },
      { status: 500 }
    );
  }
}

// PATCH - Update a session
export async function PATCH(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', success: false },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Check if user owns the session
    const { data: session, error: fetchError } = await supabaseAdmin
      .from('sessions')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError || !session) {
      return NextResponse.json(
        { error: 'Session not found', success: false },
        { status: 404 }
      );
    }

    if (session.created_by !== user.id) {
      return NextResponse.json(
        { error: 'You can only update sessions you created', success: false },
        { status: 403 }
      );
    }

    const { date, time, location, topic, max_participants } = body;
    const updateData = {};
    if (date) updateData.date = date;
    if (time) updateData.time = time;
    if (location) updateData.location = location;
    if (topic) updateData.topic = topic;
    if (max_participants) updateData.max_participants = max_participants;

    const { data: updatedSession, error } = await supabaseAdmin
      .from('sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ session: updatedSession, success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update session', message: error.message, success: false },
      { status: 500 }
    );
  }
}
