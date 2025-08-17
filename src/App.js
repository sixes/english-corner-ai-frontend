import React, { useState, useEffect, useRef } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  ConversationHeader,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { track } from "@vercel/analytics";

// Change from HTTP to HTTPS on custom port
const BACKEND_URL = "https://api.englishcorner.cyou:8443/chat";

// Generate a unique session ID based on device characteristics
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

function App() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});

  // Auto-scroll to bottom function
  const scrollToBottom = () => {
    // Use a more direct approach to find the scrollable MessageList container
    setTimeout(() => {
      const messageListElement = document.querySelector('[class*="MessageList"]') || 
                                 document.querySelector('.cs-message-list') ||
                                 document.querySelector('[data-testid="message-list"]') ||
                                 document.querySelector('div[style*="overflow"]');
      
      if (messageListElement) {
        messageListElement.scrollTop = messageListElement.scrollHeight;
      }
    }, 100); // Small delay to ensure DOM is updated
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Calculate dynamic heights for mobile compatibility
  const calculateMessageListHeight = () => {
    const windowHeight = window.innerHeight;
    const visualHeight = window.visualViewport ? window.visualViewport.height : windowHeight;
    const headerHeight = 56; // Fixed header height
    const inputHeight = 56;  // Fixed input height
    const extraSpace = 80;   // Extra space above input for better UX
    
    // Use visual viewport if available (better for mobile browsers)
    const effectiveHeight = window.visualViewport ? visualHeight : windowHeight;
    
    // Get safe area insets if available
    const safeAreaTop = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top').replace('px', '')) || 0;
    const safeAreaBottom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom').replace('px', '')) || 0;
    
    const messageListHeight = effectiveHeight - headerHeight - inputHeight - extraSpace - safeAreaTop - safeAreaBottom;
    
    return Math.max(messageListHeight, 200); // Minimum 200px height
  };

  const [messageListHeight, setMessageListHeight] = useState(calculateMessageListHeight());
  const sessionId = useRef(null);

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
    
    // Load chat history for this session
    loadChatHistory();
    
    // Update debug info
    updateDebugInfo();
  }, []);

  // Update debug info function
  const updateDebugInfo = () => {
    // Get actual element measurements - try multiple selector strategies
    const messageListElement = document.querySelector('[class*="MessageList"]') || 
                              document.querySelector('.cs-message-list') ||
                              document.querySelector('[data-testid="message-list"]') ||
                              document.querySelector('.message-list') ||
                              document.querySelector('div[style*="overflow"]'); // Fallback to scrollable div
    
    const messageInputElement = document.querySelector('[class*="MessageInput"]') || 
                               document.querySelector('.cs-message-input') ||
                               document.querySelector('[data-testid="message-input"]') ||
                               document.querySelector('.message-input') ||
                               document.querySelector('input[type="text"]'); // Fallback to text input
    
    const headerElement = document.querySelector('[class*="ConversationHeader"]') ||
                         document.querySelector('.cs-conversation-header') ||
                         document.querySelector('[data-testid="conversation-header"]') ||
                         document.querySelector('.conversation-header') ||
                         document.querySelector('header'); // Fallback to any header
    
    const mainContainerElement = document.querySelector('[class*="MainContainer"]') ||
                                document.querySelector('.cs-main-container') ||
                                document.querySelector('[data-testid="main-container"]') ||
                                document.querySelector('.main-container') ||
                                document.querySelector('#root > div'); // Fallback to root child
    
    const chatContainerElement = document.querySelector('[class*="ChatContainer"]') ||
                                document.querySelector('.cs-chat-container') ||
                                document.querySelector('[data-testid="chat-container"]') ||
                                document.querySelector('.chat-container');
    
    const spacerElement = document.querySelector('div[style*="120px"], div[style*="80px"]'); // Find our debug spacer
    
    // Debug: Log all found elements
    console.log('Debug Element Detection:', {
      messageList: messageListElement ? messageListElement.className : 'NOT FOUND',
      messageInput: messageInputElement ? messageInputElement.className : 'NOT FOUND',
      header: headerElement ? headerElement.className : 'NOT FOUND',
      mainContainer: mainContainerElement ? mainContainerElement.className : 'NOT FOUND',
      chatContainer: chatContainerElement ? chatContainerElement.className : 'NOT FOUND'
    });
    
    // Get all message elements - try multiple strategies
    const messageElements = document.querySelectorAll('[class*="Message"]') ||
                           document.querySelectorAll('.cs-message') ||
                           document.querySelectorAll('[data-testid*="message"]') ||
                           document.querySelectorAll('.message');
    
    let totalMessagesHeight = 0;
    messageElements.forEach(msg => {
      totalMessagesHeight += msg.offsetHeight;
    });
    
    const info = {
      // Viewport info
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio,
      
      // Mobile detection
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isTouchDevice: 'ontouchstart' in window,
      isWeChat: /MicroMessenger/i.test(navigator.userAgent),
      
      // Visual viewport (important for mobile)
      visualViewportWidth: window.visualViewport ? window.visualViewport.width : 'Not supported',
      visualViewportHeight: window.visualViewport ? window.visualViewport.height : 'Not supported',
      visualViewportOffsetTop: window.visualViewport ? window.visualViewport.offsetTop : 'Not supported',
      visualViewportOffsetLeft: window.visualViewport ? window.visualViewport.offsetLeft : 'Not supported',
      
      // Layout measurements
      documentHeight: document.documentElement.scrollHeight,
      bodyHeight: document.body.scrollHeight,
      documentClientHeight: document.documentElement.clientHeight,
      bodyClientHeight: document.body.clientHeight,
      documentOffsetHeight: document.documentElement.offsetHeight,
      bodyOffsetHeight: document.body.offsetHeight,
      
      // Element measurements
      messageListHeight: messageListElement ? messageListElement.clientHeight : 'Not found',
      messageListScrollHeight: messageListElement ? messageListElement.scrollHeight : 'Not found',
      messageListOffsetHeight: messageListElement ? messageListElement.offsetHeight : 'Not found',
      messageInputHeight: messageInputElement ? messageInputElement.clientHeight : 'Not found',
      messageInputOffsetHeight: messageInputElement ? messageInputElement.offsetHeight : 'Not found',
      headerHeight: headerElement ? headerElement.clientHeight : 'Not found',
      headerOffsetHeight: headerElement ? headerElement.offsetHeight : 'Not found',
      mainContainerHeight: mainContainerElement ? mainContainerElement.clientHeight : 'Not found',
      chatContainerHeight: chatContainerElement ? chatContainerElement.clientHeight : 'Not found',
      spacerHeight: spacerElement ? spacerElement.offsetHeight : 'Not found',
      
      // Message content measurements
      totalMessagesHeight: totalMessagesHeight,
      messageCount: messageElements.length,
      
      // Scroll position
      scrollTop: document.documentElement.scrollTop || document.body.scrollTop,
      scrollLeft: document.documentElement.scrollLeft || document.body.scrollLeft,
      messageListScrollTop: messageListElement ? messageListElement.scrollTop : 'Not found',
      
      // Safe area insets (iPhone notch/home indicator)
      safeAreaTop: getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || 'Not available',
      safeAreaBottom: getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || 'Not available',
      safeAreaLeft: getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-left') || 'Not available',
      safeAreaRight: getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-right') || 'Not available',
      
      // CSS overflow detection
      bodyOverflow: getComputedStyle(document.body).overflow,
      documentOverflow: getComputedStyle(document.documentElement).overflow,
      cssOverflow: messageListElement ? getComputedStyle(messageListElement).overflowY : 'Not found',
      
      // Additional debugging info
      allDivs: document.querySelectorAll('div').length,
      allClasses: Array.from(document.querySelectorAll('*')).map(el => el.className).filter(c => c).slice(0, 10).join(', '),
      
      // Browser info
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      
      // Current timestamp
      timestamp: new Date().toISOString(),
      
      // Calculated vs actual heights
      calculatedMessageListHeight: messageListHeight,
      visualViewportHeight: window.visualViewport ? window.visualViewport.height : 'Not supported',
      effectiveHeight: window.visualViewport ? window.visualViewport.height : window.innerHeight,
      safeAreaTopValue: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top').replace('px', '')) || 0,
      safeAreaBottomValue: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom').replace('px', '')) || 0,
    };
    
    setDebugInfo(info);
  };

  // Update debug info on resize and orientation change
  useEffect(() => {
    const handleResize = () => {
      const newHeight = calculateMessageListHeight();
      setMessageListHeight(newHeight);
      updateDebugInfo();
    };
    
    const handleOrientationChange = () => {
      setTimeout(() => {
        const newHeight = calculateMessageListHeight();
        setMessageListHeight(newHeight);
        updateDebugInfo();
      }, 500); // Delay to allow orientation change to complete
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Visual viewport events (mobile specific)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  // Load chat history from localStorage
  const loadChatHistory = () => {
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
  };

  // Save chat history to localStorage
  const saveChatHistory = (messagesToSave) => {
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
  };

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
      position: "relative", 
      height: "100vh", 
      width: "100%",
      // Add CSS custom properties for safe areas
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {/* Fixed header using chatscope ConversationHeader */}
      <ConversationHeader
        style={{
          position: 'fixed',
          top: 'env(safe-area-inset-top, 0)', // Use safe area inset for mobile compatibility
          left: 0,
          right: 0,
          zIndex: 1001,
          width: '100%',
          // Ensure header stays on top in all mobile browsers
          transform: 'translateZ(0)', // Force GPU acceleration
          backfaceVisibility: 'hidden',
        }}
      >
        <ConversationHeader.Content
          userName="Forever English Corner AI"
          info="Ask me anything about our community!"
        />
      </ConversationHeader>
      <MainContainer responsive style={{ height: "100%" }}>
        <ChatContainer>
          <MessageList
            style={{
              position: 'absolute',
              top: 'calc(56px + env(safe-area-inset-top, 0px))', // Start right below header
              bottom: 'calc(56px + env(safe-area-inset-bottom, 0px))', // End right above input
              left: 0,
              right: 0,
              width: '100%',
              overflowY: 'auto',
              background: 'transparent',
              // Ensure smooth scrolling on mobile
              WebkitOverflowScrolling: 'touch',
              // Add minimal padding for proper spacing
              paddingTop: '16px', // Space between header and first message
              paddingBottom: '96px', // Extra space (80px + 16px) above input to ensure last message is visible
              boxSizing: 'border-box', // Include padding in height calculation
            }}
            typingIndicator={null}
          >
            {messages.map(({ id, message, sender, direction }, idx) => (
              <Message key={id + '-' + idx} model={{ message, sender, direction }} />
            ))}
          </MessageList>
          <MessageInput
            placeholder="Type your question here..."
            onSend={handleSend}
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 'env(safe-area-inset-bottom, 0)', // Use safe area inset for mobile
              zIndex: 1000,
              width: '100%',
              // Ensure input stays on top in all mobile browsers
              transform: 'translateZ(0)', // Force GPU acceleration
              backfaceVisibility: 'hidden',
            }}
          />
        </ChatContainer>
      </MainContainer>
      {isTyping && (
        <div style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: '56px',
          zIndex: 999,
          display: 'flex',
          justifyContent: 'flex-start',
          pointerEvents: 'none',
        }}>
          <TypingIndicator content="Forever English Corner is typing" />
        </div>
      )}
      
      {/* Debug Info Button */}
      <button
        onClick={() => setShowDebugInfo(!showDebugInfo)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 1002,
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          fontSize: '12px',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
        title="Toggle Debug Info"
      >
        🐛
      </button>

      {/* Debug Info Popup */}
      {showDebugInfo && (
        <div style={{
          position: 'fixed',
          top: '60px',
          right: '10px',
          zIndex: 1003,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '11px',
          fontFamily: 'monospace',
          maxWidth: '300px',
          maxHeight: '70vh',
          overflowY: 'auto',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        }}>
          <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#ff6b6b' }}>
            🚨 LAYOUT DEBUG INFO
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#4ecdc4' }}>Viewport vs Document:</strong><br/>
            Window: {debugInfo.windowWidth}×{debugInfo.windowHeight}<br/>
            Screen: {debugInfo.screenWidth}×{debugInfo.screenHeight}<br/>
            Doc Height: {debugInfo.documentHeight}px (scrollHeight)<br/>
            Doc Client: {debugInfo.documentClientHeight}px (clientHeight)<br/>
            Doc Offset: {debugInfo.documentOffsetHeight}px (offsetHeight)<br/>
            Body Height: {debugInfo.bodyHeight}px (scrollHeight)<br/>
            Body Client: {debugInfo.bodyClientHeight}px (clientHeight)<br/>
            Body Offset: {debugInfo.bodyOffsetHeight}px (offsetHeight)<br/>
            DPR: {debugInfo.devicePixelRatio}<br/>
            {debugInfo.visualViewportWidth !== 'Not supported' && (
              <>
                Visual: {debugInfo.visualViewportWidth}×{debugInfo.visualViewportHeight}<br/>
                VV Offset: {debugInfo.visualViewportOffsetTop},{debugInfo.visualViewportOffsetLeft}<br/>
              </>
            )}
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#ffe66d' }}>Device & Safe Areas:</strong><br/>
            Mobile: {debugInfo.isMobile ? '✅' : '❌'}<br/>
            Touch: {debugInfo.isTouchDevice ? '✅' : '❌'}<br/>
            WeChat: {debugInfo.isWeChat ? '✅' : '❌'}<br/>
            Platform: {debugInfo.platform}<br/>
            Safe Top: {debugInfo.safeAreaTop}<br/>
            Safe Bottom: {debugInfo.safeAreaBottom}<br/>
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#ff6b6b' }}>MessageList Analysis:</strong><br/>
            Container Height: {debugInfo.messageListHeight}px<br/>
            Container Offset: {debugInfo.messageListOffsetHeight}px<br/>
            Container Scroll: {debugInfo.messageListScrollHeight}px<br/>
            Total Messages: {debugInfo.totalMessagesHeight}px<br/>
            CSS Overflow: {debugInfo.cssOverflow || 'Not detected'}<br/>
            Scroll Position: {debugInfo.messageListScrollTop}px<br/>
            Max Scroll: {debugInfo.messageListScrollHeight - debugInfo.messageListHeight}px<br/>
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#a8e6cf' }}>Layout Calculation:</strong><br/>
            Window Height: {debugInfo.windowHeight}px<br/>
            Visual Viewport: {debugInfo.visualViewportHeight}px<br/>
            Effective Height: {debugInfo.effectiveHeight}px<br/>
            Safe Area Top: {debugInfo.safeAreaTopValue}px<br/>
            Safe Area Bottom: {debugInfo.safeAreaBottomValue}px<br/>
            Calculated MessageList: {debugInfo.calculatedMessageListHeight}px<br/>
            Actual MessageList: {debugInfo.messageListHeight}px<br/>
            Expected: {debugInfo.effectiveHeight} - 56 - 56 - {debugInfo.safeAreaTopValue + debugInfo.safeAreaBottomValue} = {debugInfo.effectiveHeight - 112 - (debugInfo.safeAreaTopValue || 0) - (debugInfo.safeAreaBottomValue || 0)}px<br/>
            Spacer: {debugInfo.isMobile ? '120px' : '80px'}<br/>
          </div>
          
          <div style={{ marginBottom: '8px', padding: '8px', backgroundColor: 'rgba(255, 255, 0, 0.2)', borderRadius: '4px' }}>
            <strong style={{ color: '#ffeb3b' }}>📝 WHY DOC &gt; WINDOW:</strong><br/>
            <div style={{ fontSize: '10px' }}>
              • Document height = content height<br/>
              • Window height = visible viewport<br/>
              • Content can be taller than viewport<br/>
              • {debugInfo.documentHeight > debugInfo.windowHeight ? '✅ Normal: Content > Viewport' : '⚠️ Unusual: Content ≤ Viewport'}
            </div>
          </div>
          
          <div style={{ fontSize: '9px', color: '#888', marginTop: '8px' }}>
            Last updated: {new Date(debugInfo.timestamp).toLocaleTimeString()}
          </div>
          
          <button
            onClick={updateDebugInfo}
            style={{
              marginTop: '8px',
              backgroundColor: '#4ecdc4',
              color: 'black',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>
      )}
      
      <SpeedInsights />
      <Analytics />
    </div>
  );
}

export default App;

