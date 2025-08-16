import React, { useState, useEffect, useRef } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { SpeedInsights } from "@vercel/speed-insights/react"

// Change from HTTP to HTTPS on custom port
const BACKEND_URL = "https://api.englishcorner.cyou:8443/chat";

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

function App() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
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
    }
    
    sessionId.current = storedSessionId;
    console.log('Session ID initialized:', sessionId.current);
    
    // Load chat history for this session
    loadChatHistory();
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
        throw new Error(`Backend error ${response.status}: ${errorText}`);
      }

      // Parse JSON response from backend
      let data;
      try {
        data = await response.json();
        console.log("Backend response data:", data);
      } catch (jsonErr) {
        console.error("Failed to parse JSON from backend:", jsonErr);
        throw new Error("Invalid JSON response from backend");
      }

      const answerMsg = data.answer || "Sorry, I couldn't find an answer.";

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
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <MainContainer responsive>
        <ChatContainer>
          <MessageList
            typingIndicator={isTyping ? <TypingIndicator content="Forever English Corner is typing" /> : null}
          >
            {messages.map(({ id, message, sender, direction }) => (
              <Message key={id} model={{ message, sender, direction }} />
            ))}
          </MessageList>
          <MessageInput placeholder="Type your question here..." onSend={handleSend} />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}

export default App;

