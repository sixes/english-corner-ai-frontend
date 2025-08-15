import React, { useState } from "react";
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

// Change this URL to wherever your FastAPI backend is running
const BACKEND_URL = "https://www.englishcorner.cyou/api/chat";

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hi! Ask me anything about Forever English Corner.",
      sender: "bot",
      direction: "incoming",
      id: 0,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  async function handleSend(messageText) {
    if (!messageText.trim()) return;

    // Add user's message to chat
    const userMessage = {
      message: messageText,
      sender: "user",
      direction: "outgoing",
      id: messages.length,
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsTyping(true);

    try {
      console.log("Sending question to backend:", messageText);

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: messageText,
          session_id: "user_session_" + Date.now() // Optional: add session management
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
        id: messages.length + 1,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching answer:", error);

      // Show detailed error messages in chat for debugging
      const errorMessage = {
        message: `Oops! Something went wrong.\n${error.message}`,
        sender: "bot",
        direction: "incoming",
        id: messages.length + 1,
      };
      setMessages((prev) => [...prev, errorMessage]);
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

