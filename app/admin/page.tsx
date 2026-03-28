"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Shield, Users, Calendar, TrendingUp, MapPin, Search,
  ChevronRight, ArrowUpRight, Clock, Instagram, ExternalLink, Phone, AlertTriangle, Trash2, Mail, Send
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
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  const [tab, setTab] = useState<"overview" | "users" | "plans" | "digest" | "waitlist" | "flagged">("overview");
  const [stats, setStats] = useState<AnyObj | null>(null);
  const [users, setUsers] = useState<AnyObj[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [flaggedReports, setFlaggedReports] = useState<AnyObj[]>([]);
  const [allPlans, setAllPlans] = useState<AnyObj[]>([]);
  const [planSearch, setPlanSearch] = useState("");
  const [deletingPlan, setDeletingPlan] = useState<string | null>(null);
  const [digestPreview, setDigestPreview] = useState<AnyObj | null>(null);
  const [digestLoading, setDigestLoading] = useState(false);
  const [digestSending, setDigestSending] = useState(false);
  const [digestResult, setDigestResult] = useState<string | null>(null);
  const [includeOptedOut, setIncludeOptedOut] = useState(false);
  // Incomplete onboarding
  const [incompleteUsers, setIncompleteUsers] = useState<AnyObj[]>([]);
  const [incompleteLoading, setIncompleteLoading] = useState(false);
  const [reminderSending, setReminderSending] = useState(false);
  const [reminderResult, setReminderResult] = useState<string | null>(null);
  // Waitlist
  const [waitlistEntries, setWaitlistEntries] = useState<AnyObj[]>([]);
  const [waitlistStats, setWaitlistStats] = useState<AnyObj | null>(null);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistFilter, setWaitlistFilter] = useState<"all" | "waiting" | "invited" | "signed_up">("all");
  const [csvText, setCsvText] = useState("");
  const [csvParsed, setCsvParsed] = useState<{ name: string; email: string }[]>([]);
  const [importing, setImporting] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [waitlistMsg, setWaitlistMsg] = useState<string | null>(null);
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

  const fetchFlaggedUsers = useCallback(async () => {
    try {
      const res = (await api.getAdminFlaggedUsers()) as { data: { reports: AnyObj[] } };
      setFlaggedReports(res.data.reports);
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
      // Fetch incomplete onboarding users
      if (!incompleteUsers.length && !incompleteLoading) {
        setIncompleteLoading(true);
        api.getIncompleteOnboarding().then((res: unknown) => {
          const data = res as AnyObj;
          setIncompleteUsers(data.data?.users || []);
        }).catch(() => {}).finally(() => setIncompleteLoading(false));
      }
      return () => clearTimeout(timer);
    }
    if (tab === "flagged") {
      fetchFlaggedUsers();
    }
  }, [tab, userPage, userSearch, fetchUsers, fetchFlaggedUsers]);

  const fetchAllPlans = useCallback(async () => {
    try {
      const res = (await api.getAdminPlans('all')) as { data: { plans: AnyObj[] } };
      setAllPlans(res.data.plans || []);
    } catch {
      // not admin
    }
  }, []);

  useEffect(() => {
    if (tab === "plans") fetchAllPlans();
    if (tab === "digest") fetchDigestPreview();
    if (tab === "waitlist") fetchWaitlist();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, fetchAllPlans, includeOptedOut]);

  const fetchDigestPreview = async () => {
    setDigestLoading(true);
    setDigestResult(null);
    try {
      const res = (await api.getDigestPreview(includeOptedOut)) as { data: AnyObj };
      setDigestPreview(res.data);
    } catch {
      setDigestPreview(null);
    } finally {
      setDigestLoading(false);
    }
  };

  const handleSendDigest = async () => {
    const msg = includeOptedOut
      ? 'Send digest to ALL matched users INCLUDING those who opted out? This cannot be undone.'
      : 'Send digest emails to all matched subscribers? This cannot be undone.';
    if (!confirm(msg)) return;
    setDigestSending(true);
    setDigestResult(null);
    try {
      const res = (await api.sendDigest(includeOptedOut)) as { message: string; sent: number; plansIncluded: number };
      setDigestResult(`✅ ${res.message}`);
      setDigestPreview(null);
      fetchDigestPreview();
    } catch {
      setDigestResult('❌ Failed to send digest');
    } finally {
      setDigestSending(false);
    }
  };

  const handleDeletePlan = async (planId: string, planName: string) => {
    if (!confirm(`Delete "${planName}"? This will remove the plan, its chat, and all related data permanently.`)) return;
    setDeletingPlan(planId);
    try {
      await api.adminDeletePlan(planId);
      setAllPlans(prev => prev.filter(p => (p._id || p.id) !== planId));
    } catch {
      alert("Failed to delete plan");
    } finally {
      setDeletingPlan(null);
    }
  };

  // Waitlist handlers
  const fetchWaitlist = async () => {
    setWaitlistLoading(true);
    try {
      const res = (await api.getWaitlist()) as { data: { entries: AnyObj[]; stats: AnyObj } };
      setWaitlistEntries(res.data.entries || []);
      setWaitlistStats(res.data.stats || null);
    } catch { /* not admin */ } finally { setWaitlistLoading(false); }
  };

  const parseCsv = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const parsed: { name: string; email: string }[] = [];
    for (const line of lines) {
      // Support: name,email  OR  email,name  OR  just email
      const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 2) {
        const emailPart = parts.find(p => p.includes('@'));
        const namePart = parts.find(p => !p.includes('@'));
        if (emailPart) parsed.push({ name: namePart || '', email: emailPart });
      } else if (parts[0]?.includes('@')) {
        parsed.push({ name: '', email: parts[0] });
      }
    }
    return parsed;
  };

  const handleCsvChange = (text: string) => {
    setCsvText(text);
    setCsvParsed(parseCsv(text));
  };

  const handleImport = async () => {
    if (csvParsed.length === 0) return;
    setImporting(true);
    setWaitlistMsg(null);
    try {
      const res = (await api.importWaitlist(csvParsed)) as { message: string };
      setWaitlistMsg(`✅ ${res.message}`);
      setCsvText('');
      setCsvParsed([]);
      fetchWaitlist();
    } catch {
      setWaitlistMsg('❌ Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleInviteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`Send invite emails to ${ids.length} people?`)) return;
    setInviting(true);
    setWaitlistMsg(null);
    try {
      const res = (await api.sendWaitlistInvites(ids)) as { message: string };
      setWaitlistMsg(`✅ ${res.message}`);
      setSelectedIds(new Set());
      fetchWaitlist();
    } catch {
      setWaitlistMsg('❌ Failed to send invites');
    } finally {
      setInviting(false);
    }
  };

  const handleInviteAll = async () => {
    if (!confirm('Send invite emails to ALL waiting entries?')) return;
    setInviting(true);
    setWaitlistMsg(null);
    try {
      const res = (await api.sendWaitlistInvites('all')) as { message: string };
      setWaitlistMsg(`✅ ${res.message}`);
      fetchWaitlist();
    } catch {
      setWaitlistMsg('❌ Failed to send invites');
    } finally {
      setInviting(false);
    }
  };

  const toggleSelectEntry = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDismissFlag= async (reportId: string) => {
    if (!confirm('Dismiss this report?')) return;
    try {
      await api.dismissFlag(reportId);
      setFlaggedReports(prev => prev.filter(r => r._id !== reportId));
    } catch {
      alert('Failed to dismiss');
    }
  };

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "plans" as const, label: "Plans" },
    { id: "users" as const, label: "Users" },
    { id: "digest" as const, label: "Digest" },
    { id: "waitlist" as const, label: "Waitlist" },
    { id: "flagged" as const, label: "Flagged" },
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
        ) : tab === "plans" ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={planSearch}
                onChange={(e) => setPlanSearch(e.target.value)}
                placeholder="Search plans by name, creator or city..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 rounded-2xl text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent shadow-sm"
              />
            </div>

            <p className="text-xs text-neutral-400">{allPlans.length} total plans</p>

            {allPlans.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 py-16 text-center">
                <Calendar className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-sm text-neutral-400">No plans yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allPlans
                  .filter(p => {
                    if (!planSearch) return true;
                    const q = planSearch.toLowerCase();
                    return (
                      p.name?.toLowerCase().includes(q) ||
                      p.creator_id?.name?.toLowerCase().includes(q) ||
                      p.city?.toLowerCase().includes(q)
                    );
                  })
                  .map((p) => {
                    const isEnded = new Date(p.end) < new Date();
                    const planId = p._id || p.id;
                    return (
                      <motion.div
                        key={planId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-neutral-100 overflow-hidden flex-shrink-0">
                            {p.pic_id ? (
                              <S3Image fileKey={p.pic_id} alt="" width={48} height={48} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-neutral-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Link href={`/app/plan/${p.id || p._id}`} className="text-sm font-semibold text-neutral-800 truncate hover:text-[var(--brand-green)] transition-colors">
                                {p.name}
                              </Link>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                p.status === 'approved' && !isEnded ? 'bg-green-100 text-green-700'
                                  : p.status === 'approved' && isEnded ? 'bg-neutral-100 text-neutral-500'
                                  : p.status === 'rejected' ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {p.status === 'approved' && isEnded ? 'ended' : p.status}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-500 mt-0.5">by {p.creator_id?.name || 'Unknown'}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-neutral-400">
                              <span className="flex items-center gap-0.5">
                                <Calendar className="w-3 h-3" /> {formatDate(p.start)}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Users className="w-3 h-3" /> {(p.participants?.length || 0)}/{p.max_people}
                              </span>
                              {p.city && (
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="w-3 h-3" /> {p.city}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeletePlan(planId, p.name)}
                            disabled={deletingPlan === planId}
                            className="flex-shrink-0 p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                            title="Delete plan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </div>
        ) : tab === "users" ? (
          <div className="space-y-4">
            {/* Incomplete Onboarding */}
            {incompleteUsers.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-semibold text-neutral-800">
                      Incomplete Onboarding
                      <span className="ml-1.5 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">{incompleteUsers.length}</span>
                    </h3>
                  </div>
                  <button
                    onClick={async () => {
                      const unsent = incompleteUsers.filter(u => !u.reminderSent);
                      if (unsent.length === 0) { alert('All reminders already sent!'); return; }
                      if (!confirm(`Send reminder to ${unsent.length} user${unsent.length !== 1 ? 's' : ''} who haven't completed onboarding?`)) return;
                      setReminderSending(true);
                      setReminderResult(null);
                      try {
                        const res = await api.sendOnboardingReminder(unsent.map(u => u._id)) as AnyObj;
                        setReminderResult(`✅ ${res.message}`);
                        setIncompleteUsers(prev => prev.map(u => ({ ...u, reminderSent: true, reminderSentAt: new Date().toISOString() })));
                      } catch {
                        setReminderResult('❌ Failed to send reminders');
                      } finally {
                        setReminderSending(false);
                      }
                    }}
                    disabled={reminderSending}
                    className="text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {reminderSending ? 'Sending...' : 'Send Reminder to All'}
                  </button>
                </div>
                {reminderResult && (
                  <p className="text-xs text-neutral-600 mb-2 bg-neutral-50 px-3 py-2 rounded-lg">{reminderResult}</p>
                )}
                <div className="divide-y divide-neutral-100 max-h-48 overflow-auto">
                  {incompleteUsers.map((u) => (
                    <div key={u._id} className="flex items-center justify-between py-2">
                      <div>
                        <span className="text-sm text-neutral-700">{u.email}</span>
                        <span className="text-xs text-neutral-400 ml-2">signed up {new Date(u.signedUpAt).toLocaleDateString()}</span>
                      </div>
                      {u.reminderSent && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">reminded</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                <div key={u._id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-green)] to-green-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden flex-shrink-0">
                      {u.image ? (
                        <S3Image fileKey={u.image} alt="" width={40} height={40} className="object-cover w-full h-full" />
                      ) : (
                        u.name?.charAt(0)?.toUpperCase() || '?'
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-neutral-800 truncate">{u.name}</p>
                        {u.plansCreated > 0 && (
                          <span className="text-[10px] font-medium bg-[var(--brand-green)]/10 text-[var(--brand-green)] px-1.5 py-0.5 rounded-full flex-shrink-0">{u.plansCreated} plan{u.plansCreated !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 truncate">{u.email || '—'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:ml-auto text-[11px] text-neutral-400 pl-[52px] sm:pl-0">
                    {u.mobileNumber && (
                      <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" /> {u.mobileNumber}</span>
                    )}
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
        ) : tab === "digest" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#636B50]" />
                <h2 className="text-lg font-semibold text-neutral-800">Weekly Digest</h2>
              </div>
              <button
                onClick={fetchDigestPreview}
                disabled={digestLoading}
                className="text-xs text-[#636B50] hover:underline"
              >
                {digestLoading ? 'Loading...' : 'Refresh Preview'}
              </button>
            </div>

            <label className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeOptedOut}
                onChange={(e) => { setIncludeOptedOut(e.target.checked); }}
                className="accent-[#636B50]"
              />
              <span className="text-sm text-neutral-700">Include users who opted out of digest</span>
            </label>

            {digestResult && (
              <div className="p-3 rounded-lg bg-white border border-neutral-200 text-sm text-neutral-700">
                {digestResult}
              </div>
            )}

            {digestLoading ? (
              <div className="text-center py-8 text-neutral-400 text-sm">Loading preview...</div>
            ) : digestPreview ? (
              <div className="space-y-4">
                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl p-4 border border-neutral-100">
                    <div className="text-2xl font-bold text-[#636B50]">{digestPreview.totalPlans}</div>
                    <div className="text-xs text-neutral-500 mt-1">New Plans</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-neutral-100">
                    <div className="text-2xl font-bold text-[#636B50]">{digestPreview.totalSubscribers}</div>
                    <div className="text-xs text-neutral-500 mt-1">Subscribers</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-neutral-100">
                    <div className="text-2xl font-bold text-[#636B50]">{Object.keys(digestPreview.plansByCity || {}).length}</div>
                    <div className="text-xs text-neutral-500 mt-1">Cities</div>
                  </div>
                </div>

                {/* Plans by city */}
                {digestPreview.plansByCity && Object.keys(digestPreview.plansByCity).length > 0 && (
                  <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                      <h3 className="text-sm font-semibold text-neutral-700">Plans by City</h3>
                    </div>
                    <div className="divide-y divide-neutral-100">
                      {Object.entries(digestPreview.plansByCity).map(([city, plans]) => (
                        <div key={city} className="px-4 py-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-neutral-800 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#636B50]" /> {city}
                            </span>
                            <span className="text-xs text-neutral-400">{(plans as AnyObj[]).length} plan{(plans as AnyObj[]).length !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="space-y-1.5">
                            {(plans as AnyObj[]).map((p: AnyObj) => (
                              <div key={p._id || p.id} className="flex items-center justify-between text-xs text-neutral-600">
                                <span className="truncate max-w-[60%]">{p.name}</span>
                                <span className="text-neutral-400">{p.slotsLeft} slot{p.slotsLeft !== 1 ? 's' : ''} left · {p.hostName}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subscribers */}
                {digestPreview.subscribers && digestPreview.subscribers.length > 0 && (
                  <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                      <h3 className="text-sm font-semibold text-neutral-700">Subscribers who will receive</h3>
                    </div>
                    <div className="divide-y divide-neutral-100">
                      {digestPreview.subscribers.map((s: AnyObj, i: number) => (
                        <div key={i} className="px-4 py-2.5 flex items-center justify-between">
                          <div>
                            <span className="text-sm text-neutral-800">{s.name}</span>
                            <span className="text-xs text-neutral-400 ml-2">{s.email}</span>
                            {s.optedOut && <span className="text-[10px] ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">opted out</span>}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {s.planCount} plan{s.planCount !== 1 ? 's' : ''} · {s.cities?.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Send button */}
                {digestPreview.totalPlans > 0 && digestPreview.totalSubscribers > 0 && (
                  <button
                    onClick={handleSendDigest}
                    disabled={digestSending}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#636B50] text-white font-medium text-sm hover:bg-[#555d44] transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {digestSending ? 'Sending...' : `Send Digest to ${digestPreview.totalSubscribers} subscriber${digestPreview.totalSubscribers !== 1 ? 's' : ''}`}
                  </button>
                )}

                {digestPreview.totalPlans === 0 && (
                  <div className="text-center py-6 text-neutral-400 text-sm">
                    No new plans to include in digest. All plans have already been sent.
                  </div>
                )}
                {digestPreview.totalPlans > 0 && digestPreview.totalSubscribers === 0 && (
                  <div className="text-center py-6 text-neutral-400 text-sm">
                    {digestPreview.totalPlans} plans available but no subscribers match these cities.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-400 text-sm">No digest data available</div>
            )}
          </div>
        ) : tab === "waitlist" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#636B50]" />
                <h2 className="text-lg font-semibold text-neutral-800">Waitlist</h2>
              </div>
              <button onClick={fetchWaitlist} disabled={waitlistLoading} className="text-xs text-[#636B50] hover:underline">
                {waitlistLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {waitlistMsg && (
              <div className="p-3 rounded-lg bg-white border border-neutral-200 text-sm text-neutral-700">{waitlistMsg}</div>
            )}

            {/* Stats */}
            {waitlistStats && (
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-white rounded-xl p-4 border border-neutral-100">
                  <div className="text-2xl font-bold text-neutral-800">{waitlistStats.total}</div>
                  <div className="text-xs text-neutral-500 mt-1">Total</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-neutral-100">
                  <div className="text-2xl font-bold text-amber-600">{waitlistStats.waiting}</div>
                  <div className="text-xs text-neutral-500 mt-1">Waiting</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-neutral-100">
                  <div className="text-2xl font-bold text-blue-600">{waitlistStats.invited}</div>
                  <div className="text-xs text-neutral-500 mt-1">Invited</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-neutral-100">
                  <div className="text-2xl font-bold text-emerald-600">{waitlistStats.signedUp}</div>
                  <div className="text-xs text-neutral-500 mt-1">Converted {waitlistStats.conversionRate > 0 && <span className="text-[10px]">({waitlistStats.conversionRate}%)</span>}</div>
                </div>
              </div>
            )}

            {/* CSV Import */}
            <div className="bg-white rounded-xl border border-neutral-100 p-4">
              <h3 className="text-sm font-semibold text-neutral-700 mb-2">Import from CSV</h3>
              <p className="text-xs text-neutral-400 mb-3">Paste rows as: <code className="bg-neutral-100 px-1 py-0.5 rounded text-[11px]">name, email</code> (one per line)</p>
              <textarea
                value={csvText}
                onChange={(e) => handleCsvChange(e.target.value)}
                rows={4}
                placeholder={"John Doe, john@example.com\nJane Smith, jane@example.com"}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#636B50] resize-none font-mono"
              />
              {csvParsed.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-neutral-600 mb-2">Preview ({csvParsed.length} entries):</p>
                  <div className="max-h-32 overflow-auto border border-neutral-100 rounded-lg">
                    {csvParsed.map((p, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-1.5 text-xs border-b border-neutral-50 last:border-0">
                        <span className="text-neutral-700">{p.name || '(no name)'}</span>
                        <span className="text-neutral-400">{p.email}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="mt-3 w-full py-2.5 rounded-xl bg-[#636B50] text-white text-sm font-medium hover:bg-[#555d44] transition-colors disabled:opacity-50"
                  >
                    {importing ? 'Importing...' : `Import ${csvParsed.length} entries`}
                  </button>
                </div>
              )}
            </div>

            {/* Filter + Actions */}
            {waitlistEntries.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {(["all", "waiting", "invited", "signed_up"] as const).map(f => (
                    <button key={f} onClick={() => setWaitlistFilter(f)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        waitlistFilter === f ? 'bg-[#636B50] text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      {f === 'signed_up' ? 'Converted' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {selectedIds.size > 0 && (
                    <button onClick={handleInviteSelected} disabled={inviting}
                      className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                    >
                      {inviting ? 'Sending...' : `Invite ${selectedIds.size} selected`}
                    </button>
                  )}
                  {waitlistStats && waitlistStats.waiting > 0 && (
                    <button onClick={handleInviteAll} disabled={inviting}
                      className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#636B50] text-white hover:bg-[#555d44] disabled:opacity-50"
                    >
                      {inviting ? 'Sending...' : `Invite All Waiting (${waitlistStats.waiting})`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Entries list */}
            {waitlistLoading ? (
              <div className="text-center py-8 text-neutral-400 text-sm">Loading...</div>
            ) : waitlistEntries.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 text-sm">No waitlist entries yet. Import a CSV above.</div>
            ) : (
              <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
                <div className="divide-y divide-neutral-100">
                  {waitlistEntries
                    .filter(e => waitlistFilter === 'all' || e.status === waitlistFilter)
                    .map((entry) => (
                    <div key={entry._id} className="px-4 py-3 flex items-center gap-3">
                      {entry.status === 'waiting' && (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(entry._id)}
                          onChange={() => toggleSelectEntry(entry._id)}
                          className="w-4 h-4 rounded border-neutral-300 text-[#636B50] focus:ring-[#636B50]"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-neutral-800 truncate">{entry.name || '(no name)'}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                            entry.status === 'waiting' ? 'bg-amber-50 text-amber-600' :
                            entry.status === 'invited' ? 'bg-blue-50 text-blue-600' :
                            'bg-emerald-50 text-emerald-600'
                          }`}>
                            {entry.status === 'signed_up' ? 'converted' : entry.status}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-400 mt-0.5">
                          {entry.email}
                          {entry.city && <span> · {entry.city}</span>}
                          {entry.invitedAt && <span> · Invited {new Date(entry.invitedAt).toLocaleDateString()}</span>}
                          {entry.signedUpAt && <span> · Signed up {new Date(entry.signedUpAt).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : tab === "flagged" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-sm font-bold text-neutral-800">Flagged Users</h2>
              <span className="text-xs text-neutral-400">({flaggedReports.filter(r => r.status === 'pending').length} pending)</span>
            </div>

            {flaggedReports.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 py-16 text-center">
                <Shield className="w-10 h-10 text-green-300 mx-auto mb-3" />
                <p className="text-sm text-neutral-400">No flagged users — all clear! 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {flaggedReports.map((report) => (
                  <motion.div
                    key={report._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-2xl shadow-sm border p-4 ${
                      report.status === 'pending'
                        ? report.priority === 'critical' ? 'border-red-300 bg-red-50/30'
                          : report.priority === 'high' ? 'border-orange-200'
                          : 'border-neutral-100'
                        : 'border-neutral-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden flex-shrink-0">
                          {report.user?.image ? (
                            <S3Image fileKey={report.user.image} alt="" width={44} height={44} className="object-cover w-full h-full" />
                          ) : (
                            report.user?.name?.charAt(0)?.toUpperCase() || '?'
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-neutral-800">{report.user?.name || 'Unknown'}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              report.priority === 'critical' ? 'bg-red-100 text-red-700'
                                : report.priority === 'high' ? 'bg-orange-100 text-orange-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {report.contentMetadata?.reportCount || 1} report{(report.contentMetadata?.reportCount || 1) !== 1 ? 's' : ''} · {report.priority}
                            </span>
                            {report.status !== 'pending' && (
                              <span className="text-[10px] font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">dismissed</span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">{report.user?.email || ''}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-neutral-400">
                            {report.user?.mobileNumber && <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" /> {report.user.mobileNumber}</span>}
                            {report.user?.city && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {report.user.city}</span>}
                            {report.user?.instagramHandle && (
                              <a href={`https://instagram.com/${report.user.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 hover:text-[var(--brand-green)]">
                                <Instagram className="w-3 h-3" /> @{report.user.instagramHandle}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {report.status === 'pending' && (
                        <button
                          onClick={() => handleDismissFlag(report._id)}
                          className="text-xs font-medium text-neutral-400 hover:text-neutral-600 px-2 py-1 rounded-lg hover:bg-neutral-100 transition-colors flex-shrink-0"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>

                    {report.contentMetadata?.flaggedBy?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-100">
                        <p className="text-[11px] font-semibold text-neutral-500 mb-1.5">Reports:</p>
                        <div className="space-y-1.5">
                          {report.contentMetadata.flaggedBy.map((f: AnyObj, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-neutral-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                              <span className="font-medium">{f.reason || 'uncomfortable'}</span>
                              <span className="text-neutral-300">·</span>
                              <span>{formatDate(f.timestamp)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {report.notes && (
                      <p className="text-[11px] text-neutral-400 mt-2 italic">{report.notes}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
