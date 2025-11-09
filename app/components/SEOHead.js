import { useEffect } from 'react';

const SEOHead = ({ 
  title = "Forever English Corner AI - Free English Learning & Practice in Shenzhen",
  description = "Join Forever English Corner in Shenzhen! Free weekly English practice sessions at Futian Station. AI-powered chat assistant to help with English learning, session info, and community questions. Over 7 years of helping English learners!",
  keywords = "English Corner Shenzhen, English practice, language exchange, Futian Station, English learning, AI assistant, conversation practice, international community, free English classes",
  canonical = "https://www.englishcorner.cyou",
  ogImage = "https://www.englishcorner.cyou/og-image.jpg"
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Function to update or create meta tag
    const updateMetaTag = (name, content, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let tag = document.querySelector(selector);
      
      if (!tag) {
        tag = document.createElement('meta');
        if (property) {
          tag.setAttribute('property', name);
        } else {
          tag.setAttribute('name', name);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };
    
    // Function to update or create link tag
    const updateLinkTag = (rel, href) => {
      let tag = document.querySelector(`link[rel="${rel}"]`);
      if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', rel);
        document.head.appendChild(tag);
      }
      tag.setAttribute('href', href);
    };
    
    // Update basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Update Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:url', canonical, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:site_name', 'Forever English Corner', true);
    updateMetaTag('og:locale', 'en_US', true);
    
    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);
    
    // Update canonical link
    updateLinkTag('canonical', canonical);
    
    // Cleanup function
    return () => {
      // Optionally clean up dynamic meta tags when component unmounts
      // (Usually not needed for SPA, but good practice)
    };
  }, [title, description, keywords, canonical, ogImage]);

  // This component doesn't render anything
  return null;
};

export default SEOHead;
