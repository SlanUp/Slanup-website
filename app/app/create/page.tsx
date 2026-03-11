"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, X, MapPin, Calendar, Clock, Users, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { api } from "@/lib/api/client";
import { CITIES, PLAN_TAGS } from "@/lib/config/cities";


export default function CreatePlanPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxPeople, setMaxPeople] = useState("10");
  const [tags, setTags] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [coverKey, setCoverKey] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Compute validation issues
  const validationIssues: string[] = [];
  if (!name) validationIssues.push("Plan name is required");
  if (!city) validationIssues.push("City is required");
  if (!startDate || !startTime) validationIssues.push("Start date & time are required");
  if (!endDate || !endTime) validationIssues.push("End date & time are required");
  if (startDate && startTime && new Date(`${startDate}T${startTime}`) < new Date()) {
    validationIssues.push("Start must be in the future");
  }
  if (startDate && startTime && endDate && endTime) {
    const s = new Date(`${startDate}T${startTime}`);
    const e = new Date(`${endDate}T${endTime}`);
    if (e <= s) validationIssues.push("End must be after start");
  }
  const canSubmit = validationIssues.length === 0 && !submitting && !uploading;

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.replace("/app");
  }, [isLoading, isLoggedIn, router]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const fileUrl = await api.uploadToS3("plan", file);
      setCoverKey(fileUrl);
    } catch {
      alert("Upload failed. Please try again.");
      setCoverPreview("");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !startDate || !startTime || !endDate || !endTime || !city) {
      alert("Please fill in all required fields.");
      return;
    }

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    if (end <= start) {
      alert("End date/time must be after the start date/time.");
      return;
    }

    if (start < new Date()) {
      alert("Start date/time cannot be in the past.");
      return;
    }

    setSubmitting(true);

    try {
      await api.createPlan({
        name,
        desc,
        city,
        start: start.toISOString(),
        end: end.toISOString(),
        max_people: parseInt(maxPeople) || 10,
        tags,
        pic_id: coverKey || undefined,
      });

      setSubmitted(true);
    } catch {
      alert("Failed to create plan. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-lg p-8 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-10 h-10 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">Your Plan is Live! 🎉</h1>
          <p className="text-neutral-500 mb-6">
            Your plan is now visible in the feed. Share it with friends and let people join!
          </p>
          <Link
            href="/app/feed"
            className="inline-block bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-3 px-8 rounded-2xl transition-colors"
          >
            Check it out →
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <h1 className="text-lg font-bold text-neutral-800">Create a Plan</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 md:py-6 pb-24 md:pb-32">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cover Image */}
          <div>
            <label className="text-sm font-semibold text-neutral-700 block mb-2">Cover Photo</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full h-40 md:h-48 rounded-2xl border-2 border-dashed border-neutral-200 hover:border-[var(--brand-green)] bg-white cursor-pointer flex items-center justify-center overflow-hidden transition-colors relative"
            >
              {coverPreview ? (
                <>
                  <Image src={coverPreview} alt="Cover" fill className="object-cover" />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCoverPreview("");
                      setCoverKey("");
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-neutral-400">
                  {uploading ? (
                    <div className="w-8 h-8 border-3 border-[var(--brand-green)] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8" />
                      <span className="text-sm">Add a cover photo</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-neutral-700 block mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Weekend Hike, Rooftop Party, Coffee Meetup..."
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-2xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-neutral-700 block mb-2">Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What's the plan about? Share the vibe..."
              rows={4}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-2xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent resize-none"
            />
          </div>

          {/* City */}
          <div>
            <label className="text-sm font-semibold text-neutral-700 block mb-2">
              <MapPin className="w-4 h-4 inline mr-1 -mt-0.5" /> City <span className="text-red-400">*</span>
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-2xl text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent"
              required
            >
              <option value="">Select city</option>
              {CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <p className="text-xs text-neutral-400 mt-1.5">Your plan will be visible to people browsing this city</p>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-neutral-700 block mb-2">
                <Calendar className="w-4 h-4 inline mr-1 -mt-0.5" /> Start Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (!endDate) setEndDate(e.target.value);
                }}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-2xl text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-700 block mb-2">
                <Clock className="w-4 h-4 inline mr-1 -mt-0.5" /> Start Time <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-2xl text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-700 block mb-2">End Date <span className="text-red-400">*</span></label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-2xl text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-700 block mb-2">End Time <span className="text-red-400">*</span></label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-2xl text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Max People */}
          <div>
            <label className="text-sm font-semibold text-neutral-700 block mb-2">
              <Users className="w-4 h-4 inline mr-1 -mt-0.5" /> Max Guests
            </label>
            <input
              type="number"
              value={maxPeople}
              onChange={(e) => setMaxPeople(e.target.value)}
              min="2"
              max="100"
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-2xl text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-semibold text-neutral-700 block mb-2">
              <Tag className="w-4 h-4 inline mr-1 -mt-0.5" /> Tags
            </label>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--brand-green)] text-white text-xs font-medium rounded-full">
                    {tag}
                    <button type="button" onClick={() => setTags(prev => prev.filter(t => t !== tag))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {PLAN_TAGS.filter(t => !tags.includes(t)).map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTags(prev => [...prev, tag])}
                  className="px-2.5 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-full hover:bg-neutral-200 transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Validation hints */}
          {validationIssues.length > 0 && (name || city || startDate || endDate) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <ul className="text-xs text-amber-700 space-y-0.5">
                {validationIssues.map((issue) => (
                  <li key={issue}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={!canSubmit}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-4 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </div>
            ) : (
              "Submit Plan for Review"
            )}
          </motion.button>

          <p className="text-center text-xs text-neutral-400 -mt-2">
            Your plan will be reviewed before going live
          </p>
        </form>
      </main>
    </div>
  );
}
