'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './ChatWidget.css';

// position: 'fixed' (default) or 'aboveInput' (absolute positioned inside chat)
const ChatWidget = ({ position = 'fixed' }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const openChat = () => {
    // Navigate to the main chat page and ensure it's in view
    router.push('/chat');
    setIsOpen(false);
  };

  const classes = ['chat-widget'];
  if (position === 'aboveInput') classes.push('above-input');
  if (isOpen) classes.push('open');

  return (
    <div className={classes.join(' ')}>
      <button
        className="chat-bubble"
        aria-label="Chat with AI"
        onClick={openChat}
        title="Chat with AI"
      >
        💬
      </button>
      {/* optional label when expanded (kept minimal) */}
      <div className="chat-label">Chat with AI</div>
    </div>
  );
};

export default ChatWidget;
