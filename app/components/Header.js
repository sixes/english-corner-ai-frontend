'use client'

import React, { useState, useEffect } from 'react';
import { Link, useRouter } from '../../lib/navigation';
import { useTranslations } from 'next-intl';
import { supabase } from '../../lib/supabase';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const t = useTranslations('header');
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  return (
    <header className="site-header">
      <div className="header-content">
        <Link href="/" className="header-logo">
          {t('logo')}
        </Link>

        <nav className="header-nav">
          <LanguageSwitcher />

          {loading ? (
            <span className="auth-loading">...</span>
          ) : user ? (
            <div className="user-menu">
              <span className="user-name">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </span>
              <button onClick={handleSignOut} className="auth-btn sign-out-btn">
                {t('signOut')}
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link href="/auth" className="auth-btn sign-in-btn">
                {t('signIn')}
              </Link>
              <Link href="/auth?signup=true" className="auth-btn sign-up-btn">
                {t('signUp')}
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
