'use client'

import { useState, useEffect } from 'react';
import './Navigation.css';

export default function Navigation() {
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
    { id: 'sessions', label: '📅 Sessions' },
    { id: 'what-we-offer', label: '🎯 What We Offer' },
    { id: 'location', label: '📍 Location' },
    { id: 'community', label: '🌍 Community' },
    { id: 'join', label: '🚀 How to Join' },
    { id: 'why-choose', label: '🌟 Why Choose Us' },
    { id: 'founders', label: '👥 Founders' },
    { id: 'alternatives', label: '🌐 Alternatives' },
    { id: 'faq', label: '🤖 Questions?' },
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
