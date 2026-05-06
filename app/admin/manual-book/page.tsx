"use client";

import { useState } from "react";

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
      } else {
        setStatus("error");
        setResult(data);
      }
    } catch (err) {
      setStatus("error");
      setResult({ error: String(err) });
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-colors";

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5 uppercase tracking-wider">
              Admin Secret
            </label>
            <input
              type="password"
              required
              value={form.adminSecret}
              onChange={(e) => setForm({ ...form, adminSecret: e.target.value })}
              className={inputClass}
              placeholder="Enter admin secret"
            />
          </div>

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
