import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './About.css';
import ChatWidget from './ChatWidget';

const About = () => {
  const navigate = useNavigate();

  const handleBackToChat = () => {
    navigate('/');
  };
  return (
    <div className="about-page">
      <div className="about-header">
        <h1>About Forever English Corner</h1>
        <p className="about-subtitle">
          Shenzhen's longest-running English practice community since 2017
        </p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>🎯 What We Offer</h2>
          <div className="content-grid">
            <div className="feature-card">
              <h3>Self-Introduction Practice</h3>
              <p>30 minutes of structured speaking practice to build confidence</p>
            </div>
            <div className="feature-card">
              <h3>Interactive Games</h3>
              <p>"One Truth, One Lie" and other engaging activities</p>
            </div>
            <div className="feature-card">
              <h3>Topic Discussions</h3>
              <p>Weekly themed conversations on diverse subjects</p>
            </div>
            <div className="feature-card">
              <h3>Cultural Exchange</h3>
              <p>Meet people from around the world and share experiences</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>📍 Location & Schedule</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>Venue</h3>
              <p><strong>Starbucks (联通大厦店)</strong></p>
              <p>Near Futian Station (subway station)</p>
              <ul>
                <li>Metro Lines 2, 3, and 11 intersection</li>
                <li>Central business district location</li>
                <li>Comfortable environment with WiFi</li>
              </ul>
            </div>
            <div className="info-card">
              <h3>Regular Sessions</h3>
              <p><strong>Wednesdays & Fridays</strong></p>
              <p>19:30 - 22:00 (2.5 hours)</p>
              <p className="highlight">Always Free to Join!</p>
            </div>
            <div className="info-card">
              <h3>Special Game Sessions</h3>
              <p><strong>Some Sundays</strong></p>
              <p>9:30 start time</p>
              <p>Location: Shenzhen North Station</p>
            </div>
          </div>
        </section>

        <section className="about-section">
            <h2>👥 Our International Community</h2>
          <p>Join our diverse community with members from around the world:</p>
          <div className="countries-grid">
            {
              // Build and sort the list alphabetically by country name so it's easier to scan
              useMemo(() => {
                const countries = [
                  { name: 'Germany', flag: '🇩🇪' },
                  { name: 'Australia', flag: '🇦🇺' },
                  { name: 'Mongolia', flag: '🇲🇳' },
                  { name: 'South Korea', flag: '🇰🇷' },
                  { name: 'Hong Kong', flag: '🇭🇰' },
                  { name: 'Taiwan', flag: '🇹🇼' },
                  { name: 'United Kingdom', flag: '🇬🇧' },
                  { name: 'United States', flag: '🇺🇸' },
                  { name: 'Russia', flag: '🇷🇺' },
                  { name: 'China', flag: '🇨🇳' },
                ];

                return countries
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((c) => (
                    <div className="country-item" key={c.name}>{c.flag} {c.name}</div>
                  ));
              }, [])
            }
          </div>
        </section>

        <section className="about-section">
          <h2>🚀 How to Join</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Follow WeChat Official Account</h3>
                <p>Search for: <strong>深圳英语角</strong></p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Add Volunteer Contact</h3>
                <p>Scan the QR code to add our volunteer</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Send Self-Introduction</h3>
                <p>Record a 1-minute voice message introducing yourself</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Get Invited</h3>
                <p>Receive invitation to "Language Exchange 2" WeChat group</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">5</div>
              <div className="step-content">
                <h3>Join Us!</h3>
                <p>Read the group notice and come to our next session</p>
              </div>
            </div>
          </div>
          
          <div className="requirements">
            <h3>Requirements</h3>
            <ul>
              <li>Basic English communication skills</li>
              <li>Age 18+ (we've had members over 80!)</li>
              <li>Respectful and friendly attitude</li>
              <li>Willingness to practice and learn</li>
            </ul>
          </div>
        </section>

        <section className="about-section">
          <h2>🌟 Why Choose Forever English Corner?</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <h3>🕰️ Established Community</h3>
              <p>Running strong since 2017 with consistent quality</p>
            </div>
            <div className="benefit-item">
              <h3>🌍 International Environment</h3>
              <p>Practice with native speakers and global learners</p>
            </div>
            <div className="benefit-item">
              <h3>💰 Completely Free</h3>
              <p>No fees, no hidden costs - just bring yourself!</p>
            </div>
            <div className="benefit-item">
              <h3>📍 Prime Location</h3>
              <p>Easy to reach via multiple subway lines</p>
            </div>
            <div className="benefit-item">
              <h3>🎭 Engaging Activities</h3>
              <p>Structured games and discussions keep it fun</p>
            </div>
            <div className="benefit-item">
              <h3>🤝 Supportive Atmosphere</h3>
              <p>Welcoming environment for all skill levels</p>
            </div>
          </div>
        </section>

        <section className="about-section cta-section">
          <h2>🤖 Still Have Questions?</h2>
          <p>
            Our AI assistant is here to help! Ask about session schedules, topics, 
            location details, or any other questions you might have about Forever English Corner.
          </p>
          <button 
            className="back-to-chat-btn"
            onClick={handleBackToChat}
          >
            Chat with AI Assistant
          </button>
        </section>
      
  {/* Floating chat widget: visible only on About page */}
  <ChatWidget />
      </div>
    </div>
  );
};

export default About;
