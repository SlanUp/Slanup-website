"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, MapPin, Calendar, Heart, LogOut, User as UserIcon, LayoutList, SlidersHorizontal, X, Tag } from "lucide-react";import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { api } from "@/lib/api/client";
import S3Image from "@/components/S3Image";
import { CITIES, PLAN_TAGS } from "@/lib/config/cities";

interface Plan {
  id: string;
  _id: string;
  name: string;
  desc?: string;
  pic_id?: string;
  start: string;
  end: string;
  venue_string?: string;
  city?: string;
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
          {plan.city && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-neutral-700 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {plan.city}
            </span>
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
  const [cityFilter, setCityFilter] = useState("");
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/app");
    }
    if (!isLoading && isLoggedIn && isNewUser) {
      router.replace("/app/onboarding");
    }
  }, [isLoading, isLoggedIn, isNewUser, router]);

  // Set default city from user profile once
  useEffect(() => {
    if (isLoggedIn && !isNewUser && !cityFilter) {
      const userCity = (user as Record<string, unknown>)?.city as string || '';
      if (userCity) setCityFilter(userCity);
    }
  }, [isLoggedIn, isNewUser, user, cityFilter]);

  const fetchPlans = useCallback(async (q?: string, city?: string, tags?: string[]) => {
    try {
      setLoading(true);
      const res = await api.getPlans(1, q, city, tags) as { data: { plans: Plan[] } };
      setPlans(res.data.plans);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch plans whenever filters change
  useEffect(() => {
    if (!isLoggedIn || isNewUser) return;
    const timer = setTimeout(() => {
      fetchPlans(
        search || undefined,
        cityFilter || undefined,
        tagFilters.length > 0 ? tagFilters : undefined
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [search, cityFilter, tagFilters, fetchPlans, isLoggedIn, isNewUser]);

  const filteredCities = CITIES.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const activeFilterCount = (cityFilter ? 1 : 0) + tagFilters.length;

  const toggleTag = (tag: string) => {
    setTagFilters(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setCityFilter("");
    setTagFilters([]);
    setCitySearch("");
  };

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
          <p className="text-neutral-500 text-sm mt-0.5">Active plans</p>
        </motion.div>

        {/* Search + Filter Toggle */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plans..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 rounded-2xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent shadow-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative px-4 py-3 rounded-2xl border shadow-sm transition-colors flex items-center gap-1.5 ${
              showFilters || activeFilterCount > 0
                ? 'bg-[var(--brand-green)] text-white border-[var(--brand-green)]'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-[var(--brand-green)]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className={`text-xs font-bold ${showFilters || activeFilterCount > 0 ? 'text-white' : ''}`}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filter Pills */}
        {activeFilterCount > 0 && !showFilters && (
          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            {cityFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--brand-green)]/10 text-[var(--brand-green)] text-xs font-medium rounded-full">
                <MapPin className="w-3 h-3" /> {cityFilter}
                <button onClick={() => setCityFilter("")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {tagFilters.map(t => (
              <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--brand-green)]/10 text-[var(--brand-green)] text-xs font-medium rounded-full">
                <Tag className="w-3 h-3" /> {t}
                <button onClick={() => toggleTag(t)}><X className="w-3 h-3" /></button>
              </span>
            ))}
            <button onClick={clearFilters} className="text-xs text-neutral-400 hover:text-neutral-600 ml-1">
              Clear all
            </button>
          </div>
        )}

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 space-y-4">
                {/* City Filter */}
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> City
                  </label>
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="Search cities..."
                    className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent mb-2"
                  />
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-auto">
                    <button
                      onClick={() => setCityFilter("")}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        !cityFilter
                          ? 'bg-[var(--brand-green)] text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      All Cities
                    </button>
                    {filteredCities.map(c => (
                      <button
                        key={c}
                        onClick={() => setCityFilter(cityFilter === c ? "" : c)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          cityFilter === c
                            ? 'bg-[var(--brand-green)] text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tag Filter */}
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-auto">
                    {PLAN_TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          tagFilters.includes(tag)
                            ? 'bg-[var(--brand-green)] text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear + Close */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                  <button onClick={clearFilters} className="text-xs text-neutral-400 hover:text-neutral-600">
                    Clear all filters
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-xs font-semibold text-[var(--brand-green)] hover:underline"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
            <h2 className="text-xl font-bold text-neutral-700 mb-2">No active plans{cityFilter ? ` in ${cityFilter}` : ''}</h2>
            <p className="text-neutral-500 mb-6">
              {activeFilterCount > 0 ? 'Try broadening your filters or ' : ''}Be the first to create a plan!
            </p>
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
              <motion.div key={plan.id || plan._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
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
