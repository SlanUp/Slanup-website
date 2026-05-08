"use client";

import { useState } from "react";

interface SheetStats {
  total: number;
  paid: number;
  paidMale: number;
  paidFemale: number;
  active: number;
  backedOut: number;
  activeList: { code: string; name: string; group: string }[];
}

export default function ManualBookPage() {
  const [form, setForm] = useState({
    inviteCode: "",
    name: "",
    email: "",
    phone: "",
    adminSecret: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [stats, setStats] = useState<SheetStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadStats = async () => {
    if (!form.adminSecret) return;
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/sheet-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminSecret: form.adminSecret }),
      });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch {
      // ignore
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setResult(null);

    try {
      const res = await fetch("/api/offlyn/manual-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setResult(data);
        setForm((f) => ({ ...f, inviteCode: "", name: "", email: "", phone: "" }));
        loadStats();
      } else {
        setStatus("error");
        setResult(data);
      }
    } catch (err) {
      setStatus("error");
      setResult({ error: String(err) });
    }
  };

  const selectCode = (code: string, name: string) => {
    setForm((f) => ({ ...f, inviteCode: code, name }));
  };

  const filteredActive = stats?.activeList.filter(
    (item) =>
      !searchQuery ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.group.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-colors";

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-bold tracking-wide"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            🌕 Manual Booking
          </h1>
          <p className="text-neutral-500 text-sm mt-2">
            Create a booking for offline / UPI payments
          </p>
        </div>

        {/* Admin Secret */}
        <div className="mb-6">
          <label className="block text-xs text-neutral-400 mb-1.5 uppercase tracking-wider">
            Admin Secret
          </label>
          <div className="flex gap-3">
            <input
              type="password"
              required
              value={form.adminSecret}
              onChange={(e) => setForm({ ...form, adminSecret: e.target.value })}
              className={inputClass}
              placeholder="Enter admin secret"
            />
            <button
              type="button"
              onClick={loadStats}
              disabled={statsLoading || !form.adminSecret}
              className="px-5 rounded-xl text-sm font-medium bg-neutral-800 border border-neutral-700 hover:border-amber-500/50 transition-colors disabled:opacity-40 whitespace-nowrap"
            >
              {statsLoading ? "Loading…" : "Load Stats"}
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        {stats && (
          <div className="mb-8 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-green-900/20 border border-green-500/20 p-4 text-center">
                <p className="text-2xl font-bold text-green-400">{stats.paid}</p>
                <p className="text-[11px] text-green-300/70 uppercase tracking-wider mt-1">Paid</p>
                <p className="text-[10px] text-green-300/50 mt-1">
                  ♂ {stats.paidMale} ({stats.paid ? Math.round(stats.paidMale / stats.paid * 100) : 0}%)
                  {' · '}
                  ♀ {stats.paidFemale} ({stats.paid ? Math.round(stats.paidFemale / stats.paid * 100) : 0}%)
                </p>
              </div>
              <div className="rounded-xl bg-amber-900/20 border border-amber-500/20 p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">{stats.active}</p>
                <p className="text-[11px] text-amber-300/70 uppercase tracking-wider mt-1">Active Codes</p>
              </div>
              <div className="rounded-xl bg-red-900/20 border border-red-500/20 p-4 text-center">
                <p className="text-2xl font-bold text-red-400">{stats.backedOut}</p>
                <p className="text-[11px] text-red-300/70 uppercase tracking-wider mt-1">Backed Out</p>
              </div>
            </div>

            {/* Active Codes List */}
            <div className="rounded-xl bg-neutral-900/50 border border-neutral-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium">
                  Active Codes ({stats.active})
                </p>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 w-40"
                  placeholder="Search…"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredActive?.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => selectCode(item.code, item.name)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-neutral-800/50 transition-colors text-left border-b border-neutral-800/50 last:border-0"
                  >
                    <div>
                      <span className="text-sm text-white font-medium">{item.name}</span>
                      <span className="text-xs text-neutral-500 ml-2">{item.group}</span>
                    </div>
                    <span className="text-xs font-mono text-amber-400/80">{item.code}</span>
                  </button>
                ))}
                {filteredActive?.length === 0 && (
                  <p className="text-xs text-neutral-600 text-center py-4">No matches</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <hr className="border-neutral-800" />

          <div>
            <label className="block text-xs text-neutral-400 mb-1.5 uppercase tracking-wider">
              Invite Code
            </label>
            <input
              type="text"
              required
              value={form.inviteCode}
              onChange={(e) =>
                setForm({ ...form, inviteCode: e.target.value.toUpperCase() })
              }
              className={inputClass}
              placeholder="e.g. GX-ABC-01"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              placeholder="Rahul Kumar"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
              placeholder="rahul@example.com"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1.5 uppercase tracking-wider">
              Phone
            </label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
              placeholder="9876543210"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-3.5 rounded-xl font-semibold text-black transition-all disabled:opacity-50"
            style={{
              background:
                "linear-gradient(135deg, #FFD700 0%, #F5B800 50%, #E5A100 100%)",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {status === "loading" ? "Creating..." : "Create Booking & Send Ticket"}
          </button>
        </form>

        {status === "success" && result && (
          <div className="mt-6 p-4 rounded-xl bg-green-900/30 border border-green-500/30 text-green-300 text-sm">
            <p className="font-semibold mb-2">✅ Booking Created!</p>
            <p>
              Ref: <span className="font-mono">{String((result as { referenceNumber?: string }).referenceNumber || "")}</span>
            </p>
            <p>Sheet updated + ticket email sent.</p>
            {(result as { alreadyConfirmed?: boolean }).alreadyConfirmed && (
              <p className="mt-1 text-amber-300">⚠️ This code was already booked.</p>
            )}
          </div>
        )}

        {status === "error" && result && (
          <div className="mt-6 p-4 rounded-xl bg-red-900/30 border border-red-500/30 text-red-300 text-sm">
            <p className="font-semibold">❌ Error</p>
            <p>{String((result as { error?: string }).error || "Something went wrong")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
