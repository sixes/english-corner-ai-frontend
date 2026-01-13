'use client'

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import './Navigation.css';

export default function Navigation() {
  const t = useTranslations('navigation');
  const [activeSection, setActiveSection] = useState('sessions');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['sessions', 'what-we-offer', 'location', 'community', 'join', 'why-choose', 'founders', 'alternatives', 'faq'];
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 130 && rect.bottom > 130) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 130;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: elementPosition, behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const navItems = [
    { id: 'sessions', label: t('sessions') },
    { id: 'what-we-offer', label: t('whatWeOffer') },
    { id: 'location', label: t('location') },
    { id: 'community', label: t('community') },
    { id: 'join', label: t('join') },
    { id: 'why-choose', label: t('whyChoose') },
    { id: 'founders', label: t('founders') },
    { id: 'alternatives', label: t('alternatives') },
    { id: 'faq', label: t('faq') },
  ];

  return (
    <>
      <nav className="page-nav">
        <div className="nav-container">
          <button 
            className="nav-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
          
          <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
            {navItems.map(item => (
              <li key={item.id}>
                <button
                  className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => scrollToSection(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
