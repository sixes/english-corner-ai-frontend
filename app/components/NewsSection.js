'use client'

import React, { useState, useEffect } from 'react';

export default function NewsSection() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        const data = await response.json();
        
        if (data.error) {
          console.error('API Error:', data.error);
          setError(data.error);
        } else if (Array.isArray(data)) {
          setNews(data);
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <section className="news-section about-section loading">
        <div className="news-spinner"></div>
      </section>
    );
  }

  if (!news || news.length === 0) {
    return null;
  }

  return (
    <section className="news-section about-section">
      <h2>📰 Top Stories from The New York Times</h2>
      <div className="news-grid">
        {news.map((story, index) => (
          <a 
            key={index} 
            href={story.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="news-card"
          >
            {story.image && (
              <div className="news-image">
                <img 
                  src={story.image} 
                  alt={story.title}
                  loading="lazy"
                />
              </div>
            )}
            <div className="news-content">
              <span className="news-section-label">{story.section}</span>
              <h3>{story.title}</h3>
              <p>{story.abstract}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
