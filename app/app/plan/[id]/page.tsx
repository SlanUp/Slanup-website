"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Clock, Users, Check, X, Send, MessageCircle, Instagram, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { api } from "@/lib/api/client";
import S3Image from "@/components/S3Image";


function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function Avatar({ image, name, size = 40 }: { image?: string; name?: string; size?: number }) {
  return (
    <div
      className="rounded-full bg-gradient-to-br from-[var(--brand-green)] to-green-600 flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {image ? (
        <S3Image fileKey={image} alt="" width={size} height={size} className="object-cover w-full h-full" />
      ) : (
        name?.charAt(0)?.toUpperCase() || "?"
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const planId = params.id as string;

  const [plan, setPlan] = useState<AnyObj | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [requests, setRequests] = useState<AnyObj[]>([]);
  const [showRequests, setShowRequests] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const userId = (user as AnyObj)?._id;
  const isHost = plan?.creator_id?._id === userId;
  const isParticipant = plan?.participants?.some((p: AnyObj) => p._id === userId);
  const slotsLeft = plan ? plan.max_people - (plan.participants?.length || 0) : 0;

  const fetchPlan = useCallback(async () => {
    try {
      setLoading(true);
      const res = (await api.getPlan(planId)) as { data: { plan: AnyObj; userRequestStatus?: string } };
      setPlan(res.data.plan);
      if (res.data.userRequestStatus) {
        setHasRequested(true);
      }
    } catch {
      // plan not found
    } finally {
      setLoading(false);
    }
  }, [planId]);

  const fetchRequests = useCallback(async () => {
    if (!isHost) return;
    try {
      const res = (await api.getPlanRequests(planId)) as { data: { requests: AnyObj[] } };
      setRequests(res.data.requests);
    } catch {
      // ignore
    }
  }, [planId, isHost]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  useEffect(() => {
    if (isHost) fetchRequests();
  }, [isHost, fetchRequests]);

  const handleJoinRequest = async () => {
    setRequesting(true);
    try {
      await api.requestJoin(planId);
      setHasRequested(true);
    } catch {
      alert("Could not send request. You may have already requested.");
    } finally {
      setRequesting(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: "accepted" | "rejected") => {
    setActionLoading(requestId);
    try {
      await api.handleRequest(requestId, action);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      if (action === "accepted") fetchPlan();
    } catch {
      alert("Failed to process request");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--brand-green)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-4">
        <p className="text-neutral-500 text-lg">Plan not found</p>
        <Link href="/app/feed" className="text-[var(--brand-green)] font-semibold hover:underline">← Back to Feed</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Image */}
      <div className="relative w-full h-48 md:h-64 lg:h-80 bg-neutral-200">
        {plan.pic_id ? (
          <S3Image
            fileKey={plan.pic_id}
            alt={plan.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--brand-green)]/20 to-[var(--brand-green)]/5">
            <Calendar className="w-20 h-20 text-[var(--brand-green)]/30" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-11 h-11 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md z-10"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-800" />
        </button>
      </div>

      <main className="max-w-2xl mx-auto px-4 -mt-12 relative z-10 pb-24 md:pb-32">
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h1 className="text-2xl font-bold text-neutral-800">{plan.name}</h1>

          <div className="flex flex-col gap-3 mt-4">
            <div className="flex items-center gap-3 text-neutral-600">
              <Calendar className="w-5 h-5 text-[var(--brand-green)]" />
              <span className="text-sm">{formatDate(plan.start)}</span>
            </div>
            <div className="flex items-center gap-3 text-neutral-600">
              <Clock className="w-5 h-5 text-[var(--brand-green)]" />
              <span className="text-sm">{formatTime(plan.start)} — {formatTime(plan.end)}</span>
            </div>
            {plan.venue_string && (
              <div className="flex items-center gap-3 text-neutral-600">
                <MapPin className="w-5 h-5 text-[var(--brand-green)]" />
                <span className="text-sm">{plan.venue_string}</span>
              </div>
            )}
            {plan.city && (
              <div className="flex items-center gap-3 text-neutral-600">
                <MapPin className="w-5 h-5 text-[var(--brand-green)]" />
                <span className="text-sm font-medium">{plan.city}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-neutral-600">
              <Users className="w-5 h-5 text-[var(--brand-green)]" />
              <span className="text-sm">{plan.participants?.length || 0} / {plan.max_people} people</span>
            </div>
          </div>

          {plan.desc && (
            <div className="mt-5 pt-5 border-t border-neutral-100">
              <h2 className="text-sm font-bold text-neutral-700 mb-2">About this plan</h2>
              <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">{plan.desc}</p>
            </div>
          )}

          {plan.tags?.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-4">
              {plan.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-[var(--brand-green)]/8 text-[var(--brand-green)] text-xs rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Host */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-5 mt-4"
        >
          <h2 className="text-sm font-bold text-neutral-700 mb-3">Hosted by</h2>
          <Link href={`/app/profile/${plan.creator_id?._id}`} className="flex items-center gap-3 hover:bg-neutral-50 -mx-2 px-2 py-2 rounded-xl transition-colors">
            <Avatar image={plan.creator_id?.image} name={plan.creator_id?.name} size={48} />
            <div>
              <p className="font-semibold text-neutral-800">{plan.creator_id?.name}</p>
              {plan.creator_id?.instagramHandle && (
                <p className="text-xs text-neutral-500 flex items-center gap-1">
                  <Instagram className="w-3 h-3" /> @{plan.creator_id.instagramHandle}
                </p>
              )}
            </div>
          </Link>
        </motion.div>

        {/* Participants */}
        {plan.participants?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-5 mt-4"
          >
            <h2 className="text-sm font-bold text-neutral-700 mb-3">
              People going ({plan.participants.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              {plan.participants.map((p: AnyObj) => (
                <Link key={p._id} href={`/app/profile/${p._id}`} className="flex items-center gap-2 bg-neutral-50 rounded-full pr-3 hover:bg-neutral-100 transition-colors">
                  <Avatar image={p.image} name={p.name} size={32} />
                  <span className="text-sm text-neutral-700">{p.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Host: Pending Requests */}
        {isHost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-5 mt-4"
          >
            <button
              onClick={() => setShowRequests(!showRequests)}
              className="flex items-center justify-between w-full"
            >
              <h2 className="text-sm font-bold text-neutral-700">
                Pending Requests {requests.length > 0 && <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{requests.length}</span>}
              </h2>
              <motion.span animate={{ rotate: showRequests ? 180 : 0 }} className="text-neutral-400">▼</motion.span>
            </button>

            <AnimatePresence>
              {showRequests && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {requests.length === 0 ? (
                    <p className="text-sm text-neutral-400 mt-3">No pending requests</p>
                  ) : (
                    <div className="flex flex-col gap-3 mt-3">
                      {requests.map((req) => (
                        <div key={req._id} className="flex items-center justify-between bg-neutral-50 p-3 rounded-xl">
                          <Link href={`/app/profile/${req.user_id?._id}`} className="flex items-center gap-3">
                            <Avatar image={req.user_id?.image} name={req.user_id?.name} size={40} />
                            <div>
                              <p className="font-semibold text-sm text-neutral-800">{req.user_id?.name}</p>
                              {req.user_id?.instagramHandle && (
                                <p className="text-xs text-neutral-500">@{req.user_id.instagramHandle}</p>
                              )}
                            </div>
                          </Link>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRequestAction(req._id, "accepted")}
                              disabled={actionLoading === req._id}
                              className="w-9 h-9 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRequestAction(req._id, "rejected")}
                              disabled={actionLoading === req._id}
                              className="w-9 h-9 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Bottom Action Bar */}
      {!isHost && !isParticipant && slotsLeft > 0 && new Date(plan.end) > new Date() && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-4 z-50" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <div className="max-w-2xl mx-auto flex gap-3">
            <button
              onClick={handleJoinRequest}
              disabled={requesting || hasRequested}
              className={`flex-1 font-semibold py-3 md:py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2 ${
                hasRequested
                  ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                  : 'bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white disabled:opacity-60'
              }`}
            >
              {hasRequested ? (
                <><CheckCircle className="w-5 h-5" /> Requested</>
              ) : requesting ? (
                "Sending..."
              ) : (
                <><Send className="w-5 h-5" /> Request to Join</>
              )}
            </button>
          </div>
        </div>
      )}

      {(isParticipant || isHost) && plan.conversation_id && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-4 z-50" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <div className="max-w-2xl mx-auto">
            <Link
              href={`/app/chat/${typeof plan.conversation_id === 'object' ? plan.conversation_id._id : plan.conversation_id}`}
              className="w-full bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-3 md:py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Open Group Chat
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
