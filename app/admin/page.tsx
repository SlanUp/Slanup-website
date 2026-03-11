"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Shield, Users, Calendar, TrendingUp, MapPin, Search,
  ChevronRight, ArrowUpRight, Clock, Instagram, ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { api } from "@/lib/api/client";
import S3Image from "@/components/S3Image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {sub && <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">{sub}</span>}
      </div>
      <p className="text-2xl font-bold text-neutral-800">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
    </motion.div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  const [tab, setTab] = useState<"overview" | "users">("overview");
  const [stats, setStats] = useState<AnyObj | null>(null);
  const [users, setUsers] = useState<AnyObj[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = (await api.getAdminStats()) as { data: AnyObj };
      setStats(res.data);
    } catch {
      // not admin
    }
  }, []);

  const fetchUsers = useCallback(async (page: number, search?: string) => {
    try {
      const res = (await api.getAdminUsers(page, search)) as { data: { users: AnyObj[]; total: number; totalPages: number } };
      setUsers(res.data.users);
      setUserTotal(res.data.total);
      setUserTotalPages(res.data.totalPages);
    } catch {
      // not admin
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/app");
      return;
    }
    if (isLoggedIn) {
      setLoading(true);
      Promise.all([fetchStats(), fetchUsers(1)]).finally(() => setLoading(false));
    }
  }, [isLoading, isLoggedIn, fetchStats, fetchUsers, router]);

  useEffect(() => {
    if (tab === "users") {
      const timer = setTimeout(() => {
        fetchUsers(userPage, userSearch || undefined);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [tab, userPage, userSearch, fetchUsers]);

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "users" as const, label: "Users" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-[var(--brand-green)]" />
            <div>
              <h1 className="text-lg font-bold text-neutral-800">Admin Dashboard</h1>
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider">slanup&apos;beta</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/plans"
              className="text-xs font-semibold text-[var(--brand-green)] bg-[var(--brand-green)]/10 px-3 py-1.5 rounded-full hover:bg-[var(--brand-green)]/20 transition-colors flex items-center gap-1"
            >
              Plan Approvals <ChevronRight className="w-3 h-3" />
            </Link>
            <Link
              href="/app/feed"
              className="text-xs text-neutral-500 hover:text-neutral-700 px-3 py-1.5 rounded-full hover:bg-neutral-100 transition-colors"
            >
              Feed →
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 flex gap-0 border-t border-neutral-100">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                tab === t.id
                  ? "text-[var(--brand-green)]"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              {t.label}
              {tab === t.id && (
                <motion.div
                  layoutId="adminTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-green)] rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-3 border-[var(--brand-green)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === "overview" && stats ? (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                icon={Users}
                label="Total Users"
                value={stats.users.total}
                sub={`+${stats.users.newThisWeek} this week`}
                color="bg-blue-50 text-blue-600"
              />
              <StatCard
                icon={Calendar}
                label="Total Plans"
                value={stats.plans.total}
                sub={`${stats.plans.active} active`}
                color="bg-green-50 text-green-600"
              />
              <StatCard
                icon={TrendingUp}
                label="Join Requests"
                value={stats.requests.total}
                sub={stats.requests.pending > 0 ? `${stats.requests.pending} pending` : undefined}
                color="bg-purple-50 text-purple-600"
              />
              <StatCard
                icon={Users}
                label="New This Month"
                value={stats.users.newThisMonth}
                color="bg-amber-50 text-amber-600"
              />
            </div>

            {/* Plans by Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
              <h3 className="text-sm font-bold text-neutral-800 mb-3">Plans by Status</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(stats.plans.byStatus as Record<string, number>).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      status === 'approved' ? 'bg-green-500' :
                      status === 'pending' ? 'bg-amber-500' :
                      status === 'rejected' ? 'bg-red-500' : 'bg-neutral-400'
                    }`} />
                    <span className="text-sm text-neutral-700 capitalize">{status}</span>
                    <span className="text-sm font-bold text-neutral-800">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plans by City */}
            {stats.plans.byCity?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
                <h3 className="text-sm font-bold text-neutral-800 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-neutral-400" /> Plans by City
                </h3>
                <div className="space-y-2">
                  {stats.plans.byCity.map((c: { _id: string; count: number }) => (
                    <div key={c._id || 'unknown'} className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">{c._id || 'No city'}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 rounded-full bg-[var(--brand-green)]/20 w-24 md:w-40 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[var(--brand-green)]"
                            style={{ width: `${Math.min(100, (c.count / (stats.plans.byCity[0]?.count || 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-neutral-800 w-6 text-right">{c.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Creators + Recent Plans side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top Creators */}
              {stats.topCreators?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
                  <h3 className="text-sm font-bold text-neutral-800 mb-3">Top Creators</h3>
                  <div className="space-y-3">
                    {stats.topCreators.map((c: AnyObj, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-neutral-400 w-4">{i + 1}</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--brand-green)] to-green-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
                          {c.user?.image ? (
                            <S3Image fileKey={c.user.image} alt="" width={32} height={32} className="object-cover w-full h-full" />
                          ) : (
                            c.user?.name?.charAt(0)?.toUpperCase() || '?'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-700 truncate">{c.user?.name}</p>
                          <p className="text-[11px] text-neutral-400 truncate">{c.user?.email}</p>
                        </div>
                        <span className="text-sm font-bold text-[var(--brand-green)]">{c.planCount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Plans */}
              {stats.recentPlans?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
                  <h3 className="text-sm font-bold text-neutral-800 mb-3">Recent Plans</h3>
                  <div className="space-y-2.5">
                    {stats.recentPlans.slice(0, 8).map((p: AnyObj) => (
                      <Link key={p._id} href={`/app/plan/${p.id || p._id}`} className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                          {p.pic_id ? (
                            <S3Image fileKey={p.pic_id} alt="" width={36} height={36} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-neutral-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-700 truncate group-hover:text-[var(--brand-green)] transition-colors">{p.name}</p>
                          <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDate(p.createdAt)}
                            {p.city && <><span className="mx-1">·</span><MapPin className="w-3 h-3" /> {p.city}</>}
                          </p>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-[var(--brand-green)] transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : tab === "users" ? (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                placeholder="Search by name, email or Instagram..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 rounded-2xl text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent shadow-sm"
              />
            </div>

            <p className="text-xs text-neutral-400 font-medium">{userTotal} users total · Page {userPage} of {userTotalPages}</p>

            {/* User list */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 divide-y divide-neutral-100 overflow-hidden">
              {users.map((u) => (
                <div key={u._id} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-green)] to-green-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden flex-shrink-0">
                    {u.image ? (
                      <S3Image fileKey={u.image} alt="" width={40} height={40} className="object-cover w-full h-full" />
                    ) : (
                      u.name?.charAt(0)?.toUpperCase() || '?'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-800 truncate">{u.name}</p>
                      {u.plansCreated > 0 && (
                        <span className="text-[10px] font-medium bg-[var(--brand-green)]/10 text-[var(--brand-green)] px-1.5 py-0.5 rounded-full">{u.plansCreated} plan{u.plansCreated !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 truncate">{u.email}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-neutral-400">
                      {u.city && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {u.city}</span>}
                      {u.instagramHandle && (
                        <a href={`https://instagram.com/${u.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 hover:text-[var(--brand-green)]">
                          <Instagram className="w-3 h-3" /> @{u.instagramHandle}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> Joined {formatDate(u.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="py-12 text-center text-neutral-400 text-sm">No users found</div>
              )}
            </div>

            {/* Pagination */}
            {userTotalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setUserPage(p => Math.max(1, p - 1))}
                  disabled={userPage <= 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-neutral-200 text-neutral-600 disabled:opacity-30 hover:border-neutral-300 transition-colors"
                >
                  ← Prev
                </button>
                <span className="text-xs text-neutral-400">{userPage} / {userTotalPages}</span>
                <button
                  onClick={() => setUserPage(p => Math.min(userTotalPages, p + 1))}
                  disabled={userPage >= userTotalPages}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-neutral-200 text-neutral-600 disabled:opacity-30 hover:border-neutral-300 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
