'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '../../lib/navigation';
import { useTransition } from 'react';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'zh' : 'en';
    startTransition(() => {
      router.replace(pathname, {locale: nextLocale});
    });
  };

  return (
    <button 
      onClick={toggleLanguage}
      className="language-switcher"
      disabled={isPending}
      aria-label="Switch Language"
    >
      <span className="lang-icon">🌐</span>
      <span className="lang-text">{locale === 'en' ? '中文' : 'English'}</span>
    </button>
  );
}
