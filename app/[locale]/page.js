'use client'

import React, { useMemo } from 'react';
import { Link } from '../../lib/navigation';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import '../About.css';
import ChatWidget from '../components/ChatWidget';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import EmblaCarousel from '../components/EmblaCarousel';
import QuoteSection from '../components/QuoteSection';
import NewsSection from '../components/NewsSection';

const Sessions = dynamic(() => import('../components/Sessions'), {
  ssr: false,
  loading: () => <div className="sessions-loading">Loading sessions...</div>
});

export default function Home() {
  const t = useTranslations('home');
  const tCountries = useTranslations('countries');

  const photos = [
    '/images/gallery/1.jpg',
    '/images/gallery/2.jpg',
    '/images/gallery/3.jpg',
    '/images/gallery/4.jpg',
    '/images/gallery/5.jpg',
    '/images/gallery/6.jpg',
    '/images/gallery/7.jpg',
  ];

  return (
    <div className="about-page">
      <Header />
      <Navigation />
      
      <div className="about-content">
        <div className="carousel-container">
          <EmblaCarousel slides={photos} />
        </div>

        {/* Quote Section */}
        <QuoteSection />

        {/* News Section */}
        <NewsSection />

        {/* Sessions Section - First */}
        <div id="sessions">
          <Sessions />
        </div>
        
        {/* Divider */}
        <div style={{ margin: '3rem 0', borderTop: '2px solid #e0e0e0' }}></div>
        <section id="what-we-offer" className="about-section">
          <h2>{t('sections.whatWeOffer.title')}</h2>
          <div className="content-grid">
            <div className="feature-card">
              <h3>{t('sections.whatWeOffer.selfIntro.title')}</h3>
              <p>{t('sections.whatWeOffer.selfIntro.desc')}</p>
            </div>
            <div className="feature-card">
              <h3>{t('sections.whatWeOffer.games.title')}</h3>
              <p>{t('sections.whatWeOffer.games.desc')}</p>
            </div>
            <div className="feature-card">
              <h3>{t('sections.whatWeOffer.topics.title')}</h3>
              <p>{t('sections.whatWeOffer.topics.desc')}</p>
            </div>
            <div className="feature-card">
              <h3>{t('sections.whatWeOffer.cultural.title')}</h3>
              <p>{t('sections.whatWeOffer.cultural.desc')}</p>
            </div>
          </div>
        </section>

        <section id="location" className="about-section">
          <h2>{t('sections.location.title')}</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>{t('sections.location.weekly.title')}</h3>
              <p><strong>{t('sections.location.weekly.frequency')}</strong></p>
              <p>{t('sections.location.weekly.days')}</p>
              <p>{t('sections.location.weekly.time')}</p>
              <p className="highlight">{t('sections.location.weekly.free')}</p>
            </div>
            <div className="info-card">
              <h3>{t('sections.location.wednesday.title')}</h3>
              <p><strong>{t('sections.location.wednesday.name')}</strong></p>
              <p>{t('sections.location.wednesday.landmark')}</p>
              <ul>
                <li>{t('sections.location.wednesday.details.0')}</li>
                <li>{t('sections.location.wednesday.details.1')}</li>
              </ul>
            </div>
            <div className="info-card">
              <h3>{t('sections.location.friday.title')}</h3>
              <p><strong>{t('sections.location.friday.name')}</strong></p>
              <p>{t('sections.location.friday.location')}</p>
              <ul>
                <li>{t('sections.location.friday.details.0')}</li>
                <li>{t('sections.location.friday.details.1')}</li>
              </ul>
            </div>
          </div>
          <p className="schedule-note" style={{marginTop: '1rem', fontStyle: 'italic', textAlign: 'center', color: '#666'}}>
            {t('sections.location.note')}
          </p>
        </section>

        <section id="community" className="about-section">
            <h2>{t('sections.community.title')}</h2>
          <p>{t('sections.community.intro')}</p>
          <div className="countries-grid">
            {
              // Build and sort the list alphabetically by country name so it's easier to scan
              useMemo(() => {
                const countries = [
                  { name: tCountries('Germany'), flag: '🇩🇪' },
                  { name: tCountries('Australia'), flag: '🇦🇺' },
                  { name: tCountries('Mongolia'), flag: '🇲🇳' },
                  { name: tCountries('South Korea'), flag: '🇰🇷' },
                  { name: tCountries('Hong Kong'), flag: '🇭🇰' },
                  { name: tCountries('Taiwan'), flag: '🇹🇼' },
                  { name: tCountries('United Kingdom'), flag: '🇬🇧' },
                  { name: tCountries('United States'), flag: '🇺🇸' },
                  { name: tCountries('Russia'), flag: '🇷🇺' },
                  { name: tCountries('China'), flag: '🇨🇳' },
                ];

                return countries
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((c) => (
                    <div className="country-item" key={c.name}>{c.flag} {c.name}</div>
                  ));
              }, [tCountries])
            }
          </div>
        </section>

        <section id="join" className="about-section">
          <h2>{t('sections.join.title')}</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>{t('sections.join.step1.title')}</h3>
                <p>{t('sections.join.step1.desc')}<strong>深圳英语角</strong></p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>{t('sections.join.step2.title')}</h3>
                <p>{t('sections.join.step2.desc')}</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>{t('sections.join.step3.title')}</h3>
                <p>{t('sections.join.step3.desc')}</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>{t('sections.join.step4.title')}</h3>
                <p>{t('sections.join.step4.desc')}</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">5</div>
              <div className="step-content">
                <h3>{t('sections.join.step5.title')}</h3>
                <p>{t('sections.join.step5.desc')}</p>
              </div>
            </div>
          </div>
          
          <div className="requirements">
            <h3>{t('sections.join.requirements.title')}</h3>
            <ul>
              <li>{t('sections.join.requirements.list.0')}</li>
              <li>{t('sections.join.requirements.list.1')}</li>
              <li>{t('sections.join.requirements.list.2')}</li>
              <li>{t('sections.join.requirements.list.3')}</li>
            </ul>
          </div>
        </section>

        <section id="why-choose" className="about-section">
          <h2>{t('sections.whyChoose.title')}</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <h3>{t('sections.whyChoose.established.title')}</h3>
              <p>{t('sections.whyChoose.established.desc')}</p>
            </div>
            <div className="benefit-item">
              <h3>{t('sections.whyChoose.international.title')}</h3>
              <p>{t('sections.whyChoose.international.desc')}</p>
            </div>
            <div className="benefit-item">
              <h3>{t('sections.whyChoose.free.title')}</h3>
              <p>{t('sections.whyChoose.free.desc')}</p>
            </div>
            <div className="benefit-item">
              <h3>{t('sections.whyChoose.location.title')}</h3>
              <p>{t('sections.whyChoose.location.desc')}</p>
            </div>
            <div className="benefit-item">
              <h3>{t('sections.whyChoose.engaging.title')}</h3>
              <p>{t('sections.whyChoose.engaging.desc')}</p>
            </div>
            <div className="benefit-item">
              <h3>{t('sections.whyChoose.supportive.title')}</h3>
              <p>{t('sections.whyChoose.supportive.desc')}</p>
            </div>
          </div>
        </section>

        <section id="founders" className="about-section">
          <h2>{t('sections.founders.title')}</h2>
          <div className="founder-cards">
            <div className="founder-card">
              <div className="founder-emoji">👨‍💼</div>
              <h3>{t('sections.founders.eric.title')}</h3>
              <p>
                {t('sections.founders.eric.desc1')}<strong>Uncle Eric</strong>{t('sections.founders.eric.desc2')}<strong>2017</strong>{t('sections.founders.eric.desc3')}<strong>Tony</strong>{t('sections.founders.eric.desc4')}
              </p>
            </div>
            <div className="founder-card">
              <div className="founder-emoji">💻</div>
              <h3>{t('sections.founders.tony.title')}</h3>
              <p>
                {t('sections.founders.tony.desc1')}<strong>Tony</strong>{t('sections.founders.tony.desc2')}
              </p>
            </div>
            <div className="founder-card mystery-card">
              <div className="founder-emoji">🤔</div>
              <h3>{t('sections.founders.daniel.title')}</h3>
              <p dangerouslySetInnerHTML={{ __html: t.raw('sections.founders.daniel.desc').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
          </div>
        </section>

        <section id="alternatives" className="about-section">
          <h2>{t('sections.alternatives.title')}</h2>
          <p className="alternative-intro">
            {t('sections.alternatives.intro')}
          </p>
          <div className="alternatives-grid">
            <div className="alternative-card">
              <h3>{t('sections.alternatives.evergreen.title')}</h3>
              <p>
                {t('sections.alternatives.evergreen.desc')}
              </p>
              <p className="contact-info">
                <strong>{t('sections.alternatives.evergreen.contact')}</strong> IVY英语角
              </p>
            </div>
            <div className="alternative-card">
              <h3>{t('sections.alternatives.trivial.title')}</h3>
              <p>
                {t('sections.alternatives.trivial.desc')}
              </p>
              <p className="contact-info">
                <strong>{t('sections.alternatives.trivial.contact')}</strong> Quhuo (在取伙上搜索)
              </p>
            </div>
          </div>
          <p className="alternatives-note">
            {t('sections.alternatives.note')}
          </p>
        </section>

        <section id="faq" className="about-section cta-section">
          <h2>{t('sections.faq.title')}</h2>
          <p>
            {t('sections.faq.text')}
          </p>
          <Link href="/chat">
            <button className="back-to-chat-btn">
              {t('sections.faq.button')}
            </button>
          </Link>
        </section>
      
        {/* Floating chat widget: visible only on About page */}
        <ChatWidget />
      </div>
    </div>
  );
}
