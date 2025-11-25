import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "./ChatWidget.scss";

const RASA_URL = process.env.REACT_APP_RASA_URL || "http://localhost:5005";

// Generate or retrieve stable sender ID
const getSenderId = () => {
  let senderId = localStorage.getItem("chatbot_sender_id");
  if (!senderId) {
    senderId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("chatbot_sender_id", senderId);
  }
  return senderId;
};

export default function ChatWidget() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const senderId = getSenderId();

  // Get role from token if available
  const getRole = () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.role || "guest";
      }
    } catch (e) {
      return "guest";
    }
    return "guest";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const translateOrFallback = (key, fallback) => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsg = {
        text: translateOrFallback("chat_welcome", "Hello! How can I help you today?"),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, t]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = {
      text: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setError("");

    try {
      const role = getRole();
      const sender = `${senderId}|${role}`;

      const response = await axios.post(
        `${RASA_URL}/webhooks/rest/webhook`,
        {
          sender: sender,
          message: userMessage.text,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      if (response.data && response.data.length > 0) {
        const botMessages = response.data.map((msg) => ({
          text: msg.text || msg.message || "",
          sender: "bot",
          timestamp: new Date(),
        }));

        setMessages((prev) => [...prev, ...botMessages]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            text: t("chat_no_response") || "I didn't understand that. Could you rephrase?",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setError(t("chat_error") || "Failed to send message. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          text: t("chat_error_message") || "Sorry, I'm having trouble connecting. Please check if the server is running.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "mr" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("appLanguage", newLang);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="chat-widget-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t("chat_toggle") || "Toggle chat"}
      >
        {isOpen ? (
          <i className="bi bi-x-lg"></i>
        ) : (
          <i className="bi bi-chat-dots-fill"></i>
        )}
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="chat-widget-modal">
          <div className="chat-widget-header">
            <div className="chat-widget-title">
              <i className="bi bi-robot"></i>
              <span>{translateOrFallback("chat_assistant", "Assistant")}</span>
            </div>
            <div className="chat-widget-actions">
              <button
                className="chat-widget-btn-icon"
                onClick={toggleLanguage}
                title={t("chat_toggle_language") || "Toggle Language"}
              >
                {i18n.language === "en" ? "मराठी" : "EN"}
              </button>
              <button
                className="chat-widget-btn-icon"
                onClick={() => setIsOpen(false)}
                aria-label={t("chat_close") || "Close"}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <div className="chat-widget-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
              >
                <div className="chat-message-content">
                  <p>{msg.text}</p>
                  <span className="chat-message-time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-message bot">
                <div className="chat-message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="chat-error">
                <i className="bi bi-exclamation-triangle"></i>
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="chat-widget-input-form" onSubmit={sendMessage}>
            <input
              type="text"
              className="chat-widget-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={translateOrFallback("chat_placeholder", "Type your message...")}
              disabled={isTyping}
            />
            <button
              type="submit"
              className="chat-widget-send"
              disabled={!input.trim() || isTyping}
            >
              <i className="bi bi-send-fill"></i>
            </button>
          </form>
        </div>
      )}
    </>
  );
}

