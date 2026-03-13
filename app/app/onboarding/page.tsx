"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, ArrowRight, Loader2, Instagram, MapPin, Bell, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { api, imageUrl } from "@/lib/api/client";
import { CITIES } from "@/lib/config/cities";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [instagram, setInstagram] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [notificationCities, setNotificationCities] = useState<string[]>([]);
  const [emailDigest, setEmailDigest] = useState(true);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isLoading && !isLoggedIn) {
    router.replace("/app");
    return null;
  }

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);

    try {
      await api.uploadToS3("profile", file);
      // Keep the local data URL preview — S3 key can't render directly
    } catch {
      // Keep local preview
    }
  };

  const toggleNotifCity = (c: string) => {
    setNotificationCities(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  };

  const filteredCities = CITIES.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!city) {
      setError("Please select your city");
      return;
    }

    setSaving(true);
    try {
      await api.updateProfile({
        name: name.trim(),
        about: about.trim(),
        instagramHandle: instagram.trim().replace('@', ''),
        mobileNumber: phone.trim() || undefined,
        city,
        gender: gender || undefined,
        notificationCities: notificationCities.length > 0 ? notificationCities : [city],
        emailDigest,
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
      <header className="py-4 px-6 md:px-10 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-end hover:opacity-80 transition-opacity">
          <span className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold tracking-tight text-neutral-800">slanup</span>
          <span className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold text-[var(--brand-green)] -ml-0.5">&apos;</span>
          <sup className="text-[10px] font-semibold text-[var(--brand-green)] ml-0.5 relative -top-4">beta</sup>
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-4 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2 text-center">Set up your profile</h1>
          <p className="text-neutral-500 text-center mb-8">
            Tell people a bit about yourself — {(user as Record<string, unknown>)?.email as string}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
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

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                <MapPin className="w-4 h-4 inline mr-1 -mt-0.5" /> Your City *
              </label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (notificationCities.length === 0 && e.target.value) {
                    setNotificationCities([e.target.value]);
                  }
                }}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent"
              >
                <option value="">Select your city</option>
                {CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Gender</label>
              <div className="flex gap-3">
                {(['male', 'female'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(gender === g ? '' : g)}
                    className={`flex-1 py-3 rounded-xl font-medium text-sm border-2 transition-all ${
                      gender === g
                        ? 'border-[var(--brand-green)] bg-[var(--brand-green)]/10 text-[var(--brand-green)]'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-neutral-300'
                    }`}
                  >
                    {g === 'male' ? '♂ Male' : '♀ Female'}
                  </button>
                ))}
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

            {/* Email Digest Section */}
            <div className="bg-neutral-50 rounded-2xl p-4 space-y-4 border border-neutral-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[var(--brand-green)]" />
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Weekly Plan Digest</p>
                    <p className="text-xs text-neutral-500">Get notified about new plans near you</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailDigest(!emailDigest)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${emailDigest ? 'bg-[var(--brand-green)]' : 'bg-neutral-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${emailDigest ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              {emailDigest && (
                <div>
                  <p className="text-xs font-medium text-neutral-600 mb-2">Get updates from these cities:</p>
                  <div className="relative">
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(e) => { setCitySearch(e.target.value); setShowCityDropdown(true); }}
                      onFocus={() => setShowCityDropdown(true)}
                      placeholder="Search cities to add..."
                      className="w-full px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent"
                    />
                    {showCityDropdown && citySearch && (
                      <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-40 overflow-auto z-10">
                        {filteredCities.filter(c => !notificationCities.includes(c)).map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => { toggleNotifCity(c); setCitySearch(""); setShowCityDropdown(false); }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 text-neutral-700"
                          >
                            {c}
                          </button>
                        ))}
                        {filteredCities.filter(c => !notificationCities.includes(c)).length === 0 && (
                          <p className="px-3 py-2 text-sm text-neutral-400">No cities found</p>
                        )}
                      </div>
                    )}
                  </div>

                  {notificationCities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {notificationCities.map(c => (
                        <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--brand-green)]/10 text-[var(--brand-green)] text-xs font-medium rounded-full">
                          {c}
                          <button type="button" onClick={() => toggleNotifCity(c)}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
