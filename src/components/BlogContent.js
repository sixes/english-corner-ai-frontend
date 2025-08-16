import React from 'react';

const BlogContent = () => {
  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '40px 20px',
      backgroundColor: '#f8f9fa'
    }}>
      <article>
        <header>
          <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#333' }}>
            Why Join Forever English Corner in Shenzhen?
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: '1.6' }}>
            Discover Shenzhen's most established English learning community, running strong since 2017
          </p>
        </header>

        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#444' }}>
            🌟 What Makes Us Special
          </h3>
          <p style={{ lineHeight: '1.7', marginBottom: '15px' }}>
            Forever English Corner has been fostering international friendships and English fluency in Shenzhen 
            for over 7 years. Our community brings together locals and expats from around the world for authentic 
            English practice in a relaxed, supportive environment.
          </p>
          <p style={{ lineHeight: '1.7', marginBottom: '15px' }}>
            Whether you're a beginner looking to build confidence or an advanced speaker wanting to maintain fluency, 
            our weekly sessions provide the perfect opportunity to practice English with native speakers and fellow learners.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#444' }}>
            📍 Prime Location: Futian Station
          </h3>
          <p style={{ lineHeight: '1.7', marginBottom: '15px' }}>
            We meet at Starbucks (联通大厦店) near Futian Station, one of Shenzhen's most accessible locations. 
            The venue is easily reachable by multiple subway lines, making it convenient for participants from 
            across the city.
          </p>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.7' }}>
            <li>Metro Lines 1, 2, 3, and 11 intersection</li>
            <li>Central business district location</li>
            <li>Comfortable Starbucks environment</li>
            <li>Free WiFi and refreshments available</li>
          </ul>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#444' }}>
            🎯 Structured Learning Experience
          </h3>
          <p style={{ lineHeight: '1.7', marginBottom: '15px' }}>
            Each 2.5-hour session is carefully designed to maximize learning and fun:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <h4 style={{ color: '#667eea', marginBottom: '10px' }}>🗣️ Self-Introduction (30 min)</h4>
              <p style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                Each participant introduces themselves, building confidence and speaking fluency in a supportive environment.
              </p>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <h4 style={{ color: '#667eea', marginBottom: '10px' }}>🎲 Interactive Games (60 min)</h4>
              <p style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                Our signature "One Truth, One Lie" game and other activities make learning engaging and memorable.
              </p>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <h4 style={{ color: '#667eea', marginBottom: '10px' }}>💬 Topic Discussion (60 min)</h4>
              <p style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                Weekly themed discussions on diverse topics from culture to current events, improving vocabulary and critical thinking.
              </p>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#444' }}>
            🌍 International Community
          </h3>
          <p style={{ lineHeight: '1.7', marginBottom: '15px' }}>
            Connect with people from diverse backgrounds and cultures. Our community includes professionals, 
            students, entrepreneurs, and travelers from countries including Germany, Australia, South Korea, 
            Hong Kong, Taiwan, UK, USA, Russia, and many more.
          </p>
          <p style={{ lineHeight: '1.7', marginBottom: '15px' }}>
            Ages range from 18 to 80+, creating a unique intergenerational learning environment where everyone 
            contributes their unique perspective and experience.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#444' }}>
            ⭐ Success Stories & Community Impact
          </h3>
          <p style={{ lineHeight: '1.7', marginBottom: '15px' }}>
            Over the years, thousands of participants have improved their English skills, built lasting friendships, 
            and expanded their professional networks through Forever English Corner. Many have gone on to:
          </p>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.7' }}>
            <li>Advance in their careers with improved English communication</li>
            <li>Study abroad in English-speaking countries</li>
            <li>Start international businesses and partnerships</li>
            <li>Build lifelong friendships across cultures</li>
            <li>Gain confidence in public speaking and presentation</li>
          </ul>
        </section>

        <section>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#444' }}>
            🚀 Ready to Join Us?
          </h3>
          <p style={{ lineHeight: '1.7', marginBottom: '15px' }}>
            Getting started is easy! Follow our WeChat Official Account (深圳英语角) to stay updated on 
            session topics and connect with our community. Our AI assistant above can answer any specific 
            questions about schedules, location details, or what to expect at your first session.
          </p>
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '25px',
            borderRadius: '15px',
            textAlign: 'center',
            marginTop: '20px'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>📅 Next Session</h4>
            <p style={{ margin: '0', fontSize: '1.1rem' }}>
              Every Wednesday & Friday, 19:30-22:00<br/>
              Starbucks, Futian Station, Shenzhen<br/>
              <strong>Free to join!</strong>
            </p>
          </div>
        </section>
      </article>
    </div>
  );
};

export default BlogContent;
