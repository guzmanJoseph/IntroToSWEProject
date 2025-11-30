import { useState, useRef, useEffect, useCallback, useMemo } from "react";

const INITIAL_CONVERSATIONS = [
  {
    id: "conv_1",
    userId: "user_123",
    userName: "John Smith",
    lastMessage: "When can I view the apartment?",
    timestamp: new Date(Date.now() - 3600000),
    unread: 1,
    messages: [
      {
        id: "msg_1",
        senderId: "user_123",
        senderName: "John Smith",
        text: "Hi, I'm interested in your 2BR listing",
        timestamp: new Date(Date.now() - 7200000),
      },
      {
        id: "msg_2",
        senderId: "current_user",
        senderName: "You",
        text: "Great! It's available next month.",
        timestamp: new Date(Date.now() - 5400000),
      },
      {
        id: "msg_3",
        senderId: "user_123",
        senderName: "John Smith",
        text: "When can I view the apartment?",
        timestamp: new Date(Date.now() - 3600000),
      },
    ],
  },
  {
    id: "conv_2",
    userId: "user_456",
    userName: "Sarah Johnson",
    lastMessage: "Thanks for the info!",
    timestamp: new Date(Date.now() - 86400000),
    unread: 1,
    messages: [
      {
        id: "msg_4",
        senderId: "user_456",
        senderName: "Sarah Johnson",
        text: "Is utilities included?",
        timestamp: new Date(Date.now() - 86400000),
      },
      {
        id: "msg_5",
        senderId: "current_user",
        senderName: "You",
        text: "Yes, water and trash are included.",
        timestamp: new Date(Date.now() - 82800000),
      },
      {
        id: "msg_6",
        senderId: "user_456",
        senderName: "Sarah Johnson",
        text: "Thanks for the info!",
        timestamp: new Date(Date.now() - 86400000),
      },
    ],
  },
];

const MessageBubble = ({ msg }) => (
  <div
    className={`flex ${
      msg.senderId === "current_user" ? "justify-end" : "justify-start"
    }`}
  >
    <div
      className={`max-w-xs px-2 py-1 rounded-lg text-sm ${
        msg.senderId === "current_user"
          ? "bg-blue-500 text-white rounded-br-none"
          : "bg-gray-200 text-gray-900 rounded-bl-none"
      }`}
    >
      <p className="break-words whitespace-pre-wrap">{msg.text}</p>
      <p className="text-xs mt-0.5 opacity-70">
        {msg.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  </div>
);

const ConversationItem = ({ conv, onSelect }) => (
  <button
    onClick={onSelect}
    className="w-full text-left border-b border-gray-100 hover:bg-gray-50 p-3 transition"
  >
    <div className="flex justify-between items-start">
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-gray-900">{conv.userName}</h4>
        <p className="text-xs text-gray-600 mt-1 truncate">
          {conv.lastMessage}
        </p>
      </div>
      {conv.unread > 0 && (
        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 ml-2 flex-shrink-0">
          {conv.unread}
        </span>
      )}
    </div>
    <p className="text-xs text-gray-400 mt-1">
      {conv.timestamp.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </p>
  </button>
);

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newChatMode, setNewChatMode] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [newChatInitialMessage, setNewChatInitialMessage] = useState("");
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const messagesEndRef = useRef(null);
  const incomingMessageFiredRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation, scrollToBottom]);

  // Simulate incoming message after 10 seconds for testing (once only)
  useEffect(() => {
    if (incomingMessageFiredRef.current) return;

    const timer = setTimeout(() => {
      incomingMessageFiredRef.current = true;
      const randomConvIndex = Math.floor(Math.random() * conversations.length);
      const incomingMessage = {
        id: `msg_${Date.now()}`,
        senderId: conversations[randomConvIndex].userId,
        senderName: conversations[randomConvIndex].userName,
        text: "RESPOND BRO",
        timestamp: new Date(),
      };

      setConversations((prev) =>
        prev.map((conv, idx) =>
          idx === randomConvIndex
            ? {
                ...conv,
                messages: [...conv.messages, incomingMessage],
                lastMessage: incomingMessage.text,
                timestamp: new Date(),
                unread:
                  selectedConversation?.id === conv.id ? 0 : conv.unread + 1,
              }
            : conv
        )
      );
    }, 10000);

    return () => clearTimeout(timer);
  }, [selectedConversation, conversations.length]);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unread, 0),
    [conversations]
  );

  const handleOpenConversation = useCallback((conv) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c))
    );
    setSelectedConversation(conv);
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim() || !selectedConversation) return;

    const messageText = input.trim();
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: "current_user",
      senderName: "You",
      text: messageText,
      timestamp: new Date(),
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation.id
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: messageText,
              timestamp: new Date(),
            }
          : conv
      )
    );

    setSelectedConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      lastMessage: messageText,
      timestamp: new Date(),
    }));

    setInput("");
  }, [input, selectedConversation]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleStartChat = useCallback(() => {
    const convId = `conv_${Date.now()}`;
    const firstMsgId = `msg_${Date.now()}`;
    const conv = {
      id: convId,
      userId: `user_${Date.now()}`,
      userName: newChatName || `User ${Date.now()}`,
      lastMessage: newChatInitialMessage || "",
      timestamp: new Date(),
      unread: 0,
      messages: [
        {
          id: firstMsgId,
          senderId: "current_user",
          senderName: "You",
          text: newChatInitialMessage || "",
          timestamp: new Date(),
        },
      ],
    };

    setConversations((prev) => [conv, ...prev]);
    setSelectedConversation(conv);
    setNewChatMode(false);
    setNewChatName("");
    setNewChatInitialMessage("");
  }, [newChatName, newChatInitialMessage]);

  const currentMessages = selectedConversation?.messages || [];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-96 h-[500px] bg-white rounded-lg shadow-lg flex flex-col overflow-hidden border border-gray-200">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center shrink-0">
            <h3 className="font-semibold">
              {selectedConversation
                ? selectedConversation.userName
                : "Messages"}
            </h3>
            <div className="flex gap-2">
              {selectedConversation && (
                <button
                  onClick={() => setSelectedConversation(null)}
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
                    type="text"
                    placeholder="Recipient name"
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
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
                        setNewChatName("");
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

              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    onSelect={() => handleOpenConversation(conv)}
                  />
                ))
              )}
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {currentMessages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
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
