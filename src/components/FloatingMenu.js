import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FloatingMenu.css';

const FloatingMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showWeChat, setShowWeChat] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAboutClick = () => {
    navigate('/about');
    setIsMenuOpen(false);
  };

  return (
    <div className="floating-menu">
      {/* Menu Items */}
      <div className={`menu-items ${isMenuOpen ? 'open' : ''}`}>
        <div className="menu-item" onClick={handleAboutClick}>
          <span className="menu-icon">ℹ️</span>
          <span className="menu-label">About Us</span>
        </div>
        
        <div className="menu-item" onClick={() => setShowWeChat(true)}>
          <span className="menu-icon">💬</span>
          <span className="menu-label">Follow us on WeChat</span>
        </div>
      </div>

      {/* Main Floating Button */}
      <button 
        className={`floating-button ${isMenuOpen ? 'open' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span className="button-icon">
          {isMenuOpen ? '✕' : '☰'}
        </span>
      </button>
      {/* WeChat QR Code Modal */}
      {showWeChat && (
        <div className="wechat-modal" onClick={() => setShowWeChat(false)}>
          <div className="wechat-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="wechat-close" onClick={() => setShowWeChat(false)}>✕</button>
            <h3>Follow us on WeChat</h3>
            <img src="/WeChatQRCode.jpg" alt="WeChat QR Code" className="wechat-qr" />
            <p>Scan the QR code to follow our official account and join the group.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingMenu;

// NOTE: We render the modal markup next to the component root so CSS overlay works cleanly.
