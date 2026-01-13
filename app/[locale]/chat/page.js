'use client'

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
import { track } from "@vercel/analytics";
import ContentHeader from '../../components/ContentHeader';
import FloatingMenu from '../../components/FloatingMenu';

const BACKEND_URL = "/api/chat"; // Use local proxy to avoid CORS

// Generate a unique session ID based on device characteristics and timestamp
function generateSessionId() {
  const timestamp = Date.now();
  const userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';
  const screenInfo = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '';
  const timezone = typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : '';
  const language = typeof window !== 'undefined' ? navigator.language : '';

  const deviceCharacteristics = [userAgent, screenInfo, timezone, language].join('-');
  const deviceFingerprint = typeof window !== 'undefined'
    ? btoa(deviceCharacteristics).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)
    : 'server';

  return `session_${deviceFingerprint}_${timestamp}`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const sessionId = useRef(null);

  const saveChatHistory = useCallback((messagesToSave) => {
    try {
      const limitedMessages = messagesToSave.slice(-100);
      localStorage.setItem('english_corner_chat_history', JSON.stringify(limitedMessages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, []);

  const loadChatHistory = useCallback(() => {
    try {
      const storedMessages = localStorage.getItem('english_corner_chat_history');
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        setMessages(parsedMessages);
      } else {
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
    }
  }, [saveChatHistory]);

  useEffect(() => {
    if (!sessionId.current) {
      sessionId.current = generateSessionId();
    }
    loadChatHistory();
  }, [loadChatHistory]);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: "outgoing",
      sender: "user",
      id: messages.length,
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    saveChatHistory(newMessages);
    setIsTyping(true);

    try {
      console.log('Sending message to backend:', BACKEND_URL);
      console.log('Payload:', { question: message, session_id: sessionId.current });
      
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: message,
          session_id: sessionId.current,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      const botMessage = {
        message: data.answer || data.response || "I'm having trouble responding. Please try again.",
        sender: "bot",
        direction: "incoming",
        id: messages.length + 1,
      };

      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
      saveChatHistory(updatedMessages);

      track('chat_message_sent', {
        message_length: message.length,
        session_id: sessionId.current
      });
    } catch (error) {
      console.error("Error sending message:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      let errorMsg = "Sorry, I couldn't process your message. ";
      
      if (error.message.includes('Failed to fetch')) {
        errorMsg += "Network error - please check your internet connection or try again later.";
      } else if (error.message.includes('CORS')) {
        errorMsg += "Connection blocked by CORS policy.";
      } else {
        errorMsg += `Error: ${error.message}`;
      }
      
      const errorMessage = {
        message: errorMsg,
        sender: "bot",
        direction: "incoming",
        id: messages.length + 1,
      };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      saveChatHistory(updatedMessages);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    const welcomeMessage = {
      message: "Chat history cleared. Hi! Ask me anything about Forever English Corner.",
      sender: "bot",
      direction: "incoming",
      id: 0,
    };
    setMessages([welcomeMessage]);
    saveChatHistory([welcomeMessage]);
    sessionId.current = generateSessionId();
  };

  return (
    <div style={{ position: "relative", height: "100vh", display: "flex", flexDirection: "column" }}>
      <ContentHeader />

      <div style={{ position: "relative", flexGrow: 1 }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={isTyping ? <TypingIndicator content="Assistant is typing" /> : null}
            >
              {messages.map((msg, i) => (
                <Message key={i} model={msg} />
              ))}
            </MessageList>
            <MessageInput
              placeholder="Type your message here..."
              onSend={handleSend}
              attachButton={false}
            />
          </ChatContainer>
        </MainContainer>

        <button
          onClick={handleClearHistory}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            padding: "8px 16px",
            backgroundColor: "#ff5722",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            zIndex: 1000,
          }}
        >
          Clear Chat History
        </button>
      </div>

      <FloatingMenu />
    </div>
  );
}
