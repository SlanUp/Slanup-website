"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, Search, Plus, MapPin, Star, X, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { api } from "@/lib/api/client";
import S3Image from "@/components/S3Image";
import { ALL_CITIES, REGION_GROUP_NAMES } from "@/lib/config/cities";
import { hapticLight } from "@/lib/native/haptics";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

export default function CommunitiesPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [communities, setCommunities] = useState<AnyObj[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [eligible, setEligible] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  // Create community form
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createCity, setCreateCity] = useState("");
  const [createTags, setCreateTags] = useState("");
  const [createCoverKey, setCreateCoverKey] = useState("");
  const [createCoverPreview, setCreateCoverPreview] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchCommunities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getCommunities(cityFilter || undefined, search || undefined) as { data: { communities: AnyObj[] } };
      setCommunities(res.data.communities);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [cityFilter, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchCommunities(), 300);
    return () => clearTimeout(timer);
  }, [fetchCommunities]);

  useEffect(() => {
    if (isLoggedIn) {
      api.checkCommunityEligibility().then((res: unknown) => {
        const data = (res as AnyObj)?.data;
        setEligible(data?.eligible);
        setCompletedCount(data?.completedCount || 0);
      }).catch(() => {});
    }
  }, [isLoggedIn]);

  const handleCreate = async () => {
    if (!createName.trim() || !createCity.trim()) return;
    setCreating(true);
    try {
      await api.createCommunity({
        name: createName.trim(),
        description: createDesc.trim(),
        city: createCity.trim(),
        tags: createTags.split(',').map(t => t.trim()).filter(Boolean),
        coverImage: createCoverKey || undefined,
      });
      setShowCreate(false);
      setCreateName("");
      setCreateDesc("");
      setCreateCity("");
      setCreateTags("");
      setCreateCoverKey("");
      setCreateCoverPreview("");
      fetchCommunities();
    } catch (err) {
      const msg = (err as AnyObj)?.message || 'Failed to create community';
      alert(msg);
    } finally {
      setCreating(false);
    }
  };

  const feedCityOptions = [...ALL_CITIES, ...REGION_GROUP_NAMES].sort();
  const filteredCities = feedCityOptions.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => { if (window.history.length > 1) router.back(); else router.push('/app/feed'); }} className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <h1 className="text-lg font-bold text-neutral-800 flex-1">Communities</h1>
          {eligible && (
            <button
              onClick={() => { hapticLight(); setShowCreate(true); }}
              className="p-2 rounded-xl bg-[var(--brand-green)]/10 hover:bg-[var(--brand-green)]/20 transition-colors"
            >
              <Plus className="w-5 h-5 text-[var(--brand-green)]" />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-4 pb-24">
        {/* Search & Filter */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search communities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:ring-2 focus:ring-[var(--brand-green)] outline-none"
            />
          </div>
          <button
            onClick={() => setShowCityPicker(!showCityPicker)}
            className={`px-3 py-2.5 rounded-xl border text-sm flex items-center gap-1.5 transition-colors ${cityFilter ? 'bg-[var(--brand-green)]/10 border-[var(--brand-green)] text-[var(--brand-green)]' : 'border-neutral-200 bg-white text-neutral-600'}`}
          >
            <MapPin className="w-3.5 h-3.5" />
            {cityFilter || 'All'}
          </button>
        </div>

        {/* City Picker */}
        <AnimatePresence>
          {showCityPicker && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-white rounded-xl border border-neutral-200 p-3">
                <input
                  type="text"
                  placeholder="Search cities..."
                  value={citySearch}
                  onChange={e => setCitySearch(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm mb-2 outline-none focus:ring-1 focus:ring-[var(--brand-green)]"
                />
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  <button
                    onClick={() => { setCityFilter(''); setShowCityPicker(false); setCitySearch(''); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${!cityFilter ? 'bg-[var(--brand-green)] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                  >
                    All Cities
                  </button>
                  {filteredCities.map(c => (
                    <button
                      key={c}
                      onClick={() => { setCityFilter(c); setShowCityPicker(false); setCitySearch(''); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${cityFilter === c ? 'bg-[var(--brand-green)] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-3 border-[var(--brand-green)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : communities.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="w-20 h-20 bg-[var(--brand-green)]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-[var(--brand-green)]" />
            </div>
            <h2 className="text-xl font-bold text-neutral-700 mb-2">No communities yet{cityFilter ? ` in ${cityFilter}` : ''}</h2>
            <p className="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">
              {eligible
                ? 'Be the first to create a community!'
                : `Host ${3 - completedCount} more plan${3 - completedCount === 1 ? '' : 's'} to unlock community creation.`}
            </p>
            {eligible && (
              <button
                onClick={() => { hapticLight(); setShowCreate(true); }}
                className="inline-flex items-center gap-2 bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-3 px-6 rounded-2xl transition-colors"
              >
                <Plus className="w-5 h-5" /> Create Community
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {communities.map((c, i) => (
              <motion.div key={c._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/app/community/${c._id}`}>
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {c.coverImage && (
                      <div className="h-32 relative overflow-hidden">
                        <S3Image fileKey={c.coverImage} alt="" className="object-cover w-full h-full" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-neutral-800 text-lg">{c.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-neutral-500 mt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{c.city}</span>
                        <span>{c.planCount || 0} plans</span>
                        <span>{c.totalParticipants || 0} people</span>
                        <span>{c.followerCount || 0} followers</span>
                      </div>
                      {c.description && (
                        <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{c.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex -space-x-2">
                          {c.admin?.image ? (
                            <S3Image fileKey={c.admin.image} alt="" width={28} height={28} className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full border-2 border-white bg-[var(--brand-green)] flex items-center justify-center text-white text-xs font-bold">
                              {c.admin?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                          {(c.moderators || []).slice(0, 2).map((h: AnyObj) => (
                            h?.image ? (
                              <S3Image key={h._id} fileKey={h.image} alt="" width={28} height={28} className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                            ) : (
                              <div key={h._id} className="w-7 h-7 rounded-full border-2 border-white bg-neutral-300 flex items-center justify-center text-white text-xs font-bold">
                                {h?.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                            )
                          ))}
                        </div>
                        <span className="text-xs text-neutral-400">
                          by {c.admin?.name}{c.moderators?.length > 0 ? ` +${c.moderators.length}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Eligibility hint at bottom */}
        {!eligible && communities.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-400">
              Host {3 - completedCount} more plan{3 - completedCount === 1 ? '' : 's'} to create your own community
            </p>
          </div>
        )}
      </main>

      {/* Create Community Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-800">Create Community</h2>
                <button onClick={() => setShowCreate(false)} className="p-1 rounded-full hover:bg-neutral-100">
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Cover Image</label>
                  {createCoverPreview ? (
                    <div className="relative h-32 rounded-xl overflow-hidden bg-neutral-100">
                      <img src={createCoverPreview} alt="" className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => { setCreateCoverPreview(''); setCreateCoverKey(''); }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className={`block h-32 rounded-xl border-2 border-dashed border-neutral-200 hover:border-[var(--brand-green)] transition-colors cursor-pointer flex items-center justify-center ${coverUploading ? 'opacity-50' : ''}`}>
                      <div className="text-center">
                        <Camera className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                        <span className="text-xs text-neutral-400">{coverUploading ? 'Uploading...' : 'Add cover photo'}</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={coverUploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setCreateCoverPreview(URL.createObjectURL(file));
                          setCoverUploading(true);
                          try {
                            const key = await api.uploadToS3('community', file);
                            setCreateCoverKey(key);
                          } catch { alert('Upload failed'); setCreateCoverPreview(''); }
                          finally { setCoverUploading(false); }
                          if (e.target) e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Community Name *</label>
                  <input
                    type="text"
                    value={createName}
                    onChange={e => setCreateName(e.target.value.slice(0, 50))}
                    placeholder="e.g. Delhi Board Game Nights"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-[var(--brand-green)] outline-none"
                  />
                  <span className="text-xs text-neutral-400">{createName.length}/50</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                  <textarea
                    value={createDesc}
                    onChange={e => setCreateDesc(e.target.value.slice(0, 500))}
                    placeholder="What is your community about?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-[var(--brand-green)] outline-none resize-none"
                  />
                  <span className="text-xs text-neutral-400">{createDesc.length}/500</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">City *</label>
                  <select
                    value={createCity}
                    onChange={e => setCreateCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm focus:ring-2 focus:ring-[var(--brand-green)] outline-none"
                  >
                    <option value="">Select a city</option>
                    {ALL_CITIES.sort().map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Tags <span className="text-neutral-400 font-normal">(comma separated)</span></label>
                  <input
                    type="text"
                    value={createTags}
                    onChange={e => setCreateTags(e.target.value)}
                    placeholder="e.g. board games, social, casual"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-[var(--brand-green)] outline-none"
                  />
                </div>

                <button
                  onClick={handleCreate}
                  disabled={!createName.trim() || !createCity || creating}
                  className="w-full bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-3 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Community'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
