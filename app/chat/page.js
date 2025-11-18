'use client'

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from 'next/navigation';
import supabase from '../../lib/supabase';
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
import ContentHeader from '../components/ContentHeader';
import FloatingMenu from '../components/FloatingMenu';

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
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const [emailForSignIn, setEmailForSignIn] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const sessionId = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!isMounted) {
          return;
        }

        if (error) {
          console.error('Failed to load Supabase session:', error);
        }

        setUser(data?.session?.user ?? null);
      } catch (error) {
        console.error('Unexpected session error:', error);
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    loadInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/chat` : undefined,
        },
      });

      if (error) {
        throw error;
      }

      track('user_signed_in', { provider: 'google' });
    } catch (error) {
      console.error('Google sign in error:', error);
      alert(error?.message || 'Failed to sign in with Google. Please try again.');
    }
  };

  const handleEmailSignIn = async () => {
    if (!emailForSignIn) {
      alert('Please enter your email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForSignIn)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailForSignIn,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/chat` : undefined,
        },
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      track('email_signin_link_sent');
      alert('Check your email for the sign-in link! If you don\'t see it, check your spam folder.');
    } catch (error) {
      console.error('Email sign in error:', error);

      let errorMessage = 'Failed to send sign-in email. ';

      const message = error?.message?.toLowerCase() || '';
      if (message.includes('invalid email')) {
        errorMessage += 'Invalid email address format.';
      } else if (message.includes('rate limit')) {
        errorMessage += 'Too many attempts. Please try again in a few minutes.';
      } else if (message.includes('otp')) {
        errorMessage += 'Magic link is not available right now. Please try again later.';
      } else {
        errorMessage += error?.message ? `Error: ${error.message}` : 'Please try again later or use password sign in instead.';
      }

      alert(errorMessage);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      track('user_signed_out');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

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

  const userDisplayName = user?.user_metadata?.full_name || user?.email || 'User';

  return (
    <div style={{ position: "relative", height: "100vh", display: "flex", flexDirection: "column" }}>
      <ContentHeader />

      {/* Auth Status Bar */}
      <div style={{
        padding: '10px 20px',
        background: user ? '#e8f5e9' : '#fff3e0',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {authLoading ? (
          <span>Loading...</span>
        ) : user ? (
          <>
            <span>Welcome, {userDisplayName}!</span>
            <button
              onClick={handleSignOut}
              style={{
                padding: '8px 16px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <span>Sign in to sync your chat history across devices</span>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={signInWithGoogle}
                style={{
                  padding: '8px 16px',
                  background: '#4285f4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Sign in with Google
              </button>

              <button
                onClick={() => router.push('/auth')}
                style={{
                  padding: '8px 16px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Email Sign Up/Sign In
              </button>

              {!showEmailInput ? (
                <button
                  onClick={() => setShowEmailInput(true)}
                  style={{
                    padding: '8px 16px',
                    background: '#34a853',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Passwordless Email Link
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={emailForSignIn}
                    onChange={(e) => setEmailForSignIn(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      minWidth: '200px'
                    }}
                  />
                  <button
                    onClick={handleEmailSignIn}
                    disabled={emailSent}
                    style={{
                      padding: '8px 16px',
                      background: emailSent ? '#ccc' : '#34a853',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: emailSent ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {emailSent ? 'Sent!' : 'Send Link'}
                  </button>
                  <button
                    onClick={() => {
                      setShowEmailInput(false);
                      setEmailSent(false);
                      setEmailForSignIn('');
                    }}
                    style={{
                      padding: '8px 12px',
                      background: '#666',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

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
