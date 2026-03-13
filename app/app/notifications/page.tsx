"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bell, BellOff, Check, X, Loader2, MapPin, Calendar, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { api } from "@/lib/api/client";
import S3Image from "@/components/S3Image";
import Link from "next/link";

interface UserInfo {
  _id: string;
  name: string;
  image?: string;
}

interface PlanInfo {
  _id: string;
  name: string;
  pic_id?: string;
  id?: string;
}

interface NotificationItem {
  _id: string;
  plan_uuid: string;
  requester_id: string;
  creator_id: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  createdAt: string;
  plan?: PlanInfo | null;
  requester?: UserInfo | null;
  creator?: UserInfo | null;
}

interface NearbyPlan {
  _id: string;
  id?: string;
  name: string;
  pic_id?: string;
  city?: string;
  start: string;
  createdAt: string;
  creator_id?: UserInfo | null;
}

type Tab = "activity" | "nearby";

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending" },
    accepted: { bg: "bg-green-100", text: "text-green-700", label: "Accepted" },
    declined: { bg: "bg-red-100", text: "text-red-700", label: "Declined" },
    rejected: { bg: "bg-red-100", text: "text-red-700", label: "Declined" },
    cancelled: { bg: "bg-neutral-100", text: "text-neutral-500", label: "Cancelled" },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function Avatar({ image, name, size = 40 }: { image?: string | null; name?: string; size?: number }) {
  const initials = (name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  if (image) {
    return (
      <S3Image
        fileKey={image}
        alt={name || ""}
        className="rounded-full object-cover shrink-0"
        width={size}
        height={size}
        fallback={
          <div
            style={{ width: size, height: size }}
            className="rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-500 shrink-0"
          >
            {initials}
          </div>
        }
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-500 shrink-0"
    >
      {initials}
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("activity");
  const [incoming, setIncoming] = useState<NotificationItem[]>([]);
  const [outgoing, setOutgoing] = useState<NotificationItem[]>([]);
  const [nearbyPlans, setNearbyPlans] = useState<NearbyPlan[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [plansToRate, setPlansToRate] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications() as {
        success: boolean;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { incoming: NotificationItem[]; outgoing: NotificationItem[]; nearbyPlans: NearbyPlan[]; plansToRate?: any[] };
      };
      if (res.success) {
        setIncoming(res.data.incoming);
        setOutgoing(res.data.outgoing);
        setNearbyPlans(res.data.nearbyPlans || []);
        setPlansToRate(res.data.plansToRate || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace("/app/login");
      return;
    }
    if (isLoggedIn) {
      fetchNotifications();
      // Mark notifications as seen so feed red dot clears
      localStorage.setItem('lastNotifSeenAt', Date.now().toString());
    }
  }, [authLoading, isLoggedIn, router, fetchNotifications]);

  const handleRequestAction = async (requestId: string, action: "accepted" | "rejected") => {
    try {
      setActionLoading(requestId);
      await api.handleRequest(requestId, action);
      setIncoming((prev) =>
        prev.map((n) =>
          n._id === requestId ? { ...n, status: action === "accepted" ? "accepted" : "declined" } : n
        )
      );
    } catch (err) {
      console.error("Failed to handle request:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const allActivity = [...incoming, ...outgoing].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-neutral-100">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="p-1 -ml-1 rounded-full hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <h1 className="text-lg font-bold text-neutral-900">Notifications</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {([
            { key: "activity" as Tab, label: "Activity", count: allActivity.length },
            { key: "nearby" as Tab, label: "New Plans", count: nearbyPlans.length },
          ]).map(({ key, label, count }) => {
            const isActive = tab === key;
            const pendingCount = key === "activity" ? incoming.filter((n) => n.status === "pending").length : 0;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? "text-white shadow-sm"
                    : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300"
                }`}
                style={isActive ? { background: "var(--brand-green)" } : undefined}
              >
                {label}
                {count > 0 && (
                  <span className={`ml-1.5 text-xs ${isActive ? "text-white/80" : "text-neutral-400"}`}>
                    {count}
                  </span>
                )}
                {pendingCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          </div>
        ) : tab === "activity" ? (
          <>
            {/* Plans to rate — for women after plan completion */}
            {plansToRate.length > 0 && (
              <div className="mb-4 space-y-3">
                {plansToRate.map((plan) => (
                  <motion.div key={plan._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Link href={`/app/plan/${plan.id || plan._id}`}>
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl shadow-sm p-4 border border-emerald-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-neutral-800">
                              🎉 You completed &quot;{plan.name}&quot;!
                            </p>
                            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                              Mark the kind ones as Safe 🛡️ and flag anyone who made you uncomfortable ⚠️ — your feedback is 100% anonymous and helps make Slanup a safer space for all women.
                            </p>
                            <span className="inline-block mt-2 text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                              Share Your Experience →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
            {allActivity.length === 0 && plansToRate.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 text-neutral-400">
              <BellOff className="w-12 h-12 mb-3 stroke-[1.5]" />
              <p className="text-sm font-medium">No activity yet</p>
              <p className="text-xs mt-1">Join or create a plan to get started</p>
            </motion.div>
           ) : allActivity.length > 0 ? (
            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {allActivity.map((item, i) => {
                  const isIncoming = incoming.some((n) => n._id === item._id);
                  return (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="bg-white rounded-2xl shadow-sm p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Link href={`/app/profile/${isIncoming ? item.requester_id : item.creator_id}`} className="shrink-0">
                          <Avatar
                            image={isIncoming ? item.requester?.image : item.creator?.image}
                            name={isIncoming ? item.requester?.name : item.creator?.name}
                            size={40}
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-neutral-700 leading-snug">
                            {isIncoming ? (
                              <>
                                <span className="font-semibold text-neutral-900">{item.requester?.name || "Someone"}</span>{" "}
                                requested to join{" "}
                                <Link href={`/app/plan/${item.plan_uuid}`} className="font-semibold text-neutral-900 hover:underline">
                                  {item.plan?.name || "a plan"}
                                </Link>
                              </>
                            ) : (
                              <>
                                You requested to join{" "}
                                <Link href={`/app/plan/${item.plan_uuid}`} className="font-semibold text-neutral-900 hover:underline">
                                  {item.plan?.name || "a plan"}
                                </Link>
                              </>
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <StatusBadge status={item.status} />
                            <span className="text-xs text-neutral-400">{relativeTime(item.createdAt)}</span>
                          </div>
                        </div>
                        {isIncoming && item.status === "pending" && (
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => handleRequestAction(item._id, "accepted")}
                              disabled={actionLoading === item._id}
                              className="w-9 h-9 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50"
                            >
                              {actionLoading === item._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleRequestAction(item._id, "rejected")}
                              disabled={actionLoading === item._id}
                              className="w-9 h-9 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : null}
          </>
        ) : (
          nearbyPlans.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 text-neutral-400">
              <MapPin className="w-12 h-12 mb-3 stroke-[1.5]" />
              <p className="text-sm font-medium">No new plans near you</p>
              <p className="text-xs mt-1">Plans created in your city will appear here</p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3">
              {nearbyPlans.map((plan, i) => (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                >
                  <Link href={`/app/plan/${plan.id || plan._id}`}>
                    <div className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--brand-green)]/10 to-[var(--brand-green)]/5 flex items-center justify-center shrink-0 overflow-hidden">
                          {plan.pic_id ? (
                            <S3Image fileKey={plan.pic_id} alt="" width={48} height={48} className="object-cover w-full h-full rounded-xl" />
                          ) : (
                            <Calendar className="w-5 h-5 text-[var(--brand-green)]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-neutral-700 leading-snug">
                            <span className="font-semibold text-neutral-900">{plan.creator_id?.name || "Someone"}</span>{" "}
                            created a new plan
                          </p>
                          <p className="text-sm font-bold text-neutral-900 mt-0.5 truncate">{plan.name}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            {plan.city && (
                              <span className="text-xs text-neutral-400 flex items-center gap-0.5">
                                <MapPin className="w-3 h-3" /> {plan.city}
                              </span>
                            )}
                            <span className="text-xs text-neutral-400">{relativeTime(plan.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
