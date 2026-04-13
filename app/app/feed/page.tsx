"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, MapPin, Calendar, LogOut, User as UserIcon, Users, SlidersHorizontal, X, Tag, MessageCircle, Bell, ArrowUpFromLine, Compass } from "lucide-react";import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { api, getStoredToken } from "@/lib/api/client";
import { io, Socket } from "socket.io-client";
import S3Image from "@/components/S3Image";
import SharePlanCard from "@/components/SharePlanCard";
import { ALL_CITIES, REGION_GROUP_NAMES, PLAN_TAGS } from "@/lib/config/cities";
import { hapticLight, hapticSelection } from "@/lib/native/haptics";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://d2oulqfcyna7a4.cloudfront.net";

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
  host_id?: { _id: string; name: string; image?: string; instagramHandle?: string };
  communityId?: { _id: string; name: string } | string;
  createdAt: string;
}


function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function PlanCard({ plan }: { plan: Plan }) {
  const slotsLeft = plan.max_people - plan.participants.length;
  const startDate = new Date(plan.start);
  const [showShare, setShowShare] = useState(false);

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShare(true);
  };

  return (
    <div className="relative">
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
                {(plan.host_id?.image || plan.creator_id?.image) ? (
                  <S3Image fileKey={(plan.host_id?.image || plan.creator_id?.image)} alt="" width={36} height={36} className="object-cover w-full h-full" />
                ) : (
                  (plan.host_id?.name || plan.creator_id?.name)?.charAt(0)?.toUpperCase() || '?'
                )}
              </div>
              <div>
                <p className="text-sm">
                  <span className="font-bold">{plan.host_id?.name || plan.creator_id?.name}</span>
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
              <div className="flex flex-col items-center justify-center px-3 py-2 bg-neutral-50 rounded-xl -mt-8 md:-mt-10 relative z-10 shadow-md min-w-[52px]">
                <span className="text-lg font-bold text-neutral-800">{startDate.getDate()}</span>
                <span className="text-xs font-bold text-red-500">
                  {startDate.toLocaleString('default', { month: 'short' })}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-neutral-800 truncate">{plan.name}</h3>
                {plan.communityId && typeof plan.communityId === 'object' && (plan.communityId as { name: string }).name && (
                  <p className="text-xs text-[var(--brand-green)] font-medium flex items-center gap-1 mt-0.5">
                    <Users className="w-3 h-3" />
                    {(plan.communityId as { name: string }).name}
                  </p>
                )}
                {plan.venue_string && (
                  <p className="text-sm text-neutral-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{plan.venue_string}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Participants + Slots + Share */}
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
                <div className="w-9 h-5" /> {/* spacer for share button */}
              </div>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Share button — positioned outside Link to prevent navigation */}
      <button
        onClick={handleShareClick}
        className="absolute bottom-[14px] right-4 p-2 rounded-full hover:bg-neutral-100 transition-colors z-10"
        title="Share this plan"
      >
        <ArrowUpFromLine className="w-5 h-5 text-neutral-400 hover:text-[var(--brand-green)] transition-colors" />
      </button>

      {showShare && (
        <SharePlanCard
          plan={plan}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}

export default function FeedPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading, isNewUser, logout } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [recentPlans, setRecentPlans] = useState<Plan[]>([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [unreadChats, setUnreadChats] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/app");
    }
    if (!isLoading && isLoggedIn && isNewUser) {
      router.replace("/app/onboarding");
    }
  }, [isLoading, isLoggedIn, isNewUser, router]);

  // Fetch unread chat count + notification count, then listen for realtime updates
  useEffect(() => {
    if (!isLoggedIn || isNewUser) return;

    // Initial fetch
    api.getUnreadCount().then((res: unknown) => {
      const data = res as { data?: { unreadCount?: number } };
      setUnreadChats(data.data?.unreadCount || 0);
    }).catch(() => {});

    api.getNotifications().then((res: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = res as { data?: { incoming?: { status: string }[]; plansToRate?: any[] } };
      const pending = (data.data?.incoming || []).filter((r: { status: string }) => r.status === 'pending').length;
      // Only count plansToRate that arrived after user last visited notifications
      const lastSeen = parseInt(localStorage.getItem('lastNotifSeenAt') || '0', 10);
      const newRateCount = (data.data?.plansToRate || []).filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => new Date(p.end).getTime() > lastSeen
      ).length;
      setUnreadNotifs(pending + newRateCount);
    }).catch(() => {});

    // Socket connection for realtime badge updates
    const token = getStoredToken();
    if (!token) return;

    const socket = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("[Feed] Socket connected, listening for badge updates");
    });

    // conversationUpdated fires on every new message (emitted to personal room)
    // Refetch real unread count each time
    socket.on("conversationUpdated", () => {
      api.getUnreadCount().then((res: unknown) => {
        const data = res as { data?: { unreadCount?: number } };
        setUnreadChats(data.data?.unreadCount || 0);
      }).catch(() => {});
    });

    // Listen for new join request notifications (from socket events)
    socket.on("chatRequestReceivedNotification", () => {
      setUnreadNotifs(prev => prev + 1);
    });
    socket.on("newJoinRequest", () => {
      setUnreadNotifs(prev => prev + 1);
    });
    socket.on("newPlanNearby", () => {
      setUnreadNotifs(prev => prev + 1);
    });
    socket.on("planCompletedRate", () => {
      setUnreadNotifs(prev => prev + 1);
    });

    socket.on("connect_error", (err) => {
      console.error("[Feed] Socket connect error:", err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [isLoggedIn, isNewUser]);

  // No default city filter — always start with "All Cities"

  const fetchPlans = useCallback(async (q?: string, city?: string, tags?: string[]) => {
    try {
      setLoading(true);
      const res = await api.getPlans(1, q, city, tags) as { data: { plans: Plan[] } };
      setPlans(res.data.plans);
      // If few active plans and no search/tag filters, backfill with recent ended plans
      if (res.data.plans.length < 5 && !q && (!tags || tags.length === 0)) {
        const recent = await api.getRecentPlans(city) as { data: { plans: Plan[] } };
        setRecentPlans(recent.data.plans);
      } else {
        setRecentPlans([]);
      }
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

  const feedCityOptions = [...ALL_CITIES, ...REGION_GROUP_NAMES].sort();
  const filteredCities = feedCityOptions.filter(c =>
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
            <span className="text-[9px] font-bold text-[var(--brand-green)] ml-0.5 mb-1.5 tracking-wider uppercase">beta</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link href="/app/chats" onClick={() => hapticLight()} className="p-2 rounded-xl hover:bg-neutral-100 transition-colors relative" title="Chats">
              <MessageCircle className="w-5 h-5 text-neutral-600" />
              {unreadChats > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadChats > 99 ? '99+' : unreadChats}
                </span>
              )}
            </Link>
            <Link href="/app/notifications" onClick={() => hapticLight()} className="p-2 rounded-xl hover:bg-neutral-100 transition-colors relative" title="Notifications">
              <Bell className="w-5 h-5 text-neutral-600" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadNotifs > 99 ? '99+' : unreadNotifs}
                </span>
              )}
            </Link>
            <Link href="/app/communities" onClick={() => hapticLight()} className="p-2 rounded-xl hover:bg-neutral-100 transition-colors" title="Communities">
              <Compass className="w-5 h-5 text-neutral-600" />
            </Link>
            <Link href={`/app/profile/${(user as Record<string, unknown>)?._id}`} onClick={() => hapticLight()} className="p-2 rounded-xl hover:bg-neutral-100 transition-colors" title="Profile">
              <UserIcon className="w-5 h-5 text-neutral-600" />
            </Link>
            <button onClick={() => { logout(); router.replace("/app"); }} className="p-2 rounded-xl hover:bg-neutral-100 transition-colors" title="Sign out">
              <LogOut className="w-5 h-5 text-neutral-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-4 safe-bottom" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
        {/* Section title */}
        <p className="text-neutral-500 text-sm mb-4 font-medium">Active plans</p>

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
            onClick={() => { hapticLight(); setShowFilters(!showFilters); }}
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

        {/* Filter Panel — Bottom sheet on mobile, inline on desktop */}
        <AnimatePresence>
          {showFilters && (
            <>
              {/* Mobile backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 z-50 md:hidden"
                onClick={() => setShowFilters(false)}
              />

              {/* Panel */}
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-x-0 bottom-0 z-50 md:relative md:inset-auto md:z-auto md:mb-4"
              >
                <div className="bg-white rounded-t-3xl md:rounded-2xl border border-neutral-200 shadow-xl md:shadow-sm max-h-[75vh] md:max-h-none flex flex-col">
                  {/* Sheet header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
                      <span className="text-sm font-bold text-neutral-800">Filters</span>
                      {activeFilterCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[var(--brand-green)] text-white text-[10px] font-bold flex items-center justify-center">
                          {activeFilterCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {activeFilterCount > 0 && (
                        <button onClick={clearFilters} className="text-xs text-neutral-400 hover:text-neutral-600">
                          Clear all
                        </button>
                      )}
                      <button
                        onClick={() => setShowFilters(false)}
                        className="px-4 py-1.5 bg-[var(--brand-green)] text-white text-xs font-semibold rounded-full hover:bg-[var(--brand-green-dark)] transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>

                  {/* Scrollable content */}
                  <div className="overflow-y-auto overscroll-contain px-5 py-4 space-y-5">
                    {/* City Filter */}
                    <div>
                      <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> City
                      </label>
                      <div className="relative mb-2.5">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                        <input
                          type="text"
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                          placeholder="Search cities..."
                          className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setCityFilter("")}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                            !cityFilter
                              ? 'bg-[var(--brand-green)] text-white border-[var(--brand-green)]'
                              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          All Cities
                        </button>
                        {filteredCities.map(c => (
                          <button
                            key={c}
                            onClick={() => { hapticSelection(); setCityFilter(cityFilter === c ? "" : c); }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                              cityFilter === c
                                ? 'bg-[var(--brand-green)] text-white border-[var(--brand-green)]'
                                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Divider */}
                    <hr className="border-neutral-100" />

                    {/* Tag Filter */}
                    <div>
                      <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" /> Tags
                        {tagFilters.length > 0 && (
                          <span className="text-[10px] text-[var(--brand-green)] font-bold">({tagFilters.length} selected)</span>
                        )}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {/* Selected tags first */}
                        {PLAN_TAGS.filter(t => tagFilters.includes(t)).map(tag => (
                          <button
                            key={tag}
                            onClick={() => { hapticSelection(); toggleTag(tag); }}
                            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors border bg-[var(--brand-green)] text-white border-[var(--brand-green)]"
                          >
                            ✓ {tag}
                          </button>
                        ))}
                        {/* Then unselected */}
                        {PLAN_TAGS.filter(t => !tagFilters.includes(t)).map(tag => (
                          <button
                            key={tag}
                            onClick={() => { hapticSelection(); toggleTag(tag); }}
                            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors border bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mobile safe-area spacer */}
                  <div className="h-[env(safe-area-inset-bottom)] md:hidden shrink-0" />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Plans Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-3 border-[var(--brand-green)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : plans.length === 0 && recentPlans.length === 0 ? (
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
          <>
            {/* Active Plans */}
            {plans.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map((plan, i) => (
                  <motion.div key={plan.id || plan._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <PlanCard plan={plan} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* No active but we have recent — show CTA */}
            {plans.length === 0 && recentPlans.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                <h2 className="text-lg font-bold text-neutral-700 mb-1">No upcoming plans{cityFilter ? ` in ${cityFilter}` : ''} right now</h2>
                <p className="text-neutral-500 mb-4 text-sm">Check out what happened recently, or create one!</p>
                <Link
                  href="/app/create"
                  className="inline-flex items-center gap-2 bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-2.5 px-5 rounded-2xl transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" /> Create a plan
                </Link>
              </motion.div>
            )}

            {/* Recently Happened */}
            {recentPlans.length > 0 && (
              <div className={plans.length > 0 ? 'mt-8' : 'mt-4'}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-neutral-200" />
                  <span className="text-sm font-semibold text-neutral-400 uppercase tracking-wide">Recently Happened</span>
                  <div className="h-px flex-1 bg-neutral-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-90">
                  {recentPlans.map((plan, i) => (
                    <motion.div key={plan.id || plan._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <div className="relative">
                        <div className="absolute top-3 right-3 z-10 bg-neutral-800/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Ended
                        </div>
                        <PlanCard plan={plan} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* FAB */}
      <Link href="/app/create" onClick={() => hapticLight()}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed right-5 md:right-6 w-14 h-14 bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] rounded-full shadow-lg flex items-center justify-center text-white z-50"
          style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </Link>
    </div>
  );
}
