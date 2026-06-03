// src/pages/Chats/Chat.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import "./Chat.css";
import axios from "axios";
import { baseUrl } from "../data/api";
import socket from "../../socket";

const Chat = () => {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState([]); // all chat messages
  const [notifications, setNotifications] = useState([]);
  const [text, setText] = useState("");
  const [chatUsers, setChatUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({}); // { userId: true }
  const [typingUsers, setTypingUsers] = useState({}); // { userId: true }
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);

  const { otherUserId } = useParams();
  const navigate = useNavigate();
  const messagesContainerRef = useRef(null);
  const stopTypingTimerRef = useRef(null);

  // SOCKET debug
  useEffect(() => {
    socket.on("connect", () => console.log("SOCKET connected", socket.id));
    socket.on("connect_error", (err) => console.log("SOCKET ERR", err));
    return () => {
      socket.off("connect");
      socket.off("connect_error");
    };
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (loading) return;
    if (user === null) navigate("/");
  }, [user, loading, navigate]);

  // Register current user on socket
  useEffect(() => {
    if (!user) return;
    const onConnect = () => socket.emit("registerUser", user._id);
    socket.on("connect", onConnect);
    if (socket.connected) onConnect();
    return () => socket.off("connect", onConnect);
  }, [user]);

  // Join chat room (server checks permission) when otherUserId changes
  useEffect(() => {
    if (!user || !otherUserId) return;
    socket.emit("joinChat", { receiverId: String(otherUserId) });
  }, [user, otherUserId]);

  // Load chat users (sidebar)
  useEffect(() => {
    if (!user) return;
    const loadChatUsers = async () => {
      try {
        const res = await axios.get(`${baseUrl}/applications/my`, { withCredentials: true });
        const apps = res.data || [];
        const mapped = apps
          .map((app) => (user.role === "volunteer" ? app.opportunityId?.ngoId : app.volunteerId))
          .filter(Boolean);
        const unique = Array.from(new Map(mapped.map((u) => [u._id, u])).values());
        setChatUsers(unique);
        // navigate only when no chat is selected
        if (!otherUserId && unique.length) {
          navigate(`/chat/${unique[0]._id}`);
        }
      } catch (err) {
        console.error("Error loading chat users:", err);
      }
    };
    loadChatUsers();
  }, [user, navigate, otherUserId]); // <- added navigate & otherUserId to satisfy ESLint

  // Keep selectedUserProfile up-to-date
  useEffect(() => {
    if (!otherUserId) return setSelectedUserProfile(null);
    const found = chatUsers.find((u) => String(u._id) === String(otherUserId));
    setSelectedUserProfile(found || { _id: otherUserId, fullName: otherUserId });
  }, [otherUserId, chatUsers]);

  // Load chat history for the selected user
  useEffect(() => {
    if (!otherUserId) return;
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${baseUrl}/chats/history/${otherUserId}`, { withCredentials: true });
        const normalized = (res.data || []).map((m) => ({ ...m, status: m.status || "sent" }));
        setMessages(normalized);
        // emit markRoomSeen only if user exists (could have logged out)
        if (user) socket.emit("markRoomSeen", { roomWith: otherUserId });
      } catch (err) {
        console.error("Chat history error", err);
      }
    };
    fetchHistory();
  }, [otherUserId, user]);

  // Listen for socket events
  useEffect(() => {
    const handleReceive = (msg) => {
      setMessages((prev) => {
        const withoutOptimistic = prev.filter(
          (m) => !(m.optimistic && m.message === msg.message && m.sender === msg.sender)
        );
        if (withoutOptimistic.some((m) => m._id === msg._id)) return withoutOptimistic;
        return [...withoutOptimistic, { ...msg, status: msg.status || "sent" }].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      });

      // mark seen only if we still have a logged-in user and chat is open
      if (user && msg.sender !== user._id && String(msg.sender) === String(otherUserId)) {
        socket.emit("messageSeen", { messageId: msg._id, senderId: msg.sender });
        setMessages((prev) => prev.map((m) => (m._id === msg._id ? { ...m, status: "seen" } : m)));
      }
    };

    const handleNotification = (notif) => setNotifications((prev) => [...prev, notif]);
    const handleTyping = ({ from }) => setTypingUsers((t) => ({ ...t, [from]: true }));
    const handleStopTyping = ({ from }) =>
      setTypingUsers((t) => {
        const copy = { ...t };
        delete copy[from];
        return copy;
      });

    const handleUserOnline = ({ userId }) => setOnlineUsers((s) => ({ ...s, [userId]: true }));
    const handleUserOffline = ({ userId }) =>
      setOnlineUsers((s) => {
        const copy = { ...s };
        delete copy[userId];
        return copy;
      });

    const handleStatusUpdate = ({ messageId, status }) => {
      setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, status } : m)));
    };

    socket.on("receiveMessage", handleReceive);
    socket.on("newMessageNotification", handleNotification);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);
    socket.on("messageStatusUpdate", handleStatusUpdate);

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.off("newMessageNotification", handleNotification);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
      socket.off("messageStatusUpdate", handleStatusUpdate);
    };
  }, [user, otherUserId]);

  // Auto-scroll
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    const el = messagesContainerRef.current;
    el.scrollTop = el.scrollHeight + 200;
  }, [messages]);

  // Auto-hide notifications FIFO
  useEffect(() => {
    if (notifications.length === 0) return;
    const timer = setTimeout(() => setNotifications((prev) => prev.slice(1)), 4000);
    return () => clearTimeout(timer);
  }, [notifications]);

  // Typing emitter (debounced)
  const handleTypingEmit = (value) => {
    if (!user || !otherUserId) return;
    socket.emit("typing", { to: otherUserId, from: user._id });
    if (stopTypingTimerRef.current) clearTimeout(stopTypingTimerRef.current);
    stopTypingTimerRef.current = setTimeout(() => {
      if (user && otherUserId) socket.emit("stopTyping", { to: otherUserId, from: user._id });
    }, 1200);
  };

  // Send message
  const sendMessage = (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || !user) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      sender: user._id,
      receiver: otherUserId,
      message: text,
      createdAt: new Date().toISOString(),
      optimistic: true,
      status: "sending",
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    socket.emit("sendMessage", { receiverId: otherUserId, message: text, tempId });

    setText("");
    if (user && otherUserId) socket.emit("stopTyping", { to: otherUserId, from: user._id });
  };

  const removeNotification = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (nearBottom && user) {
      const unseen = messages.filter((m) => m.sender !== user._id && m.status !== "seen");
      unseen.forEach((m) => socket.emit("messageSeen", { messageId: m._id, senderId: m.sender }));
      setMessages((prev) => prev.map((m) => (m.sender !== user._id ? { ...m, status: "seen" } : m)));
    }
  };

  // renderStatus safely checks for user
  const renderStatus = (m) => {
    if (!user) return null;
    if (m.sender !== user._id) return null; // show only for own messages
    switch (m.status) {
      case "sending":
        return <span className="msg-status">⏳</span>;
      case "sent":
        return <span className="msg-status">✓</span>;
      case "delivered":
        return <span className="msg-status">✓✓</span>;
      case "seen":
        return <span className="msg-status seen">✓✓</span>;
      default:
        return <span className="msg-status">✓</span>;
    }
  };

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const otherTyping = useMemo(() => Boolean(typingUsers[otherUserId]), [typingUsers, otherUserId]);

  return (
    <div className="chat-page-wrapper">
      <aside className={`chat-user-list ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-top">
          <h3 className="chat-user-title">Chats</h3>
          <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
            {sidebarOpen ? "Collapse" : "Open"}
          </button>
        </div>

        {chatUsers.length === 0 && <p className="no-chat-users">No chats available.</p>}

        {chatUsers.map((u) => (
          <button
            key={u._id}
            className={`chat-user-button ${String(u._id) === String(otherUserId) ? "active" : ""}`}
            onClick={() => navigate(`/chat/${u._id}`)}
          >
            <div className="user-line">
              <div className={`presence-dot ${onlineUsers[u._id] ? "online" : "offline"}`} />
              <strong>{u.fullName || "Unknown User"}</strong>
            </div>
            <span className="chat-user-email">{u.email}</span>
          </button>
        ))}
      </aside>

      <main className="chat-content-container">
        <div className={`chat-box-main ${sidebarOpen ? "with-sidebar" : "no-sidebar"}`}>
          <header className="chat-header">
            <div className="header-left">
              <h2>Chat</h2>
              <p className="chat-subtitle">
                Chatting with <strong>{selectedUserProfile?.fullName || otherUserId}</strong>
                <span className="header-presence">{onlineUsers[otherUserId] ? " • Online" : " • Offline"}</span>
              </p>
            </div>
            <div className="header-actions">
              <button className="btn-profile" onClick={() => alert("Open profile drawer (implement)")}>
                Profile
              </button>
            </div>
          </header>

          <div className="chat-messages-area" ref={messagesContainerRef} onScroll={handleScroll} role="log" aria-live="polite">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`message-row ${msg.sender === user?._id ? "message-sender" : "message-receiver"} ${
                  msg.optimistic ? "message-optimistic" : ""
                }`}
              >
                <div className="message-bubble">
                  <p className="message-text">{msg.message}</p>
                  <span className="message-time">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ""}
                    {msg.optimistic ? " • sending…" : ""}
                  </span>
                  <div className="message-meta">
                    {renderStatus(msg)}
                    {msg.sender !== user?._id && otherTyping && String(msg.sender) === String(otherUserId) && (
                      <span className="typing-indicator">•••</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {otherTyping && (
              <div className="message-row message-receiver typing-row">
                <div className="message-bubble typing-bubble">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form className="chat-input-form" onSubmit={sendMessage}>
            <input
              type="text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                handleTypingEmit(e.target.value);
              }}
              placeholder="Type a message..."
              className="chat-input-field"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button type="submit" className="chat-send-button">
              Send
            </button>
          </form>
        </div>
      </main>

      <div className="notification-container">
        {notifications.map((n) => (
          <div key={n.id || n._id} className="notification-item">
            <span className="notification-icon">🔔</span>
            <p className="notification-text">{n.text || n.message || "New message"}</p>
            <button onClick={() => removeNotification(n.id)} className="notification-close-btn">
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;
