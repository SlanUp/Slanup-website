"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { api } from "@/lib/api/client";
import S3Image from "@/components/S3Image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

interface Conversation {
  _id: string;
  participants: { name: string; image?: string; _id: string }[];
  lastMessage?: { content: string; createdAt: string; sender: string };
  plan_id?: { name: string; pic_id?: string; start?: string; end?: string };
  plan?: { name: string; pic_id?: string; start?: string; end?: string };
  type: string;
  unreadMessagesCount: number;
  updatedAt: string;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ConversationCard({ conversation }: { conversation: Conversation }) {
  const plan = conversation.plan_id || conversation.plan;
  const lastMsg = conversation.lastMessage;
  const unread = conversation.unreadMessagesCount;

  return (
    <Link href={`/app/chat/${conversation._id}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
        className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm cursor-pointer transition-colors"
      >
        {/* Plan image */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--brand-green)] to-green-600 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0 overflow-hidden">
          {plan?.pic_id ? (
            <S3Image fileKey={plan.pic_id} alt={plan.name || ""} width={48} height={48} className="object-cover w-full h-full" />
          ) : (
            <MessageCircle className="w-5 h-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className={`text-sm truncate ${unread > 0 ? "font-bold text-neutral-900" : "font-semibold text-neutral-800"}`}>
              {plan?.name || "Group Chat"}
            </h3>
            {lastMsg?.createdAt && (
              <span className={`text-xs flex-shrink-0 ${unread > 0 ? "text-[var(--brand-green)] font-semibold" : "text-neutral-400"}`}>
                {formatRelativeTime(lastMsg.createdAt)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className={`text-xs truncate ${unread > 0 ? "text-neutral-600 font-medium" : "text-neutral-400"}`}>
              {lastMsg?.content || "No messages yet"}
            </p>
            {unread > 0 && (
              <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-[var(--brand-green)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function ChatsPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/app");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = (await api.getConversations()) as AnyObj;
        const primary: Conversation[] = res.primary || res.data?.primary || [];
        // Sort by most recent activity
        primary.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setConversations(primary);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [isLoggedIn]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 shadow-sm safe-top">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => { if (window.history.length > 1) router.back(); else router.push('/app/feed'); }} className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <h1 className="text-lg font-bold text-neutral-800">Chats</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-3 border-[var(--brand-green)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <MessageCircle className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-neutral-700 mb-2">No chats yet</h2>
            <p className="text-neutral-500 text-sm mb-6">
              Join a plan to start chatting with other members!
            </p>
            <Link
              href="/app/feed"
              className="inline-flex items-center gap-2 bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-3 px-6 rounded-2xl transition-colors"
            >
              Browse plans
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv, i) => (
              <motion.div key={conv._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <ConversationCard conversation={conv} />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
