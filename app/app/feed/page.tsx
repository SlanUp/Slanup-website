"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Plus, MapPin, Calendar, Heart, LogOut, User as UserIcon, LayoutList } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { api } from "@/lib/api/client";
import S3Image from "@/components/S3Image";

interface Plan {
  id: string;
  _id: string;
  name: string;
  desc?: string;
  pic_id?: string;
  start: string;
  end: string;
  venue_string?: string;
  tags?: string[];
  max_people: number;
  participants: { _id: string; name: string; image?: string }[];
  likes?: string[];
  creator_id: { _id: string; name: string; image?: string; instagramHandle?: string };
  createdAt: string;
}


function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(date: string) {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function PlanCard({ plan }: { plan: Plan }) {
  const slotsLeft = plan.max_people - plan.participants.length;
  const startDate = new Date(plan.start);

  return (
    <Link href={`/app/plan/${plan.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer"
      >
        {/* Creator */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--brand-green)] to-green-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
              {plan.creator_id?.image ? (
                <S3Image fileKey={plan.creator_id.image} alt="" width={36} height={36} className="object-cover w-full h-full" />
              ) : (
                plan.creator_id?.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
            <div>
              <p className="text-sm">
                <span className="font-bold">{plan.creator_id?.name}</span>
                <span className="text-neutral-500"> shared a Plan</span>
              </p>
              <p className="text-xs text-neutral-400">{formatDate(plan.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="w-full h-48 bg-neutral-100 relative overflow-hidden">
          {plan.pic_id ? (
            <S3Image
              fileKey={plan.pic_id}
              alt={plan.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--brand-green)]/10 to-[var(--brand-green)]/5">
              <Calendar className="w-12 h-12 text-[var(--brand-green)]/30" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Date badge */}
            <div className="flex flex-col items-center justify-center px-3 py-2 bg-neutral-50 rounded-xl -mt-10 relative z-10 shadow-md min-w-[52px]">
              <span className="text-lg font-bold text-neutral-800">{startDate.getDate()}</span>
              <span className="text-xs font-bold text-red-500">
                {startDate.toLocaleString('default', { month: 'short' })}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-neutral-800 truncate">{plan.name}</h3>
              {plan.venue_string && (
                <p className="text-sm text-neutral-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{plan.venue_string}</span>
                </p>
              )}
              <p className="text-xs text-neutral-400 mt-0.5">
                {formatTime(plan.start)} — {formatTime(plan.end)}
              </p>
            </div>
          </div>

          {/* Participants + Slots */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {plan.participants.slice(0, 4).map((p, i) => (
                  <div key={p._id} className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-[var(--brand-green)] to-green-600 flex items-center justify-center text-white text-[10px] font-semibold overflow-hidden" style={{ zIndex: 4 - i }}>
                    {p.image ? (
                      <S3Image fileKey={p.image} alt="" width={28} height={28} className="object-cover w-full h-full" />
                    ) : (
                      p.name?.charAt(0)?.toUpperCase() || '?'
                    )}
                  </div>
                ))}
              </div>
              {plan.participants.length > 4 && (
                <span className="text-xs text-neutral-500">+{plan.participants.length - 4}</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {slotsLeft > 0 ? (
                <span className="text-xs font-medium text-red-500">
                  {slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} left
                </span>
              ) : (
                <span className="text-xs font-medium text-neutral-400">Full</span>
              )}
              <Heart className="w-4 h-4 text-neutral-300" />
            </div>
          </div>

          {/* Tags */}
          {plan.tags && plan.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-3">
              {plan.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-[var(--brand-green)]/8 text-[var(--brand-green)] text-xs rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

export default function FeedPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading, isNewUser, logout } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/app");
    }
    if (!isLoading && isLoggedIn && isNewUser) {
      router.replace("/app/onboarding");
    }
  }, [isLoading, isLoggedIn, isNewUser, router]);

  const fetchPlans = useCallback(async (q?: string) => {
    try {
      setLoading(true);
      const res = await api.getPlans(1, q) as { data: { plans: Plan[] } };
      setPlans(res.data.plans);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && !isNewUser) fetchPlans();
  }, [isLoggedIn, isNewUser, fetchPlans]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) fetchPlans(search);
      else fetchPlans();
    }, 400);
    return () => clearTimeout(timer);
  }, [search, fetchPlans]);

  const userName = (user as Record<string, unknown>)?.name as string || 'there';

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/app/feed" className="flex items-end hover:opacity-80 transition-opacity">
            <span className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-neutral-800">slanup</span>
            <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--brand-green)] -ml-0.5">&apos;</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/app/my-plans" className="p-2 rounded-xl hover:bg-neutral-100 transition-colors" title="My Plans">
              <LayoutList className="w-5 h-5 text-neutral-600" />
            </Link>
            <Link href={`/app/profile/${(user as Record<string, unknown>)?._id}`} className="p-2 rounded-xl hover:bg-neutral-100 transition-colors" title="Profile">
              <UserIcon className="w-5 h-5 text-neutral-600" />
            </Link>
            <button onClick={() => { logout(); router.replace("/app"); }} className="p-2 rounded-xl hover:bg-neutral-100 transition-colors" title="Sign out">
              <LogOut className="w-5 h-5 text-neutral-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-neutral-800">Hey {userName} 👋</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Find your next plan</p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plans..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 rounded-2xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent shadow-sm"
          />
        </div>

        {/* Plans Grid */}
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
            <h2 className="text-xl font-bold text-neutral-700 mb-2">No plans yet</h2>
            <p className="text-neutral-500 mb-6">Be the first to create a plan!</p>
            <Link
              href="/app/create"
              className="inline-flex items-center gap-2 bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-3 px-6 rounded-2xl transition-colors"
            >
              <Plus className="w-5 h-5" /> Create a plan
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan, i) => (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <PlanCard plan={plan} />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <Link href="/app/create">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] rounded-full shadow-lg flex items-center justify-center text-white z-50"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </Link>
    </div>
  );
}
