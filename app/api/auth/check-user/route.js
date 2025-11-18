import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let adminClient;

const getAdminClient = () => {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin configuration.');
  }

  if (!adminClient) {
    adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
};

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body?.email?.trim().toLowerCase();
    const name = body?.name?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      console.error('Supabase admin listUsers error:', error);
      return NextResponse.json(
        { error: 'Failed to check existing users.' },
        { status: 500 }
      );
    }

    const users = data?.users || [];
    const emailExists = users.some(
      (user) => user.email?.toLowerCase() === email
    );

    const nameExists = name
      ? users.some((user) => {
          const fullName = (user.user_metadata?.full_name || '').trim().toLowerCase();
          return fullName && fullName === name;
        })
      : false;

    return NextResponse.json({
      emailExists,
      nameExists,
    });
  } catch (error) {
    console.error('check-user route error:', error);
    return NextResponse.json(
      { error: 'Unable to validate user information.' },
      { status: 500 }
    );
  }
}
