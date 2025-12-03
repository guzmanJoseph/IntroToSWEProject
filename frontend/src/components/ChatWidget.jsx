import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { api } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const MessageBubble = ({ msg, currentUserEmail }) => {
  const isCurrentUser = msg.sender === currentUserEmail;
  const timestamp = msg.timestamp ? new Date(msg.timestamp) : new Date();
  
  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs px-2 py-1 rounded-lg text-sm ${
          isCurrentUser
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-200 text-gray-900 rounded-bl-none"
        }`}
      >
        <p className="break-words whitespace-pre-wrap">{msg.text}</p>
        <p className="text-xs mt-0.5 opacity-70">
          {timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};

const ConversationItem = ({ conv, onSelect }) => {
  const timestamp = conv.last_timestamp ? new Date(conv.last_timestamp) : new Date();
  
  return (
    <button
      onClick={onSelect}
      className="w-full text-left border-b border-gray-100 hover:bg-gray-50 p-3 transition"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900">
            {conv.other_user_email || "Unknown User"}
          </h4>
          <p className="text-xs text-gray-600 mt-1 truncate">
            {conv.last_message || "No messages"}
          </p>
        </div>
        {conv.unread_count > 0 && (
          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 ml-2 flex-shrink-0">
            {conv.unread_count}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1">
        {timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </button>
  );
};

const ChatWidget = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newChatMode, setNewChatMode] = useState(false);
  const [newChatEmail, setNewChatEmail] = useState("");
  const [newChatInitialMessage, setNewChatInitialMessage] = useState("");
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const currentUserEmail = user?.email || null;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load conversations when widget opens
  useEffect(() => {
    if (isOpen && currentUserEmail) {
      loadConversations();
    }
  }, [isOpen, currentUserEmail]);

  // Poll for new messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation || !currentUserEmail) return;

    const interval = setInterval(() => {
      loadMessages(selectedConversation.other_user_email);
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [selectedConversation, currentUserEmail]);

  const loadConversations = async () => {
    if (!currentUserEmail) {
      setError("Please log in to use messaging");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.getConversations(currentUserEmail);
      setConversations(data || []);
    } catch (err) {
      setError(err.message || "Failed to load conversations");
      console.error("Error loading conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (otherUserEmail) => {
    if (!currentUserEmail || !otherUserEmail) return;

    try {
      const data = await api.getConversation(currentUserEmail, otherUserEmail);
      // Transform backend format to frontend format
      const transformedMessages = (data || []).map((msg) => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp,
      }));
      setMessages(transformedMessages);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  const handleOpenConversation = useCallback(
    async (conv) => {
      setSelectedConversation(conv);
      setMessages([]);
      
      // Mark messages as read
      if (currentUserEmail && conv.other_user_email) {
        try {
          await api.markMessagesRead(currentUserEmail, conv.other_user_email);
          // Reload conversations to update unread counts
          loadConversations();
        } catch (err) {
          console.error("Error marking messages as read:", err);
        }
      }
      
      // Load messages for this conversation
      if (currentUserEmail && conv.other_user_email) {
        await loadMessages(conv.other_user_email);
      }
    },
    [currentUserEmail]
  );

  const handleSend = useCallback(async () => {
    if (!input.trim() || !selectedConversation || !currentUserEmail) return;

    const messageText = input.trim();
    const otherUserEmail = selectedConversation.other_user_email;

    // Optimistically add message to UI
    const tempMessage = {
      id: `temp_${Date.now()}`,
      sender: currentUserEmail,
      text: messageText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);
    setInput("");

    try {
      // Send to backend
      await api.sendMessage(currentUserEmail, otherUserEmail, messageText);
      
      // Reload messages to get the actual message from backend
      await loadMessages(otherUserEmail);
      
      // Reload conversations to update last message
      await loadConversations();
    } catch (err) {
      setError(err.message || "Failed to send message");
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      setInput(messageText); // Restore input
      console.error("Error sending message:", err);
    }
  }, [input, selectedConversation, currentUserEmail]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleStartChat = useCallback(async () => {
    if (!newChatEmail.trim() || !currentUserEmail) return;

    const otherUserEmail = newChatEmail.trim();
    const initialMessage = newChatInitialMessage.trim();

    if (initialMessage) {
      try {
        // Send the initial message
        await api.sendMessage(currentUserEmail, otherUserEmail, initialMessage);
        
        // Reload conversations to show the new one
        await loadConversations();
        
        // Find and select the new conversation
        const updatedConvs = await api.getConversations(currentUserEmail);
        const newConv = updatedConvs.find((c) => c.other_user_email === otherUserEmail);
        
        if (newConv) {
          await handleOpenConversation(newConv);
        }
      } catch (err) {
        setError(err.message || "Failed to start conversation");
        console.error("Error starting chat:", err);
        return;
      }
    }

    setNewChatMode(false);
    setNewChatEmail("");
    setNewChatInitialMessage("");
  }, [newChatEmail, newChatInitialMessage, currentUserEmail, handleOpenConversation]);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0),
    [conversations]
  );

  // Show login prompt if not authenticated
  if (!isAuthenticated || !currentUserEmail) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center text-2xl font-semibold"
          aria-label="Toggle chat"
        >
          {isOpen ? "✕" : "💬"}
        </button>
        {isOpen && (
          <div className="mb-4 w-96 h-[200px] bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <p className="text-gray-600 text-sm">
              Please log in to use messaging.
            </p>
            <Link to="/login"
              className="text-blue-600 hover:underline text-sm mt-2 inline-block"
            >
              Go to Login →
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-96 h-[500px] bg-white rounded-lg shadow-lg flex flex-col overflow-hidden border border-gray-200">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center shrink-0">
            <h3 className="font-semibold">
              {selectedConversation
                ? selectedConversation.other_user_email
                : "Messages"}
            </h3>
            <div className="flex gap-2">
              {selectedConversation && (
                <button
                  onClick={() => {
                    setSelectedConversation(null);
                    setMessages([]);
                  }}
                  className="text-white text-lg hover:bg-blue-700 rounded px-2 py-1"
                  aria-label="Back"
                >
                  ←
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white text-xl hover:bg-blue-700 rounded px-2 py-1"
                aria-label="Close"
              >
                −
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 text-sm">
              {error}
            </div>
          )}

          {!selectedConversation ? (
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="text-sm text-gray-700">Conversations</div>
                {!newChatMode ? (
                  <button
                    onClick={() => setNewChatMode(true)}
                    className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    New Chat
                  </button>
                ) : (
                  <button
                    onClick={() => setNewChatMode(false)}
                    className="text-sm bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {newChatMode && (
                <div className="p-3 border-b border-gray-100 space-y-2 shrink-0">
                  <input
                    type="email"
                    placeholder="Recipient email (e.g., user@ufl.edu)"
                    value={newChatEmail}
                    onChange={(e) => setNewChatEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    autoFocus
                  />
                  <textarea
                    rows={2}
                    placeholder="Type your first message"
                    value={newChatInitialMessage}
                    onChange={(e) => setNewChatInitialMessage(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setNewChatEmail("");
                        setNewChatInitialMessage("");
                      }}
                      className="text-sm bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleStartChat}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Start
                    </button>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Loading conversations...
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv, idx) => (
                  <ConversationItem
                    key={conv.other_user_email || idx}
                    conv={conv}
                    onSelect={() => handleOpenConversation(conv)}
                  />
                ))
              )}
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-4">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      currentUserEmail={currentUserEmail}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-200 p-3 flex gap-2 shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSend}
                  className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center text-2xl font-semibold"
        aria-label="Toggle chat"
      >
        {isOpen ? "✕" : "💬"}
        {!isOpen && totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {totalUnread}
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
