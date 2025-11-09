import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./ChatPage.css";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { track } from "@vercel/analytics";
import SEOHead from './components/SEOHead';
import ContentHeader from './components/ContentHeader';
import FloatingMenu from './components/FloatingMenu';
import ChatWidget from './components/ChatWidget';
import './ChatPage.css';

// Change from HTTP to HTTPS on custom port
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? "https://api.englishcorner.cyou:8443/chat"
  : "https://api.englishcorner.cyou:8443/chat"; // Same for staging, but you could use a different staging API

// Environment detection for testing
const isProduction = process.env.NODE_ENV === 'production' && !window.location.hostname.includes('preview');
const isStaging = process.env.NODE_ENV === 'production' && window.location.hostname.includes('preview');

// Generate a unique session ID based on device characteristics and timestamp
function generateSessionId() {
  const timestamp = Date.now();
  const userAgent = navigator.userAgent;
  const screenInfo = `${window.screen.width}x${window.screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const platform = navigator.platform;
  const cookieEnabled = navigator.cookieEnabled;
  const onlineStatus = navigator.onLine;
  
  // Add more device characteristics for better uniqueness
  const deviceCharacteristics = [
    userAgent,
    screenInfo,
    timezone,
    language,
    platform,
    cookieEnabled,
    onlineStatus,
    window.screen.colorDepth,
    window.screen.pixelDepth,
  ].join('-');
  
  // Create a more robust hash-like string from device characteristics
  const deviceFingerprint = btoa(deviceCharacteristics).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
  
  return `session_${deviceFingerprint}_${timestamp}`;
}

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const sessionId = useRef(null);

  // Debug function to show layout info
  const showDebugInfo = () => {
    const debugInfo = {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        visualViewport: window.visualViewport ? {
          width: window.visualViewport.width,
          height: window.visualViewport.height,
          offsetTop: window.visualViewport.offsetTop,
          offsetLeft: window.visualViewport.offsetLeft,
          scale: window.visualViewport.scale
        } : 'Not supported'
      },
      document: {
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
        scrollTop: document.documentElement.scrollTop
      },
      body: {
        scrollHeight: document.body.scrollHeight,
        clientHeight: document.body.clientHeight,
        offsetHeight: document.body.offsetHeight
      },
      userAgent: navigator.userAgent.substring(0, 100)
    };

    // Try to find message input element
    const messageInput = document.querySelector('[data-cs-message-input]') || 
                        document.querySelector('.cs-message-input') ||
                        document.querySelector('input[placeholder*="Ask me"]') ||
                        document.querySelector('input[type="text"]');
    
    if (messageInput) {
      const rect = messageInput.getBoundingClientRect();
      debugInfo.messageInput = {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height,
        isVisible: rect.bottom <= window.innerHeight && rect.top >= 0,
        isInViewport: rect.bottom > 0 && rect.top < window.innerHeight
      };
    } else {
      debugInfo.messageInput = 'Element not found';
    }

    // Check MainContainer
    const mainContainer = document.querySelector('[style*="MainContainer"]') ||
                         document.querySelector('.cs-main-container');
    if (mainContainer) {
      const rect = mainContainer.getBoundingClientRect();
      debugInfo.mainContainer = {
        top: rect.top,
        bottom: rect.bottom,
        height: rect.height,
        computedHeight: window.getComputedStyle(mainContainer).height
      };
    }

    alert('Debug Info:\n' + JSON.stringify(debugInfo, null, 2));
    
    // Also toggle debug overlay
    setShowDebug(!showDebug);
  };

  // Save chat history to localStorage
  const saveChatHistory = useCallback((messagesToSave) => {
    try {
      // Limit history to last 100 messages to prevent localStorage from getting too large
      const limitedMessages = messagesToSave.slice(-100);
      localStorage.setItem('english_corner_chat_history', JSON.stringify(limitedMessages));
    } catch (error) {
      console.error('Error saving chat history:', error);
      // If localStorage is full, try to clear some space and save limited history
      try {
        const limitedMessages = messagesToSave.slice(-50); // Even more limited
        localStorage.setItem('english_corner_chat_history', JSON.stringify(limitedMessages));
      } catch (fallbackError) {
        console.error('Failed to save even limited chat history:', fallbackError);
      }
    }
  }, []);

  // Load chat history from localStorage
  const loadChatHistory = useCallback(() => {
    try {
      const storedMessages = localStorage.getItem('english_corner_chat_history');
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        setMessages(parsedMessages);
        console.log('Chat history loaded:', parsedMessages.length, 'messages');
      } else {
        // Set initial welcome message if no history
        const welcomeMessage = {
          message: "Hi! Ask me anything about Forever English Corner.",
          sender: "bot",
          direction: "incoming",
          id: 0,
        };
        setMessages([welcomeMessage]);
        saveChatHistory([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Fallback to default welcome message
      const welcomeMessage = {
        message: "Hi! Ask me anything about Forever English Corner.",
        sender: "bot",
        direction: "incoming",
        id: 0,
      };
      setMessages([welcomeMessage]);
    }
  }, [saveChatHistory]);

  // Initialize session ID and load chat history once when component mounts
  useEffect(() => {
    // Check if we already have a session ID in localStorage (persists across browser sessions)
    let storedSessionId = localStorage.getItem('english_corner_session_id');
    
    // Also check if we have a device fingerprint to see if this is the same device
    const currentDeviceFingerprint = generateDeviceFingerprint();
    const storedDeviceFingerprint = localStorage.getItem('english_corner_device_fingerprint');
    
    // If no stored session or device fingerprint changed (different device), generate new session
    if (!storedSessionId || storedDeviceFingerprint !== currentDeviceFingerprint) {
      storedSessionId = generateSessionId();
      localStorage.setItem('english_corner_session_id', storedSessionId);
      localStorage.setItem('english_corner_device_fingerprint', currentDeviceFingerprint);
      
      // Clear old chat history for new session/device
      localStorage.removeItem('english_corner_chat_history');
      
      // Track new session creation
      track('new_session_created', {
        session_id: storedSessionId,
        device_changed: storedDeviceFingerprint !== currentDeviceFingerprint
      });
    } else {
      // Track returning session
      track('session_resumed', {
        session_id: storedSessionId
      });
    }
    
    sessionId.current = storedSessionId;
    console.log('Session ID initialized:', sessionId.current);
    
    // Track page view for SEO
    track('page_view', {
      page: 'main_chat',
      session_id: sessionId.current,
      user_agent: navigator.userAgent,
      referrer: document.referrer || 'direct',
      environment: isProduction ? 'production' : isStaging ? 'staging' : 'development',
      hostname: window.location.hostname
    });
    
    // Load chat history for this session
    loadChatHistory();
  }, [loadChatHistory]);

  // Debug useEffect for monitoring input visibility
  useEffect(() => {
    if (!showDebug) return;

    const updateDebugStatus = () => {
      const statusElement = document.getElementById('debug-input-status');
      if (!statusElement) return;

      const messageInput = document.querySelector('[data-cs-message-input]') || 
                          document.querySelector('.cs-message-input') ||
                          document.querySelector('input[placeholder*="Ask me"]') ||
                          document.querySelector('input[type="text"]');
      
      if (messageInput) {
        const rect = messageInput.getBoundingClientRect();
        const isVisible = rect.bottom <= window.innerHeight && rect.top >= 0;
        const isInViewport = rect.bottom > 0 && rect.top < window.innerHeight;
        
        statusElement.innerHTML = `Found at y:${Math.round(rect.top)}-${Math.round(rect.bottom)} | Visible:${isVisible} | InViewport:${isInViewport}`;
        statusElement.style.color = isVisible ? '#4CAF50' : '#FF6B6B';
      } else {
        statusElement.innerHTML = 'Input element not found';
        statusElement.style.color = '#FF6B6B';
      }
    };

    // Update immediately and then every 500ms
    updateDebugStatus();
    const interval = setInterval(updateDebugStatus, 500);

    // Also update on scroll and resize
    window.addEventListener('scroll', updateDebugStatus);
    window.addEventListener('resize', updateDebugStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', updateDebugStatus);
      window.removeEventListener('resize', updateDebugStatus);
    };
  }, [showDebug]);

// Generate device fingerprint for comparison (without timestamp)
function generateDeviceFingerprint() {
  const userAgent = navigator.userAgent;
  const screenInfo = `${window.screen.width}x${window.screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const platform = navigator.platform;
  
  const deviceCharacteristics = [
    userAgent,
    screenInfo,
    timezone,
    language,
    platform,
    window.screen.colorDepth,
    window.screen.pixelDepth,
  ].join('-');
  
  return btoa(deviceCharacteristics).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
}

  async function handleSend(messageText) {
    if (!messageText.trim()) return;

    // Track chat interaction start
    const startTime = performance.now();
    track('chat_message_sent', {
      message_length: messageText.length,
      session_id: sessionId.current
    });

    // Add user's message to chat
    const userMessage = {
      message: messageText,
      sender: "user",
      direction: "outgoing",
      id: messages.length,
    };
    
    const updatedMessagesWithUser = [...messages, userMessage];
    setMessages(updatedMessagesWithUser);
    saveChatHistory(updatedMessagesWithUser);

    setIsTyping(true);

    try {
      console.log("Sending question to backend:", messageText);

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: messageText,
          session_id: sessionId.current // Use the persistent session ID
        }),
      });

      if (!response.ok) {
        // Try to parse error detail from backend response
        let errorText;
        try {
          errorText = await response.text();
          console.error("Backend returned error:", response.status, errorText);
        } catch (e) {
          console.error("Failed to read backend error text:", e);
          errorText = "Could not read error details";
        }
        
        // Track error
        track('chat_error', {
          error_status: response.status,
          error_text: errorText,
          session_id: sessionId.current
        });
        
        throw new Error(`Backend error ${response.status}: ${errorText}`);
      }

      // Parse JSON response from backend
      let data;
      try {
        data = await response.json();
        console.log("Backend response data:", data);
      } catch (jsonErr) {
        console.error("Failed to parse JSON from backend:", jsonErr);
        track('chat_error', {
          error_type: 'json_parse_error',
          session_id: sessionId.current
        });
        throw new Error("Invalid JSON response from backend");
      }

      const answerMsg = data.answer || "Sorry, I couldn't find an answer.";
      const responseTime = performance.now() - startTime;

      // Track successful chat completion
      track('chat_response_received', {
        response_time_ms: Math.round(responseTime),
        response_length: answerMsg.length,
        session_id: sessionId.current,
        sources_used: data.sources_used ? data.sources_used.length : 0
      });

      // Add AI assistant's answer to chat
      const botMessage = {
        message: answerMsg,
        sender: "bot",
        direction: "incoming",
        id: updatedMessagesWithUser.length,
      };

      const finalMessages = [...updatedMessagesWithUser, botMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } catch (error) {
      console.error("Error fetching answer:", error);
      
      const responseTime = performance.now() - startTime;
      track('chat_error', {
        error_message: error.message,
        response_time_ms: Math.round(responseTime),
        session_id: sessionId.current
      });

      // Show detailed error messages in chat for debugging
      const errorMessage = {
        message: `Oops! Something went wrong.\n${error.message}`,
        sender: "bot",
        direction: "incoming",
        id: updatedMessagesWithUser.length,
      };
      
      const finalMessages = [...updatedMessagesWithUser, errorMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div style={{ 
      height: "100vh", 
      width: "100%",
      display: "flex",
      flexDirection: "column"
    }}>
      <SEOHead />
      
      {/* Debug Button */}
      <button 
        onClick={showDebugInfo}
        style={{
          position: "fixed",
          top: "10px",
          left: "10px",
          zIndex: 9999,
          backgroundColor: "#ff4444",
          color: "white",
          border: "none",
          padding: "8px 12px",
          borderRadius: "4px",
          fontSize: "12px",
          cursor: "pointer"
        }}
      >
        DEBUG
      </button>

      {/* Debug Overlay */}
      {showDebug && (
        <div style={{
          position: "fixed",
          top: "50px",
          left: "10px",
          right: "10px",
          backgroundColor: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "10px",
          zIndex: 9998,
          fontSize: "11px",
          fontFamily: "monospace",
          borderRadius: "4px",
          maxHeight: "200px",
          overflow: "auto"
        }}>
          <div>Viewport: {window.innerWidth}x{window.innerHeight}</div>
          <div>Visual Viewport: {window.visualViewport ? 
            `${window.visualViewport.width}x${window.visualViewport.height} offset:${window.visualViewport.offsetTop}` : 
            'Not supported'}</div>
          <div>User Agent: {navigator.userAgent.includes('iPhone') ? 'iPhone' : 'Other'}</div>
          <div style={{marginTop: '5px', borderTop: '1px solid #666', paddingTop: '5px'}}>
            Input Status: <span id="debug-input-status">Checking...</span>
          </div>
        </div>
      )}

      {/* Staging Environment Indicator */}
      {isStaging && (
        <div style={{
          background: 'linear-gradient(90deg, #ff6b6b, #feca57)',
          color: 'white',
          padding: '8px',
          textAlign: 'center',
          fontWeight: 'bold',
          zIndex: 1000,
          fontSize: '0.9rem',
          flexShrink: 0
        }}>
          🚧 STAGING ENVIRONMENT - Testing SEO Improvements 🚧
        </div>
      )}
      
      {/* Header - FIXED at top */}
      <ContentHeader />
      
      {/* Chat area - fills remaining space and is scrollable */}
      <div style={{ 
        flex: 1,
        minHeight: 0, // Important: allows flex child to shrink below content size
        position: "relative",
        paddingTop: "60px" // Space for fixed header
      }}>
        <MainContainer responsive>
          <ChatContainer>
            <MessageList
              typingIndicator={isTyping ? <TypingIndicator content="Forever English Corner is typing" /> : null}
            >
              {messages.map(({ id, message, sender, direction }) => (
                <Message key={id} model={{ message, sender, direction }} />
              ))}
            </MessageList>
            <MessageInput 
              placeholder="Ask me about Forever English Corner..." 
              onSend={handleSend}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                zIndex: 1000,
                background: 'white',
                borderTop: '1px solid #e0e0e0',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
                margin: 0,
                boxSizing: 'border-box',
                height: '40px',
                minHeight: '40px',
                maxHeight: '40px'
              }}
              attachButton={false}
              sendButton={true}
              sendOnReturnDisabled={false}
              autoFocus={false}
            />
            {/* Small chat widget placed above the input row within the chat container */}
            <ChatWidget position="aboveInput" />
          </ChatContainer>
        </MainContainer>
      </div>
      
      {/* Floating Menu for Additional Information */}
      <FloatingMenu />
      
      <SpeedInsights />
      <Analytics />
    </div>
  );
}

export default ChatPage;

