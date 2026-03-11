"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { api, getStoredToken } from "@/lib/api/client";
import { io, Socket } from "socket.io-client";
import S3Image from "@/components/S3Image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://d2oulqfcyna7a4.cloudfront.net";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

function formatMsgTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function MiniAvatar({ user: u, size = 16 }: { user: AnyObj; size?: number }) {
  return (
    <div
      className="rounded-full bg-gradient-to-br from-[var(--brand-green)] to-green-600 flex items-center justify-center text-white overflow-hidden flex-shrink-0 border border-white"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {u?.image ? (
        <S3Image fileKey={u.image} alt="" width={size} height={size} className="object-cover w-full h-full" />
      ) : (
        <span className="font-semibold">{u?.name?.charAt(0)?.toUpperCase() || '?'}</span>
      )}
    </div>
  );
}

// Find participant by name match and return their _id
function findParticipantId(name: string, participants: AnyObj[]): string | null {
  const lower = name.toLowerCase();
  const match = participants.find(p => p.name?.toLowerCase() === lower);
  return match?._id || null;
}

// Parse message text and replace @mentions with clickable links
// Matches full participant names (including spaces/surnames)
function MentionText({ text, participants, isOwn }: { text: string; participants: AnyObj[]; isOwn: boolean }) {
  if (!text) return null;

  // Build a regex that matches @FullName for each participant
  const names = participants
    .filter(p => p.name)
    .map(p => p.name)
    .sort((a: string, b: string) => b.length - a.length); // longest first to avoid partial matches

  if (names.length === 0) return <>{text}</>;

  const escaped = names.map((n: string) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const mentionRegex = new RegExp(`(@(?:${escaped.join('|')}))`, 'gi');

  const parts = text.split(mentionRegex);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          const mentionName = part.slice(1);
          const pId = findParticipantId(mentionName, participants);
          if (pId) {
            return (
              <Link
                key={i}
                href={`/app/profile/${pId}`}
                onClick={(e) => e.stopPropagation()}
                className="font-bold underline decoration-1 underline-offset-2 hover:opacity-80 transition-opacity"
              >
                {part}
              </Link>
            );
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// Check if two messages are in the same batch (same sender, within 1 minute, no system messages)
function isSameBatch(a: AnyObj, b: AnyObj): boolean {
  if (a.type === 'system' || b.type === 'system') return false;
  const aId = typeof a.sender_id === 'object' ? a.sender_id?._id : a.sender_id;
  const bId = typeof b.sender_id === 'object' ? b.sender_id?._id : b.sender_id;
  if (aId !== bId) return false;
  const diff = Math.abs(new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return diff < 60000; // 1 minute
}

// Normalize sender ID for comparison
function getSenderId(msg: AnyObj): string {
  return typeof msg.sender_id === 'object' ? msg.sender_id?._id : msg.sender_id;
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
  const [readReceipts, setReadReceipts] = useState<Record<string, AnyObj[]>>({});
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userId = (user as AnyObj)?._id;
  const participants: AnyObj[] = conversation?.participants || [];

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.replace("/app");
  }, [isLoading, isLoggedIn, router]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Build read receipt map: for each user, find the last message they read
  const buildReadReceipts = useCallback((msgs: AnyObj[]) => {
    const lastReadByUser: Record<string, { msgId: string; user: AnyObj }> = {};

    for (const msg of msgs) {
      if (!msg.readBy || !Array.isArray(msg.readBy)) continue;
      for (const reader of msg.readBy) {
        const readerId = typeof reader === 'object' ? reader._id : reader;
        if (readerId === userId) continue;
        if (typeof reader === 'object') {
          lastReadByUser[readerId] = { msgId: msg._id, user: reader };
        }
      }
    }

    const byMsg: Record<string, AnyObj[]> = {};
    Object.values(lastReadByUser).forEach(({ msgId, user: u }) => {
      if (!byMsg[msgId]) byMsg[msgId] = [];
      byMsg[msgId].push(u);
    });

    setReadReceipts(byMsg);
  }, [userId]);

  // Fetch messages
  useEffect(() => {
    if (!conversationId || !isLoggedIn) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = (await api.getMessages(conversationId)) as {
          data: { messages: AnyObj[]; conversation: AnyObj };
        };
        const msgs = res.data.messages || [];
        setMessages(msgs);
        setConversation(res.data.conversation || null);
        buildReadReceipts(msgs);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId, isLoggedIn, buildReadReceipts]);

  // Socket.IO — single connection with all event handlers
  useEffect(() => {
    if (!conversationId || !isLoggedIn || !userId) return;

    const token = getStoredToken();
    const socket = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("joinConversation", conversationId);
      socket.emit("markAsRead", { conversationId });
    });

    // Receive messages — for own messages, update optimistic _id with real one
    socket.on("receiveMessage", (msg: AnyObj) => {
      const senderId = msg.senderId?._id || msg.senderId;
      const isOwnMessage = senderId === userId;
      const msgType = msg.type || 'message';

      setMessages((prev) => {
        // Deduplicate by real _id
        if (msg._id && prev.some(m => m._id === msg._id)) return prev;

        // System messages — always just append
        if (msgType === 'system') {
          return [...prev, {
            _id: msg._id,
            text: msg.content || msg.text,
            type: 'system',
            sender_id: msg.senderId || msg.sender_id,
            readBy: msg.readBy || [],
            createdAt: msg.createdAt,
          }];
        }

        if (isOwnMessage) {
          // Replace the oldest optimistic message with the real server message
          const optIdx = prev.findIndex(m => m.optimistic);
          if (optIdx !== -1) {
            const updated = [...prev];
            updated[optIdx] = {
              _id: msg._id,
              text: msg.content || msg.text,
              type: msgType,
              sender_id: msg.senderId || msg.sender_id,
              readBy: msg.readBy || [],
              createdAt: msg.createdAt,
            };
            return updated;
          }
          return prev; // No optimistic message found, skip (already handled)
        }

        // Message from someone else — add it
        return [...prev, {
          _id: msg._id,
          text: msg.content || msg.text,
          type: msgType,
          sender_id: msg.senderId || msg.sender_id,
          readBy: msg.readBy || [],
          createdAt: msg.createdAt,
        }];
      });
      // Mark as read since we're viewing the chat
      socket.emit("markAsRead", { conversationId });
    });

    // Read receipt updates — someone read messages
    socket.on("messageReadUpdate", (data: AnyObj) => {
      if (data.conversationId !== conversationId) return;
      // Update the specific message's readBy, and also mark all prior messages as read by this user
      setMessages((prev) => {
        const targetIdx = prev.findIndex(m => m._id === data.messageId);
        if (targetIdx === -1) return prev;
        return prev.map((m, i) => {
          if (i <= targetIdx) {
            // Merge readBy arrays — add new readers
            const existingIds = (m.readBy || []).map((r: AnyObj) => typeof r === 'object' ? r._id : r);
            const newReaders = (data.readBy || []).filter((r: AnyObj) => {
              const rid = typeof r === 'object' ? r._id : r;
              return !existingIds.includes(rid);
            });
            if (newReaders.length > 0) {
              return { ...m, readBy: [...(m.readBy || []), ...newReaders] };
            }
          }
          return m;
        });
      });
    });

    socketRef.current = socket;

    return () => {
      socket.emit("leaveConversation", conversationId);
      socket.disconnect();
    };
  }, [conversationId, isLoggedIn, userId]);

  // Rebuild read receipts when messages change
  useEffect(() => {
    if (messages.length > 0) buildReadReceipts(messages);
  }, [messages, buildReadReceipts]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // @mention handling — supports full names with spaces
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);

    const cursorPos = e.target.selectionStart || val.length;
    const textBeforeCursor = val.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1 && (atIndex === 0 || textBeforeCursor[atIndex - 1] === ' ')) {
      const query = textBeforeCursor.slice(atIndex + 1);
      if (query.length < 30) {
        setMentionFilter(query.toLowerCase());
        // Show dropdown if any participant matches
        const hasMatch = participants.some(
          p => typeof p === 'object' && p._id !== userId && p.name?.toLowerCase().includes(query.toLowerCase())
        );
        setShowMentions(hasMatch && query.length > 0);
        return;
      }
    }
    setShowMentions(false);
  };

  const insertMention = (name: string) => {
    const cursorPos = inputRef.current?.selectionStart || text.length;
    const textBeforeCursor = text.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    const before = text.slice(0, atIndex);
    const after = text.slice(cursorPos);
    setText(`${before}@${name} ${after}`);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const filteredMentions = participants.filter(
    p => (typeof p === 'object') && p._id !== userId && p.name?.toLowerCase().includes(mentionFilter)
  );

  const handleSend = () => {
    if (!text.trim() || !socketRef.current) return;

    socketRef.current.emit("sendMessage", {
      conversationId,
      content: text.trim(),
    }, (response: AnyObj) => {
      if (response?.error) {
        console.error("Send failed:", response.error);
      }
    });

    // Optimistic update
    setMessages((prev) => [
      ...prev,
      {
        _id: `opt-${Date.now()}`,
        text: text.trim(),
        sender_id: { _id: userId, name: (user as AnyObj)?.name, image: (user as AnyObj)?.image },
        readBy: [],
        createdAt: new Date().toISOString(),
        optimistic: true,
      },
    ]);

    setText("");
    setShowMentions(false);
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
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold text-neutral-800 truncate">{planName}</h1>
            {participants.length > 0 && (
              <p className="text-xs text-neutral-400 truncate">
                {participants.length} members · {participants.filter(p => typeof p === 'object').map(p => p.name?.split(' ')[0]).join(', ')}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 md:px-4 md:py-4">
        <div className="max-w-2xl mx-auto">
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
              // System messages — centered gray text, no bubble
              if (msg.type === 'system') {
                return (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center mt-4 mb-2"
                  >
                    <span className="text-xs text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">
                      {msg.text}
                    </span>
                  </motion.div>
                );
              }

              const isMe = getSenderId(msg) === userId;
              const senderName = typeof msg.sender_id === "object" ? msg.sender_id?.name : "";

              // Batch logic: same sender within 1 min
              const prevMsg = messages[i - 1];
              const nextMsg = messages[i + 1];
              const isFirstInBatch = !prevMsg || !isSameBatch(prevMsg, msg);
              const isLastInBatch = !nextMsg || !isSameBatch(msg, nextMsg);

              // Show sender name only on first message of a batch from someone else
              const showName = !isMe && isFirstInBatch;

              // Show time only on last message of a batch
              const showTime = isLastInBatch;

              // Read receipts only on the last message of a batch
              const receipts = isLastInBatch ? (readReceipts[msg._id] || []) : [];

              return (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} ${isFirstInBatch ? "mt-3" : "mt-0.5"}`}
                >
                  <div className={`max-w-[80%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                    {showName && senderName && (
                      <span className="text-[11px] text-neutral-400 mb-0.5 ml-3 font-medium">{senderName}</span>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-[var(--brand-green)] text-white rounded-br-md"
                          : "bg-white text-neutral-800 shadow-sm rounded-bl-md"
                      }`}
                    >
                      <MentionText text={msg.text} participants={participants} isOwn={isMe} />
                    </div>
                    {/* Time + read receipts — only on last message of batch */}
                    {(showTime || receipts.length > 0) && (
                      <div className={`flex items-center gap-1 mt-0.5 mx-3 ${isMe ? "flex-row-reverse" : ""}`}>
                        {showTime && (
                          <span className="text-[10px] text-neutral-300">
                            {formatMsgTime(msg.createdAt)}
                          </span>
                        )}
                        {receipts.length > 0 && (
                          <div className="flex -space-x-1 ml-1">
                            {receipts.slice(0, 5).map((r) => (
                              <MiniAvatar key={r._id} user={r} size={14} />
                            ))}
                            {receipts.length > 5 && (
                              <span className="text-[9px] text-neutral-400 ml-1">+{receipts.length - 5}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* @mention dropdown */}
      <AnimatePresence>
        {showMentions && filteredMentions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white border-t border-neutral-200 shadow-lg max-h-40 overflow-y-auto"
          >
            <div className="max-w-2xl mx-auto px-3">
              {filteredMentions.map(p => (
                <button
                  key={p._id}
                  onClick={() => insertMention(p.name)}
                  className="flex items-center gap-2.5 w-full px-2 py-2.5 hover:bg-neutral-50 transition-colors text-left"
                >
                  <MiniAvatar user={p} size={28} />
                  <span className="text-sm font-medium text-neutral-700">{p.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="bg-white border-t border-neutral-100 flex-shrink-0" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-2xl mx-auto px-3 py-2 md:px-4 md:py-3 flex items-center gap-2 md:gap-3">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleTextChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !showMentions) handleSend();
              if (e.key === "Escape") setShowMentions(false);
            }}
            placeholder="Type a message... use @ to mention"
            className="flex-1 px-4 py-3 bg-neutral-100 rounded-2xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] text-base"
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
