import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({ 
  title = "Forever English Corner AI - Free English Learning & Practice in Shenzhen",
  description = "Join Forever English Corner in Shenzhen! Free weekly English practice sessions at Futian Station. AI-powered chat assistant to help with English learning, session info, and community questions. Over 7 years of helping English learners!",
  keywords = "English Corner Shenzhen, English practice, language exchange, Futian Station, English learning, AI assistant, conversation practice, international community, free English classes",
  canonical = "https://www.englishcorner.cyou",
  ogImage = "https://www.englishcorner.cyou/og-image.jpg"
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      
      {/* Twitter */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEOHead;
