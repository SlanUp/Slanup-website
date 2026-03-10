"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, ArrowRight, Loader2, Instagram } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { api, imageUrl } from "@/lib/api/client";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [instagram, setInstagram] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isLoading && !isLoggedIn) {
    router.replace("/app");
    return null;
  }

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to S3 (section=profile auto-updates user.image on backend)
    try {
      const fileUrl = await api.uploadToS3("profile", file);
      setProfileImage(fileUrl);
    } catch {
      // Keep local preview, image upload failed
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    try {
      await api.updateProfile({
        name: name.trim(),
        about: about.trim(),
        instagramHandle: instagram.trim().replace('@', ''),
        ...(profileImage && !profileImage.startsWith('data:') && { image: profileImage }),
      });
      await refreshUser();
      router.replace("/app/feed");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 md:px-10 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-end hover:opacity-80 transition-opacity">
          <span className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-neutral-800">slanup</span>
          <span className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--brand-green)] -ml-0.5">&apos;</span>
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <h1 className="text-3xl font-bold text-neutral-800 mb-2 text-center">Set up your profile</h1>
          <p className="text-neutral-500 text-center mb-8">
            Tell people a bit about yourself — {(user as Record<string, unknown>)?.email as string}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div className="flex justify-center">
              <label className="relative cursor-pointer group">
                <div className="w-24 h-24 rounded-full bg-neutral-100 border-2 border-dashed border-neutral-300 flex items-center justify-center overflow-hidden group-hover:border-[var(--brand-green)] transition-colors">
                  {profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profileImage.startsWith('data:') ? profileImage : imageUrl(profileImage)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-neutral-400 group-hover:text-[var(--brand-green)] transition-colors" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[var(--brand-green)] rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-bold">+</span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
              </label>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent"
                autoFocus
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Instagram</label>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@yourusername"
                  className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">About you</label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="A few words about yourself..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent resize-none"
              />
              <p className="text-xs text-neutral-400 text-right mt-1">{about.length}/500</p>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-4 rounded-2xl text-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Get started
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
