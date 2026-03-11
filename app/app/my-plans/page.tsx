"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Plus, Clock } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { api } from "@/lib/api/client";
import S3Image from "@/components/S3Image";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

const tabs = [
  { key: "created", label: "Created" },
  { key: "joined", label: "Joined" },
  { key: "completed", label: "Completed" },
] as const;

function MiniPlanCard({ plan, showStatus }: { plan: AnyObj; showStatus?: boolean }) {
  const startDate = new Date(plan.start);
  const isPast = new Date(plan.end) < new Date();

  return (
    <Link href={`/app/plan/${plan._id || plan.id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        className={`bg-white rounded-2xl shadow-sm overflow-hidden flex gap-4 p-3 ${isPast ? "opacity-60" : ""}`}
      >
        <div className="w-20 h-20 rounded-xl bg-neutral-100 overflow-hidden flex-shrink-0 relative">
          {plan.pic_id ? (
            <S3Image
              fileKey={plan.pic_id}
              alt=""
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--brand-green)]/10 to-[var(--brand-green)]/5">
              <Calendar className="w-6 h-6 text-[var(--brand-green)]/30" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="text-sm font-bold text-neutral-800 truncate">{plan.name}</h3>
          <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" />
            {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at{" "}
            {startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </p>
          {plan.venue_string && (
            <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{plan.venue_string}</span>
            </p>
          )}
          {showStatus && plan.status && (
            <span
              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 w-fit ${
                plan.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : plan.status === "rejected"
                  ? "bg-red-100 text-red-600"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

export default function MyPlansPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"created" | "joined" | "completed">("created");
  const [plans, setPlans] = useState<AnyObj[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.replace("/app");
  }, [isLoading, isLoggedIn, router]);

  const fetchPlans = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      const res = (await api.getMyPlans(activeTab)) as { data: { plans: AnyObj[] } };
      setPlans(res.data.plans || []);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, isLoggedIn]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <h1 className="text-lg font-bold text-neutral-800">My Plans</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-neutral-100 sticky top-[52px] z-40">
        <div className="max-w-2xl mx-auto px-4 flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-semibold text-center transition-colors relative ${
                activeTab === tab.key ? "text-[var(--brand-green)]" : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-green)]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

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
            <Calendar className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-neutral-700 mb-2">
              {activeTab === "created" ? "No plans created" : activeTab === "joined" ? "No plans joined" : "No completed plans"}
            </h2>
            <p className="text-neutral-400 text-sm mb-6">
              {activeTab === "created" ? "Create your first plan!" : "Join a plan from the feed!"}
            </p>
            {activeTab === "created" && (
              <Link
                href="/app/create"
                className="inline-flex items-center gap-2 bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-3 px-6 rounded-2xl transition-colors"
              >
                <Plus className="w-5 h-5" /> Create a plan
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan, i) => (
              <motion.div key={plan._id || plan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <MiniPlanCard plan={plan} showStatus={activeTab === "created"} />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
