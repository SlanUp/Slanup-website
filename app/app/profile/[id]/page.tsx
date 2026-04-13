"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Instagram, Edit3, Camera, Loader2, MapPin, BarChart3, MessageSquarePlus, ShieldCheck, Bell, X, Flag, Shield, Info, Trash2, Ban, Calendar, LayoutList, ArrowRight, Users } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { api, clearAuth } from "@/lib/api/client";
import S3Image from "@/components/S3Image";
import ImageCropper from "@/components/ImageCropper";
import Link from "next/link";
import { ALL_CITIES, REGION_GROUP_NAMES } from "@/lib/config/cities";
import { hapticLight, hapticMedium, hapticWarning, hapticSelection } from "@/lib/native/haptics";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, refreshUser } = useAuth();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<AnyObj | null>(null);
  const [stats, setStats] = useState<{ created: number; joined: number; completed: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editInsta, setEditInsta] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Digest preferences
  const [emailDigest, setEmailDigest] = useState(false);
  const [notificationCities, setNotificationCities] = useState<string[]>([]);
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [prefsChanged, setPrefsChanged] = useState(false);
  const initialPrefs = useRef({ emailDigest: false, notificationCities: [] as string[] });

  // Profile rating (female → male)
  const [canRate, setCanRate] = useState(false);
  const [hasRatedSafe, setHasRatedSafe] = useState(false);
  const [hasFlagged, setHasFlagged] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [sharedPlanName, setSharedPlanName] = useState("");

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Block user
  const [blocking, setBlocking] = useState(false);

  // Hosted plans
  const [hostedPlans, setHostedPlans] = useState<Record<string, unknown>[]>([]);
  const [activePlans, setActivePlans] = useState<Record<string, unknown>[]>([]);

  // Communities
  const [profileCommunities, setProfileCommunities] = useState<Record<string, unknown>[]>([]);

  // Host rating
  const [hostRating, setHostRating] = useState<string | null>(null);
  const [totalRatings, setTotalRatings] = useState(0);

  const isOwnProfile = (currentUser as AnyObj)?._id === profileId;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropImageSrc(reader.result as string);
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  const handleCroppedUpload = async (croppedFile: File) => {
    setCropImageSrc(null);
    setUploadingPhoto(true);
    try {
      await api.uploadToS3("profile", croppedFile);
      await refreshUser();
      fetchProfile();
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = (await api.getProfile(profileId)) as { data: { user: AnyObj; stats?: { created: number; joined: number; completed: number } } };
      setProfile(res.data.user);
      if (res.data.stats) setStats(res.data.stats);
      // Init digest prefs from profile
      const u = res.data.user;
      setEmailDigest(!!u.emailDigest);
      setNotificationCities(u.notificationCities || []);
      initialPrefs.current = { emailDigest: !!u.emailDigest, notificationCities: u.notificationCities || [] };
    } catch {
      // not found
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    api.getHostedPlans(profileId).then(res => {
      setHostedPlans(res.data.plans);
    }).catch(() => {});
    api.getActivePlans(profileId).then(res => {
      setActivePlans(res.data.plans);
    }).catch(() => {});
    api.getProfileCommunities(profileId).then((res: unknown) => {
      setProfileCommunities(((res as AnyObj)?.data?.communities) || []);
    }).catch(() => {});
  }, [profileId]);

  useEffect(() => {
    api.getProfileRating(profileId).then(res => {
      setHostRating(res.data.avgScore);
      setTotalRatings(res.data.totalRatings);
    }).catch(() => {});
  }, [profileId]);

  // Check if current user can rate this profile
  useEffect(() => {
    if (!isOwnProfile && currentUser && profileId) {
      api.canRateProfile(profileId).then((res) => {
        const data = (res as AnyObj)?.data;
        if (data) {
          setCanRate(data.canRate);
          setHasRatedSafe(data.hasRatedSafe || false);
          setHasFlagged(data.hasFlagged || false);
          setSharedPlanName(data.sharedPlanName || '');
        }
      }).catch(() => {});
    }
  }, [isOwnProfile, currentUser, profileId]);

  const handleProfileFeltSafe = async () => {
    hapticMedium();
    setRatingLoading(true);
    try {
      if (hasRatedSafe) {
        await api.revokeFeltSafe(profileId);
        setHasRatedSafe(false);
        if (profile) setProfile({ ...profile, feltSafeCount: Math.max(0, (profile.feltSafeCount || 0) - 1) });
      } else {
        await api.profileFeltSafe(profileId);
        setHasRatedSafe(true);
        setHasFlagged(false);
        if (profile) setProfile({ ...profile, feltSafeCount: (profile.feltSafeCount || 0) + 1 });
      }
    } catch {
      alert('Failed to update rating');
    } finally {
      setRatingLoading(false);
    }
  };

  const handleProfileFlag = async () => {
    hapticWarning();
    setRatingLoading(true);
    try {
      if (hasFlagged) {
        await api.revokeFlag(profileId);
        setHasFlagged(false);
      } else {
        if (!confirm('Flag this person as someone who made you uncomfortable?')) {
          setRatingLoading(false);
          return;
        }
        await api.profileFlag(profileId, 'uncomfortable');
        setHasFlagged(true);
        setHasRatedSafe(false);
        // feltSafeCount decremented on backend if safe was revoked
        if (hasRatedSafe && profile) {
          setProfile({ ...profile, feltSafeCount: Math.max(0, (profile.feltSafeCount || 0) - 1) });
        }
      }
    } catch {
      alert('Failed to update flag');
    } finally {
      setRatingLoading(false);
    }
  };

  const startEdit = () => {
    hapticLight();
    setEditName(profile?.name || "");
    setEditBio(profile?.about || "");
    setEditInsta(profile?.instagramHandle || "");
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile({
        name: editName,
        about: editBio,
        instagramHandle: editInsta,
      });
      await refreshUser();
      fetchProfile();
      setEditing(false);
    } catch {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Track changes to digest prefs
  useEffect(() => {
    const changed =
      emailDigest !== initialPrefs.current.emailDigest ||
      JSON.stringify(notificationCities.sort()) !== JSON.stringify(initialPrefs.current.notificationCities.sort());
    setPrefsChanged(changed);
    setPrefsSaved(false);
  }, [emailDigest, notificationCities]);

  const toggleNotifCity = (c: string) => {
    setNotificationCities(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  };

  const notifCityOptions = [...ALL_CITIES, ...REGION_GROUP_NAMES].sort();
  const filteredCities = notifCityOptions.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    try {
      await api.updateProfile({
        emailDigest,
        notificationCities: notificationCities.length > 0 ? notificationCities : (profile?.city ? [profile.city] : []),
      });
      initialPrefs.current = { emailDigest, notificationCities: [...notificationCities] };
      setPrefsChanged(false);
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2000);
    } catch {
      alert("Failed to save preferences");
    } finally {
      setSavingPrefs(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--brand-green)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-4">
        <p className="text-neutral-500 text-lg">User not found</p>
        <button onClick={() => { hapticLight(); if (window.history.length > 1) router.back(); else router.push('/app/feed'); }} className="text-[var(--brand-green)] font-semibold hover:underline">← Go back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => { hapticLight(); if (window.history.length > 1) router.back(); else router.push('/app/feed'); }} className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <h1 className="text-lg font-bold text-neutral-800">Profile</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Banner */}
          <div className="h-24 md:h-32 bg-gradient-to-br from-[var(--brand-green)] to-green-700 relative" />

          {/* Avatar */}
          <div className="relative px-5 md:px-6 -mt-12 md:-mt-14">
            <div
              className={`w-28 h-28 rounded-full border-4 border-white bg-gradient-to-br from-[var(--brand-green)] to-green-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden shadow-lg relative ${isOwnProfile || profile.image ? 'cursor-pointer' : ''}`}
              onClick={() => {
                if (isOwnProfile) photoInputRef.current?.click();
                else if (profile.image) setShowImagePreview(true);
              }}
            >
              {profile.image ? (
                <S3Image
                  fileKey={profile.image}
                  alt=""
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                />
              ) : (
                profile.name?.charAt(0)?.toUpperCase() || "?"
              )}
              {isOwnProfile && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center group">
                  {uploadingPhoto ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              )}
            </div>
            {isOwnProfile && (
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            )}
          </div>

          {/* Info */}
          <div className="px-6 pt-4 pb-6">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-neutral-700 block mb-1">Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700 block mb-1">Instagram</label>
                  <input
                    type="text"
                    value={editInsta}
                    onChange={(e) => setEditInsta(e.target.value)}
                    placeholder="username (without @)"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700 block mb-1">Bio</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-3 rounded-2xl transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-6 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold py-3 rounded-2xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-800">{profile.name}</h2>
                    {profile.instagramHandle && (
                      <a
                        href={`https://instagram.com/${profile.instagramHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-neutral-500 hover:text-[var(--brand-green)] mt-1 transition-colors"
                      >
                        <Instagram className="w-4 h-4" /> @{profile.instagramHandle}
                      </a>
                    )}
                  </div>
                  {isOwnProfile && (
                    <button
                      onClick={startEdit}
                      className="p-2 rounded-xl hover:bg-neutral-100 transition-colors text-neutral-500"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {profile.about && (
                  <p className="text-neutral-600 text-sm mt-4 leading-relaxed whitespace-pre-wrap">
                    {profile.about}
                  </p>
                )}

                {profile.city && (
                  <p className="text-neutral-500 text-sm mt-2 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {profile.city}
                  </p>
                )}

                {profile.gender === 'male' && profile.feltSafeCount > 0 && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3.5 py-1.5 relative group">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-700">{profile.feltSafeCount} women felt safe</span>
                    <Info className="w-3.5 h-3.5 text-emerald-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-neutral-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 text-center leading-relaxed">
                      Number of women who felt safe around him while interacting together in plans on Slanup
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800" />
                    </div>
                  </div>
                )}

                {hostRating && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm text-amber-500">⭐ {hostRating}</span>
                    <span className="text-xs text-neutral-400">({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})</span>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* Rate This Person (female viewers on male profiles with shared plans) */}
        {canRate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-white rounded-2xl shadow-lg p-5 mt-4"
          >
            <h3 className="text-sm font-bold text-neutral-700 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Rate This Person
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              You were in <span className="font-medium text-neutral-600">&ldquo;{sharedPlanName}&rdquo;</span> together
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleProfileFeltSafe}
                disabled={ratingLoading}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
                  hasRatedSafe
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                {hasRatedSafe ? 'Felt Safe ✓' : 'Felt Safe'}
              </button>
              <button
                onClick={handleProfileFlag}
                disabled={ratingLoading}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
                  hasFlagged
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                }`}
              >
                <Flag className="w-4 h-4" />
                {hasFlagged ? 'Flagged ✓' : 'Flag'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Photos */}
        {profile.photos?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-5 mt-4"
          >
            <h3 className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4" /> Photos
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {profile.photos.map((key: string, i: number) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-neutral-100">
                  <S3Image
                    fileKey={key}
                    alt=""
                    width={200}
                    height={200}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Plan Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl shadow-lg p-5 mt-4"
          >
            <h3 className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Plan Stats
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center bg-neutral-50 rounded-xl py-3">
                <p className="text-2xl font-bold text-[var(--brand-green)]">{stats.created}</p>
                <p className="text-xs text-neutral-500 mt-0.5">Created</p>
              </div>
              <div className="text-center bg-neutral-50 rounded-xl py-3">
                <p className="text-2xl font-bold text-[var(--brand-green)]">{stats.joined}</p>
                <p className="text-xs text-neutral-500 mt-0.5">Joined</p>
              </div>
              <div className="text-center bg-neutral-50 rounded-xl py-3">
                <p className="text-2xl font-bold text-[var(--brand-green)]">{stats.completed}</p>
                <p className="text-xs text-neutral-500 mt-0.5">Completed</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notification Preferences */}
        {isOwnProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="bg-white rounded-2xl shadow-lg p-5 mt-4"
          >
            <h3 className="text-sm font-bold text-neutral-700 mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4" /> Notification Preferences
            </h3>

            {/* Digest toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-800">Weekly Plan Digest</p>
                <p className="text-xs text-neutral-500">Get emails about new plans near you</p>
              </div>
              <button
                type="button"
                onClick={() => { hapticSelection(); setEmailDigest(!emailDigest); }}
                className={`relative w-11 h-6 rounded-full transition-colors ${emailDigest ? 'bg-[var(--brand-green)]' : 'bg-neutral-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${emailDigest ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {/* City selector */}
            {emailDigest && (
              <div className="mt-4">
                <p className="text-xs font-medium text-neutral-600 mb-2">Get updates from these cities:</p>
                <div className="relative">
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => { setCitySearch(e.target.value); setShowCityDropdown(true); }}
                    onFocus={() => setShowCityDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                    placeholder="Search cities to add..."
                    className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent"
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

            {/* Save button */}
            {prefsChanged && (
              <button
                onClick={handleSavePrefs}
                disabled={savingPrefs}
                className="mt-4 w-full bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {savingPrefs ? "Saving..." : "Save Preferences"}
              </button>
            )}
            {prefsSaved && (
              <p className="mt-2 text-xs text-center text-emerald-600 font-medium">✓ Preferences saved</p>
            )}
          </motion.div>
        )}

        {/* Feedback / Bug Report */}
        {isOwnProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 mb-6"
          >
            <a
              href="mailto:hello@slanup.com?subject=Slanup Feedback"
              className="flex items-center gap-3 bg-white rounded-2xl shadow-lg p-4 hover:bg-neutral-50 transition-colors"
            >
              <div className="w-10 h-10 bg-[var(--brand-green)]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageSquarePlus className="w-5 h-5 text-[var(--brand-green)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-800">File a bug or suggestion</p>
                <p className="text-xs text-neutral-500">Help us make Slanup better</p>
              </div>
            </a>
          </motion.div>
        )}

        {/* Block User (other profiles only) */}
        {!isOwnProfile && currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="mt-4"
          >
            <button
              onClick={async () => {
                hapticWarning();
                if (!confirm("Block this user? You won\u2019t see their plans or messages.")) return;
                setBlocking(true);
                try {
                  await api.blockUser(profileId);
                  router.replace("/app/feed");
                } catch {
                  alert("Failed to block user. Please try again.");
                } finally {
                  setBlocking(false);
                }
              }}
              disabled={blocking}
              className="w-full flex items-center gap-3 bg-white rounded-2xl shadow-lg p-4 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Ban className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-red-600">{blocking ? "Blocking..." : "Block User"}</p>
                <p className="text-xs text-neutral-500">You won&apos;t see their plans or messages</p>
              </div>
            </button>
          </motion.div>
        )}

        {/* Communities */}
        {profileCommunities.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-neutral-800 mb-3 px-1">Communities</h3>
            <div className="space-y-3">
              {profileCommunities.map((c: Record<string, unknown>) => (
                <Link key={c._id as string} href={`/app/community/${c._id}`}>
                  <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[var(--brand-green)]/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-[var(--brand-green)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-800 truncate">{c.name as string}</p>
                        <p className="text-sm text-neutral-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {c.city as string}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* My Plans Link (own profile) */}
        {isOwnProfile && (
          <Link href="/app/my-plans" className="block mt-4">
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--brand-green)]/10 rounded-xl flex items-center justify-center">
                  <LayoutList className="w-5 h-5 text-[var(--brand-green)]" />
                </div>
                <span className="font-semibold text-neutral-800">My Plans</span>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-400" />
            </div>
          </Link>
        )}

        {/* Active / Upcoming Plans */}
        {activePlans.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-neutral-800 mb-3 px-1">Upcoming Plans</h3>
            <div className="space-y-3">
              {activePlans.map((plan: Record<string, unknown>) => (
                <Link key={plan._id as string} href={`/app/plan/${plan._id || plan.id}`}>
                  <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow border-l-4 border-[var(--brand-green)]">
                    <div className="flex items-center gap-3">
                      {plan.pic_id ? (
                        <S3Image fileKey={plan.pic_id as string} alt="" width={60} height={60} className="w-15 h-15 rounded-xl object-cover" />
                      ) : (
                        <div className="w-15 h-15 rounded-xl bg-[var(--brand-green)]/10 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-[var(--brand-green)]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-800 truncate">{plan.name as string}</p>
                        <p className="text-sm text-neutral-500">
                          {new Date(plan.start as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' · '}{(plan.participants as unknown[])?.length || 0}/{plan.max_people as number} people
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Past Plans */}
        {hostedPlans.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-neutral-800 mb-3 px-1">Past Plans</h3>
            <div className="space-y-3">
              {hostedPlans.map((plan: Record<string, unknown>) => (
                <Link key={plan._id as string} href={`/app/plan/${plan._id || plan.id}`}>
                  <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      {plan.pic_id ? (
                        <S3Image fileKey={plan.pic_id as string} alt="" width={60} height={60} className="w-15 h-15 rounded-xl object-cover" />
                      ) : (
                        <div className="w-15 h-15 rounded-xl bg-[var(--brand-green)]/10 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-[var(--brand-green)]/50" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-800 truncate">{plan.name as string}</p>
                        <p className="text-sm text-neutral-500">
                          {new Date(plan.end as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' · '}{(plan.participants as unknown[])?.length || 0}/{plan.max_people as number} people
                        </p>
                        {(plan.gallery as string[])?.length > 0 && (
                          <p className="text-xs text-[var(--brand-green)] mt-0.5">📸 {(plan.gallery as string[]).length} photos</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Delete Account (own profile only) */}
        {isOwnProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-4 mb-8"
          >
            <button
              onClick={() => { hapticWarning(); setShowDeleteModal(true); setDeleteConfirmText(""); }}
              className="w-full flex items-center gap-3 bg-white rounded-2xl shadow-lg p-4 hover:bg-red-50 transition-colors"
            >
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-red-600">Delete My Account</p>
                <p className="text-xs text-neutral-500">Permanently delete all your data</p>
              </div>
            </button>
          </motion.div>
        )}
      </main>

      {/* Image Crop Modal */}
      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropDone={handleCroppedUpload}
          onCancel={() => setCropImageSrc(null)}
        />
      )}

      {/* Image Preview Modal */}
      {showImagePreview && profile.image && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
          onClick={() => setShowImagePreview(false)}
        >
          <button
            onClick={() => setShowImagePreview(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <S3Image
            fileKey={profile.image}
            alt={profile.name || "Profile"}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
          />
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-neutral-800">Delete Account</h3>
            </div>
            <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
              Are you sure? This will permanently delete your account, all your plans, messages, and data. This action cannot be undone.
            </p>
            <p className="text-sm font-medium text-neutral-700 mb-2">
              Type <span className="font-bold text-red-600">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await api.deleteAccount();
                    clearAuth();
                    router.replace("/app");
                  } catch {
                    alert("Failed to delete account. Please try again.");
                  } finally {
                    setDeleting(false);
                  }
                }}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
