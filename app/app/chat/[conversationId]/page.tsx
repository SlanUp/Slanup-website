"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, X, Reply, Copy, ShieldCheck } from "lucide-react";
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

  const names = participants
    .filter(p => p.name)
    .map(p => p.name)
    .sort((a: string, b: string) => b.length - a.length);

  if (names.length === 0 && !text.includes('@everyone')) return <>{text}</>;

  const escaped = names.map((n: string) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const allPatterns = ['everyone', ...escaped];
  const mentionRegex = new RegExp(`(@(?:${allPatterns.join('|')}))`, 'gi');

  const parts = text.split(mentionRegex);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          if (part.toLowerCase() === '@everyone') {
            return (
              <span key={i} className={`font-bold ${isOwn ? 'text-white' : 'text-[var(--brand-green)]'}`}>
                @everyone
              </span>
            );
          }
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
  const [replyTo, setReplyTo] = useState<AnyObj | null>(null);
  const [activeReactionMsg, setActiveReactionMsg] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isAutoScrolling = useRef(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(true); // default true to avoid flash

  const userId = (user as AnyObj)?._id;
  const participants: AnyObj[] = conversation?.participants || [];

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.replace("/app");
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    const accepted = localStorage.getItem("slanup_chat_disclaimer_accepted");
    setDisclaimerAccepted(accepted === "true");
  }, []);

  const scrollToBottom = useCallback(() => {
    isAutoScrolling.current = true;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => { isAutoScrolling.current = false; }, 500);
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
      const replyData = msg.replyTo ? { _id: msg.replyTo._id, text: msg.replyTo.content || msg.replyTo.text, sender_id: msg.replyTo.senderId || msg.replyTo.sender_id } : null;

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
            reactions: [],
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
              reactions: msg.reactions || [],
              replyTo: replyData,
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
          reactions: msg.reactions || [],
          replyTo: replyData,
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

    socket.on("reactionUpdate", (data: AnyObj) => {
      setMessages((prev) =>
        prev.map((m) => m._id === data.messageId ? { ...m, reactions: data.reactions } : m)
      );
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
        const hasMatch = participants.some(
          p => typeof p === 'object' && p._id !== userId && p.name?.toLowerCase().includes(query.toLowerCase())
        );
        const everyoneMatches = 'everyone'.includes(query.toLowerCase());
        setShowMentions((hasMatch || everyoneMatches) && query.length >= 0);
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
      ...(replyTo && { replyTo: replyTo._id }),
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
        reactions: [],
        replyTo: replyTo ? { _id: replyTo._id, text: replyTo.text, sender_id: replyTo.sender_id } : null,
        createdAt: new Date().toISOString(),
        optimistic: true,
      },
    ]);

    setText("");
    setReplyTo(null);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const QUICK_EMOJIS = ["❤️", "😂", "👍", "😮", "😢", "🔥"];

  const handleReact = (messageId: string, emoji: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("reactToMessage", { messageId, emoji });
    // Optimistic toggle
    setMessages((prev) =>
      prev.map((m) => {
        if (m._id !== messageId) return m;
        const reactions = [...(m.reactions || [])];
        const idx = reactions.findIndex((r: AnyObj) => r.userId === userId && r.emoji === emoji);
        if (idx !== -1) reactions.splice(idx, 1);
        else reactions.push({ emoji, userId });
        return { ...m, reactions };
      })
    );
    setActiveReactionMsg(null);
  };

  const handleReply = (msg: AnyObj) => {
    setReplyTo(msg);
    setActiveReactionMsg(null);
    inputRef.current?.focus();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setActiveReactionMsg(null);
  };

  const swipeMsgRef = useRef<{ id: string; startX: number; el: HTMLElement } | null>(null);

  const onTouchStart = (msg: AnyObj, e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartPos.current = { x: t.clientX, y: t.clientY };
    swipeMsgRef.current = { id: msg._id, startX: t.clientX, el: e.currentTarget as HTMLElement };
    longPressTimer.current = setTimeout(() => {
      longPressTimer.current = null;
      setActiveReactionMsg(msg._id);
      // Haptic feedback if available
      if (navigator.vibrate) navigator.vibrate(10);
    }, 500);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartPos.current.x;
    const dy = Math.abs(t.clientY - touchStartPos.current.y);

    // Cancel long-press on any movement
    if (longPressTimer.current && (Math.abs(dx) > 8 || dy > 8)) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Swipe right detection (only positive direction, not for own messages handled at render)
    if (swipeMsgRef.current && dx > 10 && dy < 30) {
      const offset = Math.min(dx - 10, 60);
      swipeMsgRef.current.el.style.transform = `translateX(${offset}px)`;
      swipeMsgRef.current.el.style.transition = 'none';
    }
  };

  const onTouchEnd = (msg: AnyObj) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Check if swiped far enough to trigger reply
    if (swipeMsgRef.current && touchStartPos.current) {
      const el = swipeMsgRef.current.el;
      const currentTransform = el.style.transform;
      el.style.transition = 'transform 0.2s ease';
      el.style.transform = 'translateX(0)';

      const match = currentTransform.match(/translateX\((\d+)/);
      if (match && parseInt(match[1]) > 40) {
        handleReply(msg);
        if (navigator.vibrate) navigator.vibrate(10);
      }
    }
    swipeMsgRef.current = null;
    touchStartPos.current = null;
  };

  const acceptDisclaimer = () => {
    localStorage.setItem("slanup_chat_disclaimer_accepted", "true");
    setDisclaimerAccepted(true);
  };

  const planName = conversation?.plan_id?.name || "Group Chat";

  if (!disclaimerAccepted) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-neutral-50 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-br from-[var(--brand-green)] to-green-700 px-6 py-8 text-center">
            <ShieldCheck className="w-12 h-12 text-white mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white">Before you chat</h2>
          </div>
          <div className="px-6 py-6 space-y-4">
            <p className="text-sm text-neutral-700 leading-relaxed">
              Slanup is built for real-world plans with real people. This is <strong>not a dating app</strong> — it&apos;s a place to meet, plan, and have fun respectfully.
            </p>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <span className="text-lg">🛡️</span>
                <p className="text-sm text-neutral-600"><strong className="text-neutral-800">Safety matters.</strong> Women can mark you as <span className="text-emerald-600 font-semibold">&quot;Felt Safe&quot;</span> or <span className="text-red-500 font-semibold">flag your profile</span> based on your behaviour.</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-lg">🤝</span>
                <p className="text-sm text-neutral-600"><strong className="text-neutral-800">Be respectful.</strong> Treat everyone the way you&apos;d want to be treated. No creepy DMs, no harassment.</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-lg">🎉</span>
                <p className="text-sm text-neutral-600"><strong className="text-neutral-800">Have fun!</strong> That&apos;s what this is all about. Great plans, great people, great memories.</p>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <button
              onClick={acceptDisclaimer}
              className="w-full bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
            >
              I understand, let&apos;s go 🚀
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm z-10 flex-shrink-0" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-2xl mx-auto px-4 py-2 md:py-3 flex items-center gap-3">
          <button onClick={() => { if (window.history.length > 1) { router.back(); } else { router.push('/app/feed'); } }} className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <div className="min-w-0 flex-1">
            <Link href={`/app/plan/${conversation?.plan_id?.id || conversation?.plan_id?._id || ''}`}>
              <h1 className="text-base font-bold text-neutral-800 truncate hover:text-[var(--brand-green)] transition-colors">{planName}</h1>
            </Link>
            {participants.length > 0 && (
              <p className="text-xs text-neutral-400 truncate">
                {participants.length} members · {participants.filter(p => typeof p === 'object').map(p => p.name?.split(' ')[0]).join(', ')}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-3 py-3 md:px-4 md:py-4"
        onScroll={() => { if (!isAutoScrolling.current) inputRef.current?.blur(); setActiveReactionMsg(null); }}
        onClick={() => setActiveReactionMsg(null)}
      >
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

              // Group reactions by emoji
              const reactionGroups: Record<string, string[]> = {};
              (msg.reactions || []).forEach((r: AnyObj) => {
                if (!reactionGroups[r.emoji]) reactionGroups[r.emoji] = [];
                reactionGroups[r.emoji].push(r.userId);
              });

              const replyName = msg.replyTo?.sender_id?.name || msg.replyTo?.sender_id;
              const replyPreview = msg.replyTo?.text?.slice(0, 40) + (msg.replyTo?.text?.length > 40 ? "…" : "");

              const scrollToMessage = (msgId: string) => {
                const el = document.getElementById(`msg-${msgId}`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  el.classList.add('bg-yellow-50');
                  setTimeout(() => el.classList.remove('bg-yellow-50'), 1500);
                }
              };

              return (
                <motion.div
                  key={msg._id}
                  id={`msg-${msg._id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} ${isFirstInBatch ? "mt-3" : "mt-0.5"} relative group transition-colors duration-500`}
                >
                  <div
                    className={`max-w-[80%] ${isMe ? "items-end" : "items-start"} flex flex-col relative select-none`}
                    onTouchStart={(e) => onTouchStart(msg, e)}
                    onTouchMove={onTouchMove}
                    onTouchEnd={() => onTouchEnd(msg)}
                    onDoubleClick={() => handleReact(msg._id, "❤️")}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    {showName && senderName && (
                      <span className="text-[11px] text-neutral-400 mb-0.5 ml-3 font-medium">{senderName}</span>
                    )}

                    {/* Reply preview */}
                    {msg.replyTo && (
                      <div
                        onClick={() => msg.replyTo?._id && scrollToMessage(msg.replyTo._id)}
                        className={`mx-1 mb-0.5 px-3 py-1.5 rounded-xl text-[11px] border-l-2 cursor-pointer max-w-[240px] ${
                        isMe
                          ? "bg-[var(--brand-green)]/20 border-white/40 text-white/70"
                          : "bg-neutral-100 border-[var(--brand-green)] text-neutral-500"
                      }`}>
                        <span className="font-semibold">{replyName}</span>
                        <p className="truncate opacity-80">{replyPreview}</p>
                      </div>
                    )}

                    <div
                      style={{ overflowWrap: 'anywhere' }}
                      className={`px-4 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                        isMe
                          ? "bg-[var(--brand-green)] text-white rounded-br-md"
                          : "bg-white text-neutral-800 shadow-sm rounded-bl-md"
                      }`}
                    >
                      <MentionText text={msg.text} participants={participants} isOwn={isMe} />
                    </div>

                    {/* Reactions display */}
                    {Object.keys(reactionGroups).length > 0 && (
                      <div className={`flex flex-wrap gap-1 mt-0.5 mx-1 ${isMe ? "justify-end" : "justify-start"}`}>
                        {Object.entries(reactionGroups).map(([emoji, users]) => {
                          const names = users.map((uid) => {
                            if (uid === userId) return "You";
                            const p = participants.find((pp: AnyObj) => pp._id === uid);
                            return p?.name?.split(" ")[0] || "Someone";
                          });
                          return (
                            <button
                              key={emoji}
                              onClick={(e) => { e.stopPropagation(); handleReact(msg._id, emoji); }}
                              title={names.join(", ")}
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-colors ${
                                users.includes(userId)
                                  ? "bg-[var(--brand-green)]/10 border-[var(--brand-green)]/30"
                                  : "bg-white border-neutral-200"
                              }`}
                            >
                              <span>{emoji}</span>
                              {users.length > 1 && <span className="text-[10px] text-neutral-500">{users.length}</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Hover actions (desktop) */}
                    <div className={`hidden group-hover:flex absolute top-0 ${isMe ? "-left-16" : "-right-16"} gap-0.5`}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReply(msg); }}
                        className="w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-neutral-50 transition-colors"
                        title="Reply"
                      >
                        <Reply className="w-3.5 h-3.5 text-neutral-500" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveReactionMsg(activeReactionMsg === msg._id ? null : msg._id); }}
                        className="w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-neutral-50 transition-colors text-xs"
                        title="React"
                      >
                        😊
                      </button>
                    </div>

                    {/* Reaction picker (mobile long-press or desktop click) */}
                    <AnimatePresence>
                      {activeReactionMsg === msg._id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: 4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: 4 }}
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute ${isMe ? "right-0" : "left-0"} -top-12 z-20 flex flex-col items-center gap-1`}
                        >
                          <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 px-2 py-1.5 flex gap-0.5">
                            {QUICK_EMOJIS.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleReact(msg._id, emoji)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 active:scale-110 transition-all text-lg"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                          <div className="bg-white rounded-xl shadow-lg border border-neutral-100 overflow-hidden flex">
                            <button
                              onClick={() => { handleReply(msg); }}
                              className="flex items-center gap-1.5 px-3 py-2 hover:bg-neutral-50 active:bg-neutral-100 transition-colors text-xs font-medium text-neutral-600 border-r border-neutral-100"
                            >
                              <Reply className="w-3.5 h-3.5" /> Reply
                            </button>
                            <button
                              onClick={() => handleCopy(msg.text)}
                              className="flex items-center gap-1.5 px-3 py-2 hover:bg-neutral-50 active:bg-neutral-100 transition-colors text-xs font-medium text-neutral-600"
                            >
                              <Copy className="w-3.5 h-3.5" /> Copy
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

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
        {showMentions && (filteredMentions.length > 0 || 'everyone'.includes(mentionFilter)) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white border-t border-neutral-200 shadow-lg max-h-40 overflow-y-auto"
          >
            <div className="max-w-2xl mx-auto px-3">
              {'everyone'.includes(mentionFilter) && (
                <button
                  onClick={() => insertMention('everyone')}
                  className="flex items-center gap-2.5 w-full px-2 py-2.5 hover:bg-neutral-50 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-[var(--brand-green)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">@</div>
                  <span className="text-sm font-medium text-neutral-700">everyone</span>
                  <span className="text-xs text-neutral-400 ml-auto">Notify all members</span>
                </button>
              )}
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

      {/* Reply banner */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-t border-neutral-100 overflow-hidden"
          >
            <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-3">
              <div className="w-0.5 h-8 bg-[var(--brand-green)] rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--brand-green)]">
                  {typeof replyTo.sender_id === 'object' ? replyTo.sender_id?.name : 'Message'}
                </p>
                <p className="text-xs text-neutral-500 truncate">{replyTo.text}</p>
              </div>
              <button onClick={() => setReplyTo(null)} className="p-1 rounded-full hover:bg-neutral-100 flex-shrink-0">
                <X className="w-4 h-4 text-neutral-400" />
              </button>
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
            onMouseDown={(e) => e.preventDefault()}
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
