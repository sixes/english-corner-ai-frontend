import React, { useState } from 'react';
import './ContentHeader.css';

const ContentHeader = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="content-header">
      <div className="hero-section">
        <h1>Forever English Corner AI Assistant</h1>
        <p className="hero-subtitle">
          Your 24/7 AI guide to Shenzhen's longest-running English practice community
        </p>
        
        <div className="quick-info">
          <div className="info-item">
            <span className="icon">📅</span>
            <span>Every Wed & Fri, 19:30-22:00</span>
          </div>
          <div className="info-item">
            <span className="icon">📍</span>
            <span>Starbucks, Futian Station, Shenzhen</span>
          </div>
          <div className="info-item">
            <span className="icon">💰</span>
            <span>Free to Join</span>
          </div>
          <div className="info-item">
            <span className="icon">🌍</span>
            <span>International Community</span>
          </div>
        </div>
      </div>

      <div className={`expandable-content ${isExpanded ? 'expanded' : ''}`}>
        <button 
          className="expand-button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Show Less ▲' : 'Learn More About English Corner ▼'}
        </button>
        
        {isExpanded && (
          <div className="detailed-content">
            <div className="content-grid">
              <div className="content-section">
                <h3>🎯 What We Offer</h3>
                <ul>
                  <li><strong>Self-Introduction Practice:</strong> 30 minutes of structured speaking practice</li>
                  <li><strong>Interactive Games:</strong> "One Truth, One Lie" and other engaging activities</li>
                  <li><strong>Topic Discussions:</strong> Weekly themed conversations on diverse subjects</li>
                  <li><strong>Cultural Exchange:</strong> Meet people from around the world</li>
                </ul>
              </div>

              <div className="content-section">
                <h3>📍 Location & Schedule</h3>
                <p><strong>Venue:</strong> Starbucks (联通大厦店) near Futian Station (subway station)</p>
                <p><strong>Regular Sessions:</strong> Wednesdays & Fridays, 19:30-22:00</p>
                <p><strong>Game Sessions:</strong> Some Sundays at 9:30, Shenzhen North Station</p>
                <p><strong>Duration:</strong> 2.5 hours per session</p>
              </div>

              <div className="content-section">
                <h3>👥 Community</h3>
                <p>Join our diverse international community with members from:</p>
                <ul className="country-list">
                  <li>🇩🇪 Germany</li>
                  <li>🇦🇺 Australia</li>
                  <li>🇰🇷 South Korea</li>
                  <li>🇭🇰 Hong Kong</li>
                  <li>🇹🇼 Taiwan</li>
                  <li>🇬🇧 UK</li>
                  <li>🇺🇸 USA</li>
                  <li>🇷🇺 Russia</li>
                  <li>🇨🇳 China</li>
                </ul>
              </div>

              <div className="content-section">
                <h3>🚀 How to Join</h3>
                <ol>
                  <li>Follow WeChat Official Account: <strong>深圳英语角</strong></li>
                  <li>Add volunteer contact by scanning QR code</li>
                  <li>Send 1-minute self-introduction voice message</li>
                  <li>Get invited to "Language Exchange 2" WeChat group</li>
                  <li>Read group notice and join us!</li>
                </ol>
                <p className="note">
                  <strong>Note:</strong> We welcome all levels but require basic English communication skills. 
                  Age requirement: 18+ (we've had members over 80!)
                </p>
              </div>
            </div>

            <div className="cta-section">
              <h3>🤖 Ask Our AI Assistant</h3>
              <p>
                Not sure about something? Our AI assistant below knows everything about Forever English Corner! 
                Ask about session schedules, topics, location details, or any other questions you might have.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentHeader;
