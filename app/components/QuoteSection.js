'use client'

import React, { useState, useEffect } from 'react';

export default function QuoteSection() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch('/api/quote');
        const data = await response.json();
        if (data && data[0]) {
          setQuote(data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch quote:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, []);

  if (loading) {
    return (
      <section className="quote-section about-section loading">
        <div className="quote-spinner"></div>
      </section>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <section className="quote-section about-section">
      <h2>💬 Quote of the Day</h2>
      <div className="quote-container">
        <div className="quote-mark">"</div>
        <blockquote className="quote-text">
          {quote.q}
        </blockquote>
        <cite className="quote-author">— {quote.a}</cite>
      </div>
    </section>
  );
}
