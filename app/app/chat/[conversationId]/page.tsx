"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { api, getStoredToken } from "@/lib/api/client";
import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://d2oulqfcyna7a4.cloudfront.net";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

function formatMsgTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();
  const conversationId = params.conversationId as string;

  const [messages, setMessages] = useState<AnyObj[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<AnyObj | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userId = (user as AnyObj)?._id;

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.replace("/app");
  }, [isLoading, isLoggedIn, router]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch messages
  useEffect(() => {
    if (!conversationId || !isLoggedIn) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = (await api.getMessages(conversationId)) as {
          data: { messages: AnyObj[]; conversation: AnyObj };
        };
        setMessages(res.data.messages || []);
        setConversation(res.data.conversation || null);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId, isLoggedIn]);

  // Socket.IO
  useEffect(() => {
    if (!conversationId || !isLoggedIn) return;

    const token = getStoredToken();
    const socket = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("joinConversation", conversationId);
    });

    // Backend emits "receiveMessage" for group messages
    socket.on("receiveMessage", (msg: AnyObj) => {
      // Avoid duplicating our own optimistic messages
      if (msg.senderId?._id === userId || msg.senderId === userId) return;
      setMessages((prev) => [...prev, {
        _id: msg._id,
        text: msg.content || msg.text,
        sender_id: msg.senderId || msg.sender_id,
        createdAt: msg.createdAt,
      }]);
    });

    socketRef.current = socket;

    return () => {
      socket.emit("leaveConversation", conversationId);
      socket.disconnect();
    };
  }, [conversationId, isLoggedIn, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = () => {
    if (!text.trim() || !socketRef.current) return;

    socketRef.current.emit("sendMessage", {
      conversationId,
      content: text.trim(),
    }, (response: AnyObj) => {
      // Replace optimistic message with server-confirmed one if needed
      if (response?.error) {
        console.error("Send failed:", response.error);
      }
    });

    // Optimistic update
    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now().toString(),
        text: text.trim(),
        sender_id: { _id: userId, name: (user as AnyObj)?.name },
        createdAt: new Date().toISOString(),
        optimistic: true,
      },
    ]);

    setText("");
    inputRef.current?.focus();
  };

  const planName = conversation?.plan_id?.name || "Group Chat";

  return (
    <div className="h-[100dvh] flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm z-10 flex-shrink-0" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-2xl mx-auto px-4 py-2 md:py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-neutral-800 truncate">{planName}</h1>
            {conversation?.participants && (
              <p className="text-xs text-neutral-400">{conversation.participants.length} members</p>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 md:px-4 md:py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-3 border-[var(--brand-green)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-400 text-sm">No messages yet. Say hello! 👋</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.sender_id?._id === userId || msg.sender_id === userId;
              const senderName = typeof msg.sender_id === "object" ? msg.sender_id?.name : "";
              const showName =
                !isMe &&
                (i === 0 ||
                  (typeof messages[i - 1]?.sender_id === "object"
                    ? messages[i - 1]?.sender_id?._id
                    : messages[i - 1]?.sender_id) !==
                    (typeof msg.sender_id === "object" ? msg.sender_id?._id : msg.sender_id));

              return (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                    {showName && senderName && (
                      <span className="text-xs text-neutral-400 mb-0.5 ml-3">{senderName}</span>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-[var(--brand-green)] text-white rounded-br-md"
                          : "bg-white text-neutral-800 shadow-sm rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-neutral-300 mt-0.5 mx-3">
                      {formatMsgTime(msg.createdAt)}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-neutral-100 flex-shrink-0" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-2xl mx-auto px-3 py-2 md:px-4 md:py-3 flex items-center gap-2 md:gap-3">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-neutral-100 rounded-2xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="w-11 h-11 bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-40 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
