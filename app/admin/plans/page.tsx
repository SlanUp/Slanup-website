"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Check, X, MapPin, Calendar, Clock, Users, ChevronDown, Instagram, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { api } from "@/lib/api/client";
import S3Image from "@/components/S3Image";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function PendingPlanCard({
  plan,
  onApprove,
  onReject,
  loading,
}: {
  plan: AnyObj;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-white rounded-2xl shadow-md overflow-hidden"
    >
      {/* Plan header */}
      <div className="flex gap-4 p-4">
        <div className="w-24 h-24 rounded-xl bg-neutral-100 overflow-hidden flex-shrink-0 relative">
          {plan.pic_id ? (
            <S3Image
              fileKey={plan.pic_id}
              alt=""
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--brand-green)]/10 to-[var(--brand-green)]/5">
              <Calendar className="w-8 h-8 text-[var(--brand-green)]/30" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-neutral-800 truncate">{plan.name}</h3>
          <div className="flex flex-col gap-1 mt-2 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {formatDate(plan.start)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {formatTime(plan.start)} — {formatTime(plan.end)}
            </span>
            {plan.venue_string && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {plan.venue_string}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Max {plan.max_people} people
            </span>
          </div>
        </div>
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 flex items-center justify-between text-xs text-neutral-400 hover:bg-neutral-50 transition-colors border-t border-neutral-100"
      >
        <span>Details & Creator Profile</span>
        <motion.span animate={{ rotate: expanded ? 180 : 0 }}>
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Description */}
              {plan.desc && (
                <div>
                  <h4 className="text-xs font-bold text-neutral-500 mb-1">Description</h4>
                  <p className="text-sm text-neutral-600 whitespace-pre-wrap">{plan.desc}</p>
                </div>
              )}

              {/* Creator */}
              <div className="bg-neutral-50 rounded-xl p-3">
                <h4 className="text-xs font-bold text-neutral-500 mb-2">Created by</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-green)] to-green-600 flex items-center justify-center text-white font-semibold overflow-hidden">
                    {plan.creator_id?.image ? (
                      <S3Image
                        fileKey={plan.creator_id.image}
                        alt=""
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      plan.creator_id?.name?.charAt(0)?.toUpperCase() || "?"
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-neutral-800">{plan.creator_id?.name}</p>
                    {plan.creator_id?.email && (
                      <p className="text-xs text-neutral-500">{plan.creator_id.email}</p>
                    )}
                    {plan.creator_id?.instagramHandle && (
                      <a
                        href={`https://instagram.com/${plan.creator_id.instagramHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-neutral-500 flex items-center gap-1 hover:text-[var(--brand-green)]"
                      >
                        <Instagram className="w-3 h-3" /> @{plan.creator_id.instagramHandle}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                {plan.creator_id?.desc && (
                  <p className="text-xs text-neutral-500 mt-2">{plan.creator_id.desc}</p>
                )}
              </div>

              {/* Tags */}
              {plan.tags?.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {plan.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 bg-[var(--brand-green)]/8 text-[var(--brand-green)] text-xs rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex border-t border-neutral-100">
        <button
          onClick={onReject}
          disabled={loading}
          className="flex-1 py-3 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 font-semibold text-sm transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" /> Reject
        </button>
        <div className="w-px bg-neutral-100" />
        <button
          onClick={onApprove}
          disabled={loading}
          className="flex-1 py-3 flex items-center justify-center gap-2 text-green-600 hover:bg-green-50 font-semibold text-sm transition-colors disabled:opacity-50"
        >
          <Check className="w-4 h-4" /> Approve
        </button>
      </div>
    </motion.div>
  );
}

export default function AdminPlansPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading, user } = useAuth();
  const [plans, setPlans] = useState<AnyObj[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const res = (await api.getAdminPlans()) as { data: { plans: AnyObj[] } };
      setPlans(res.data.plans || []);
    } catch {
      // not admin or error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/app");
      return;
    }
    if (isLoggedIn) fetchPending();
  }, [isLoading, isLoggedIn, fetchPending, router]);

  const handleApprove = async (planId: string) => {
    setActionLoading(planId);
    try {
      await api.approvePlan(planId);
      setPlans((prev) => prev.filter((p) => (p._id || p.id) !== planId));
    } catch {
      alert("Failed to approve");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (planId: string) => {
    const reason = prompt("Rejection reason (optional):");
    setActionLoading(planId);
    try {
      await api.rejectPlan(planId, reason || undefined);
      setPlans((prev) => prev.filter((p) => (p._id || p.id) !== planId));
    } catch {
      alert("Failed to reject");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Shield className="w-6 h-6 text-[var(--brand-green)]" />
          <div>
            <h1 className="text-lg font-bold text-neutral-800">Plan Approvals</h1>
            <p className="text-xs text-neutral-400">Admin Dashboard</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-3 border-[var(--brand-green)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Check className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-neutral-700 mb-2">All caught up!</h2>
            <p className="text-neutral-400">No pending plans to review.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-neutral-500 font-medium">{plans.length} plan{plans.length !== 1 ? "s" : ""} pending review</p>
            <AnimatePresence>
              {plans.map((plan) => (
                <PendingPlanCard
                  key={plan._id || plan.id}
                  plan={plan}
                  onApprove={() => handleApprove(plan._id || plan.id)}
                  onReject={() => handleReject(plan._id || plan.id)}
                  loading={actionLoading === (plan._id || plan.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
