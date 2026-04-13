"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Star, Users, Calendar, Share2, Bell, BellOff, Plus, X, Camera, Search, Edit3 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { api } from "@/lib/api/client";
import S3Image from "@/components/S3Image";
import ShareCommunityCard, { type ShareCommunityCardProps } from "@/components/ShareCommunityCard";
import { hapticLight, hapticMedium } from "@/lib/native/haptics";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const communityId = params.id as string;

  const [community, setCommunity] = useState<AnyObj | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'gallery' | 'reviews'>('upcoming');
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [reviews, setReviews] = useState<AnyObj[]>([]);
  const [showAddMod, setShowAddMod] = useState(false);
  const [modSearch, setModSearch] = useState('');
  const [modResults, setModResults] = useState<AnyObj[]>([]);
  const [coverUploading, setCoverUploading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const currentUserId = (user as AnyObj)?._id;

  useEffect(() => {
    setLoading(true);
    api.getCommunity(communityId).then((res: unknown) => {
      const data = (res as AnyObj)?.data?.community;
      setCommunity(data);
      if (data?.followers && currentUserId) {
        setFollowing(data.followers.some((f: string) => f === currentUserId || f === currentUserId?.toString()));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [communityId, currentUserId]);

  // Fetch reviews when tab switches
  useEffect(() => {
    if (activeTab === 'reviews' && communityId) {
      api.getCommunityReviews(communityId).then((res: unknown) => {
        setReviews((res as AnyObj)?.data?.reviews || []);
      }).catch(() => {});
    }
  }, [activeTab, communityId]);

  const handleFollow = async () => {
    if (!isLoggedIn) return;
    setFollowLoading(true);
    hapticMedium();
    try {
      const res = await api.followCommunity(communityId) as { data: { following: boolean; followerCount: number } };
      setFollowing(res.data.following);
      setCommunity(prev => prev ? { ...prev, followerCount: res.data.followerCount } : prev);
    } catch {
      // ignore
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = () => {
    hapticLight();
    setShowShare(true);
  };

  const isAdmin = community?.admin?._id === currentUserId;
  const isModerator = community?.moderators?.some((h: AnyObj) => h._id === currentUserId) || isAdmin;
  const [pendingPlans, setPendingPlans] = useState<AnyObj[]>([]);

  // Fetch pending plans for moderators
  useEffect(() => {
    if (isModerator && communityId) {
      api.getCommunityPendingPlans(communityId).then((res: unknown) => {
        setPendingPlans((res as AnyObj)?.data?.plans || []);
      }).catch(() => {});
    }
  }, [isModerator, communityId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--brand-green)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-neutral-700 mb-2">Community not found</h2>
          <button onClick={() => router.back()} className="text-[var(--brand-green)] font-medium">Go back</button>
        </div>
      </div>
    );
  }

  const upcomingPlans = community.upcomingPlans || [];
  const pastPlans = community.pastPlans || [];
  const hosts = [community.admin, ...(community.moderators || [])].filter(Boolean);

  // Compile all gallery photos from past plans
  const allGalleryPhotos: { photo: string; planName: string; planId: string }[] = [];
  for (const plan of pastPlans) {
    if (plan.gallery?.length > 0) {
      for (const photo of plan.gallery) {
        allGalleryPhotos.push({ photo, planName: plan.name, planId: plan._id });
      }
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="relative">
        {community.coverImage ? (
          <div className="h-48 relative overflow-hidden">
            <S3Image fileKey={community.coverImage} alt="" className="object-cover w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-[var(--brand-green)] to-green-700" />
        )}
        <button
          onClick={() => { if (window.history.length > 1) router.back(); else router.push('/app/communities'); }}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/90 shadow-sm z-10"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-700" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          {isAdmin && (
            <label className={`p-2 rounded-full bg-white/90 shadow-sm cursor-pointer ${coverUploading ? 'opacity-50' : ''}`}>
              <Camera className="w-5 h-5 text-neutral-700" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={coverUploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setCoverUploading(true);
                  try {
                    const key = await api.uploadToS3('community', file);
                    await api.updateCommunity(communityId, { coverImage: key });
                    const res = await api.getCommunity(communityId) as { data: { community: AnyObj } };
                    setCommunity(res.data.community);
                  } catch { alert('Upload failed'); }
                  finally { setCoverUploading(false); }
                  if (e.target) e.target.value = '';
                }}
              />
            </label>
          )}
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/90 shadow-sm"
          >
            <Share2 className="w-5 h-5 text-neutral-700" />
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 -mt-6 relative z-10 pb-24">
        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
          <h1 className="text-2xl font-bold text-neutral-800">{community.name}</h1>
          <div className="flex items-center gap-3 text-sm text-neutral-500 mt-2 flex-wrap">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{community.city}</span>
            {community.avgRating && (
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" />{community.avgRating} ({community.totalRatings})</span>
            )}
            <span>{community.planCount || 0} plans</span>
            <span>{community.totalParticipants || 0} people</span>
            <span>{community.followerCount || 0} followers</span>
          </div>

          {community.description && (
            <p className="text-sm text-neutral-600 mt-3 leading-relaxed">{community.description}</p>
          )}

          {/* Tags */}
          {community.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {community.tags.map((tag: string) => (
                <span key={tag} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full text-xs">{tag}</span>
              ))}
            </div>
          )}

          {/* Moderators */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Moderators</p>
              {isAdmin && (
                <button onClick={() => { setShowAddMod(!showAddMod); setModSearch(''); setModResults([]); }} className="text-xs text-[var(--brand-green)] font-semibold flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add
                </button>
              )}
            </div>

            {/* Add Moderator Search */}
            {showAddMod && isAdmin && (
              <div className="mb-3 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                  <input
                    type="text"
                    value={modSearch}
                    onChange={async (e) => {
                      setModSearch(e.target.value);
                      if (e.target.value.length >= 1) {
                        const res = await api.searchCommunityMembers(communityId, e.target.value) as { data: { users: AnyObj[] } };
                        setModResults(res.data.users || []);
                      } else {
                        // Show all members when empty
                        const res = await api.searchCommunityMembers(communityId) as { data: { users: AnyObj[] } };
                        setModResults(res.data.users || []);
                      }
                    }}
                    onFocus={async () => {
                      if (modResults.length === 0) {
                        const res = await api.searchCommunityMembers(communityId) as { data: { users: AnyObj[] } };
                        setModResults(res.data.users || []);
                      }
                    }}
                    placeholder="Search followers & participants..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-200 text-sm outline-none focus:ring-1 focus:ring-[var(--brand-green)]"
                  />
                </div>
                {modResults.length > 0 && (
                  <div className="mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {modResults.map((u: AnyObj) => (
                      <button
                        key={u._id}
                        onClick={async () => {
                          await api.addModerator(communityId, u._id);
                          setShowAddMod(false);
                          setModSearch('');
                          setModResults([]);
                          // Refresh
                          const res = await api.getCommunity(communityId) as { data: { community: AnyObj } };
                          setCommunity(res.data.community);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[var(--brand-green)]/5 text-left"
                      >
                        {u.image ? (
                          <S3Image fileKey={u.image} alt="" width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-500">{u.name?.charAt(0)?.toUpperCase()}</div>
                        )}
                        <span className="text-sm font-medium text-neutral-700">{u.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {hosts.map((host: AnyObj) => (
                <div key={host._id} className="flex items-center gap-2 rounded-lg px-2 py-1 -mx-2">
                  <Link href={`/app/profile/${host._id}`} className="flex items-center gap-2 hover:bg-neutral-50 transition-colors">
                    {host.image ? (
                      <S3Image fileKey={host.image} alt="" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[var(--brand-green)] flex items-center justify-center text-white text-xs font-bold">
                        {host.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <span className="text-sm font-medium text-neutral-700">{host.name}</span>
                  </Link>
                  {host._id === community.admin?._id ? (
                    <span className="text-[10px] bg-[var(--brand-green)]/10 text-[var(--brand-green)] px-1.5 py-0.5 rounded-full font-semibold">Admin</span>
                  ) : (
                    <>
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">Moderator</span>
                      {isAdmin && (
                        <button
                          onClick={async () => {
                            if (!confirm(`Remove ${host.name} as moderator?`)) return;
                            await api.removeModerator(communityId, host._id);
                            const res = await api.getCommunity(communityId) as { data: { community: AnyObj } };
                            setCommunity(res.data.community);
                          }}
                          className="p-0.5 rounded-full hover:bg-red-50 text-neutral-300 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            {isLoggedIn && !isAdmin && (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  following
                    ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    : 'bg-[var(--brand-green)] text-white hover:bg-[var(--brand-green-dark)]'
                }`}
              >
                {following ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                {following ? 'Following' : 'Follow'}
              </button>
            )}
            {isLoggedIn && (
              <Link href={`/app/create?communityId=${communityId}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--brand-green)] text-white font-semibold text-sm hover:bg-[var(--brand-green-dark)] transition-colors">
                <Calendar className="w-4 h-4" /> Host a Plan
              </Link>
            )}
            {isModerator && (
              <button
                onClick={() => {
                  setEditName(community.name || '');
                  setEditDesc(community.description || '');
                  setEditTags((community.tags || []).join(', '));
                  setShowEdit(true);
                }}
                className="px-3 py-2.5 rounded-xl bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Pending Plans (moderators only) */}
        {isModerator && pendingPlans.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
            <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4" /> Pending Approval ({pendingPlans.length})
            </h3>
            <div className="space-y-3">
              {pendingPlans.map((plan: AnyObj) => (
                <div key={plan._id} className="bg-white rounded-xl p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-800 truncate text-sm">{plan.name}</p>
                    <p className="text-xs text-neutral-500">
                      by {plan.creator_id?.name} · {new Date(plan.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      await api.approveCommunityPlan(communityId, plan._id);
                      setPendingPlans(prev => prev.filter(p => p._id !== plan._id));
                      // Refresh community data
                      api.getCommunity(communityId).then((res: unknown) => {
                        setCommunity((res as AnyObj)?.data?.community);
                      });
                    }}
                    className="px-3 py-1.5 bg-[var(--brand-green)] text-white rounded-lg text-xs font-semibold"
                  >
                    Approve
                  </button>
                  <button
                    onClick={async () => {
                      await api.rejectCommunityPlan(communityId, plan._id);
                      setPendingPlans(prev => prev.filter(p => p._id !== plan._id));
                    }}
                    className="px-3 py-1.5 bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold"
                  >
                    Reject
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
          {(['upcoming', 'past', 'gallery', 'reviews'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { hapticLight(); setActiveTab(tab); }}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-[var(--brand-green)] border-b-2 border-[var(--brand-green)]'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              {tab === 'upcoming' ? `Upcoming` : tab === 'past' ? `Past` : tab === 'gallery' ? `📸 ${allGalleryPhotos.length}` : `Reviews`}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'upcoming' && (
          upcomingPlans.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-neutral-200" />
              <p className="text-sm">No upcoming plans</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingPlans.map((plan: AnyObj) => (
                <PlanListItem key={plan._id} plan={plan} isPast={false} />
              ))}
            </div>
          )
        )}

        {activeTab === 'past' && (
          pastPlans.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <p className="text-sm">No past plans yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastPlans.map((plan: AnyObj) => (
                <PlanListItem key={plan._id} plan={plan} isPast={true} />
              ))}
            </div>
          )
        )}

        {activeTab === 'gallery' && (
          allGalleryPhotos.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <p className="text-sm">No photos yet</p>
              <p className="text-xs mt-1">Photos from plans will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {allGalleryPhotos.map((item, i) => (
                <Link key={`${item.planId}-${i}`} href={`/app/plan/${item.planId}`}>
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 group">
                    <S3Image fileKey={item.photo} alt="" className="object-cover w-full h-full" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-medium truncate">{item.planName}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {activeTab === 'reviews' && (
          reviews.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <Star className="w-12 h-12 mx-auto mb-3 text-neutral-200" />
              <p className="text-sm">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review: AnyObj) => (
                <div key={review._id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {review.user?.image ? (
                      <S3Image fileKey={review.user.image} alt="" width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500 text-xs font-bold">
                        {review.user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-neutral-700">{review.user?.name}</p>
                      <p className="text-xs text-neutral-400">{review.planName}</p>
                    </div>
                    <span className="text-sm text-amber-500">{'⭐'.repeat(review.score)}</span>
                  </div>
                  <p className="text-sm text-neutral-600">{review.review}</p>
                  <p className="text-xs text-neutral-400 mt-2">
                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )
        )}
      </main>

      {/* Edit Community Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowEdit(false)}>
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-800">Edit Community</h2>
              <button onClick={() => setShowEdit(false)} className="p-1 rounded-full hover:bg-neutral-100">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value.slice(0, 50))}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-[var(--brand-green)] outline-none"
                />
                <span className="text-xs text-neutral-400">{editName.length}/50</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value.slice(0, 500))}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-[var(--brand-green)] outline-none resize-none"
                />
                <span className="text-xs text-neutral-400">{editDesc.length}/500</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Tags <span className="text-neutral-400 font-normal">(comma separated)</span></label>
                <input
                  type="text"
                  value={editTags}
                  onChange={e => setEditTags(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-[var(--brand-green)] outline-none"
                />
              </div>
              <button
                onClick={async () => {
                  setEditSaving(true);
                  try {
                    await api.updateCommunity(communityId, {
                      name: editName.trim(),
                      description: editDesc.trim(),
                      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
                    });
                    const res = await api.getCommunity(communityId) as { data: { community: AnyObj } };
                    setCommunity(res.data.community);
                    setShowEdit(false);
                  } catch { alert('Failed to update'); }
                  finally { setEditSaving(false); }
                }}
                disabled={!editName.trim() || editSaving}
                className="w-full bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-3 rounded-2xl transition-colors disabled:opacity-50"
              >
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showShare && community && (
        <ShareCommunityCard community={community as ShareCommunityCardProps['community']} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}

function PlanListItem({ plan, isPast }: { plan: AnyObj; isPast: boolean }) {
  const dateStr = isPast
    ? new Date(plan.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date(plan.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Link href={`/app/plan/${plan._id}`}>
      <div className={`bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow ${!isPast ? 'border-l-4 border-[var(--brand-green)]' : ''}`}>
        <div className="flex items-center gap-3">
          {plan.pic_id ? (
            <S3Image fileKey={plan.pic_id} alt="" width={60} height={60} className="w-15 h-15 rounded-xl object-cover" />
          ) : (
            <div className="w-15 h-15 rounded-xl bg-[var(--brand-green)]/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[var(--brand-green)]/50" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-neutral-800 truncate">{plan.name}</p>
            <p className="text-sm text-neutral-500">
              {dateStr} · {plan.participants?.length || 0}/{plan.max_people} people
            </p>
            {isPast && plan.gallery?.length > 0 && (
              <p className="text-xs text-[var(--brand-green)] mt-0.5">📸 {plan.gallery.length} photos</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
