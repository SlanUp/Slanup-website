"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Clock, Users, Check, X, Send, MessageCircle, Instagram, CheckCircle, Pencil, Trash2, ArrowUpFromLine, LogIn, DoorOpen, ShieldCheck, Upload, ImageIcon, ArrowRightLeft, MessageSquareText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { api } from "@/lib/api/client";
import S3Image from "@/components/S3Image";
import SharePlanCard from "@/components/SharePlanCard";
import { PLAN_CITIES, PLAN_TAGS, REGION_GROUPS } from "@/lib/config/cities";


function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function toDateInputValue(d: string) {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function toTimeInputValue(d: string) {
  const date = new Date(d);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function Avatar({ image, name, size = 40 }: { image?: string; name?: string; size?: number }) {
  return (
    <div
      className="rounded-full bg-gradient-to-br from-[var(--brand-green)] to-green-600 flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {image ? (
        <S3Image fileKey={image} alt="" width={size} height={size} className="object-cover w-full h-full" />
      ) : (
        name?.charAt(0)?.toUpperCase() || "?"
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const planId = params.id as string;

  const [plan, setPlan] = useState<AnyObj | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [joinNote, setJoinNote] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [noteExpanded, setNoteExpanded] = useState<string | null>(null);
  const [requests, setRequests] = useState<AnyObj[]>([]);
  const [showRequests, setShowRequests] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', desc: '', city: '', startDate: '', startTime: '',
    endDate: '', endTime: '', max_people: 1, tags: [] as string[],
  });
  const [showShare, setShowShare] = useState(false);
  const [editCoverPreview, setEditCoverPreview] = useState("");
  const [editCoverKey, setEditCoverKey] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const editCoverRef = useRef<HTMLInputElement>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [leaveStep, setLeaveStep] = useState<'reason' | 'rate' | null>(null);
  const [leaveReason, setLeaveReason] = useState<'unavailable' | 'uncomfortable' | null>(null);
  const [flaggedUserIds, setFlaggedUserIds] = useState<string[]>([]);
  const [feltSafeIds, setFeltSafeIds] = useState<string[]>([]);
  const [originalSafeIds, setOriginalSafeIds] = useState<string[]>([]);
  const [feltSafeLoading, setFeltSafeLoading] = useState<string | null>(null);
  const [removingParticipant, setRemovingParticipant] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState<{ id: string; name: string } | null>(null);
  const [transferring, setTransferring] = useState(false);
  const [respondingTransfer, setRespondingTransfer] = useState(false);

  const userId = (user as AnyObj)?._id;
  const userGender = (user as AnyObj)?.gender;
  const isHost = plan?.host_id?._id === userId || (!plan?.host_id && plan?.creator_id?._id === userId);
  const isParticipant = plan?.participants?.some((p: AnyObj) => p._id === userId);
  const slotsLeft = plan ? plan.max_people - (plan.participants?.length || 0) : 0;
  const isPlanEnded = plan ? new Date(plan.end) < new Date() : false;
  const pendingTransfer = plan?.hostTransferRequest;
  const isTransferRecipient = pendingTransfer?.to?._id === userId || pendingTransfer?.to === userId;

  const fetchPlan = useCallback(async () => {
    try {
      setLoading(true);
      const res = (await api.getPlan(planId)) as { data: { plan: AnyObj; userRequestStatus?: string } };
      setPlan(res.data.plan);
      if (res.data.userRequestStatus) {
        setHasRequested(true);
      }
    } catch {
      // plan not found
    } finally {
      setLoading(false);
    }
  }, [planId]);

  const fetchRequests = useCallback(async () => {
    if (!isHost) return;
    try {
      const res = (await api.getPlanRequests(planId)) as { data: { requests: AnyObj[] } };
      setRequests(res.data.requests);
    } catch {
      // ignore
    }
  }, [planId, isHost]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  useEffect(() => {
    if (isHost) fetchRequests();
  }, [isHost, fetchRequests]);

  const handleJoinRequest = async () => {
    setRequesting(true);
    try {
      await api.requestJoin(planId, joinNote.trim() || undefined);
      setHasRequested(true);
    } catch {
      alert("Could not send request. You may have already requested.");
    } finally {
      setRequesting(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: "accepted" | "rejected") => {
    setActionLoading(requestId);
    try {
      await api.handleRequest(requestId, action);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      if (action === "accepted") fetchPlan();
    } catch {
      alert("Failed to process request");
    } finally {
      setActionLoading(null);
    }
  };

  const updateEditForm = (field: string, value: string | number | string[]) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const enterEditMode = () => {
    if (!plan) return;
    setEditForm({
      name: plan.name || '',
      desc: plan.desc || '',
      city: plan.city || '',
      startDate: toDateInputValue(plan.start),
      startTime: toTimeInputValue(plan.start),
      endDate: toDateInputValue(plan.end),
      endTime: toTimeInputValue(plan.end),
      max_people: plan.max_people || 1,
      tags: plan.tags || [],
    });
    setIsEditing(true);
    setEditCoverPreview("");
    setEditCoverKey("");
  };

  const handleEditCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditCoverPreview(URL.createObjectURL(file));
    setCoverUploading(true);
    try {
      const fileUrl = await api.uploadToS3("plan", file);
      setEditCoverKey(fileUrl);
    } catch {
      alert("Upload failed. Please try again.");
      setEditCoverPreview("");
    } finally {
      setCoverUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editForm.name.trim()) { alert('Plan name is required'); return; }
    const startDateTime = new Date(`${editForm.startDate}T${editForm.startTime}`);
    const endDateTime = new Date(`${editForm.endDate}T${editForm.endTime}`);
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      alert('Please fill in all date and time fields'); return;
    }
    if (endDateTime <= startDateTime) {
      alert('End date/time must be after start date/time'); return;
    }
    setSaving(true);
    try {
      const updateData: Record<string, unknown> = {
        name: editForm.name.trim(),
        desc: editForm.desc.trim(),
        city: editForm.city,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        max_people: editForm.max_people,
        tags: editForm.tags,
      };
      if (editCoverKey) updateData.pic_id = editCoverKey;
      await api.updatePlan(planId, updateData);
      await fetchPlan();
      setIsEditing(false);
    } catch {
      alert('Failed to update plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deletePlan(planId);
      router.push('/app/feed');
    } catch {
      alert('Failed to delete plan');
      setDeleting(false);
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    try {
      // Revoke ratings for users who were safe but now flagged/unmarked
      const toRevoke = originalSafeIds.filter(id => !feltSafeIds.includes(id));
      // Submit new safe ratings (not already in DB)
      const toSubmit = feltSafeIds.filter(id => !originalSafeIds.includes(id));
      await Promise.all([
        ...toRevoke.map(id => api.revokeFeltSafe(id).catch(() => {})),
        ...toSubmit.map(id => api.submitFeltSafe(planId, id).catch(() => {})),
        ...(flaggedUserIds.length > 0 ? [api.flagUsers(planId, flaggedUserIds, leaveReason || undefined, 'leave')] : []),
      ]);
      await api.leavePlan(planId);
      router.push('/app/feed');
    } catch {
      alert('Failed to leave plan');
      setLeaving(false);
    }
  };

  const toggleSafe = (uid: string) => {
    setFeltSafeIds(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]);
    setFlaggedUserIds(prev => prev.filter(id => id !== uid));
  };

  const toggleFlag = (uid: string) => {
    setFlaggedUserIds(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]);
    setFeltSafeIds(prev => prev.filter(id => id !== uid));
  };

  const handleFeltSafe = async (ratedUserId: string) => {
    setFeltSafeLoading(ratedUserId);
    try {
      const alreadyRated = feltSafeIds.includes(ratedUserId);
      if (alreadyRated) {
        await api.revokeFeltSafe(ratedUserId);
        setFeltSafeIds(prev => prev.filter(id => id !== ratedUserId));
        setOriginalSafeIds(prev => prev.filter(id => id !== ratedUserId));
      } else {
        // If was flagged, revoke flag first
        if (flaggedUserIds.includes(ratedUserId)) {
          await api.revokeFlag(ratedUserId);
          setFlaggedUserIds(prev => prev.filter(id => id !== ratedUserId));
        }
        await api.submitFeltSafe(planId, ratedUserId);
        setFeltSafeIds(prev => [...prev, ratedUserId]);
        setOriginalSafeIds(prev => [...prev, ratedUserId]);
      }
    } catch {
      alert('Failed to update rating');
    } finally {
      setFeltSafeLoading(null);
    }
  };

  const handleFlag = async (ratedUserId: string) => {
    const alreadyFlagged = flaggedUserIds.includes(ratedUserId);
    if (alreadyFlagged) {
      // Revoke flag
      try {
        await api.revokeFlag(ratedUserId);
        setFlaggedUserIds(prev => prev.filter(id => id !== ratedUserId));
      } catch {
        alert('Failed to revoke flag');
      }
      return;
    }
    // If was safe, revoke safe first
    if (feltSafeIds.includes(ratedUserId)) {
      try {
        await api.revokeFeltSafe(ratedUserId);
        setFeltSafeIds(prev => prev.filter(id => id !== ratedUserId));
        setOriginalSafeIds(prev => prev.filter(id => id !== ratedUserId));
      } catch { /* continue */ }
    }
    try {
      await api.flagUsers(planId, [ratedUserId], 'uncomfortable', 'post-plan');
      setFlaggedUserIds(prev => [...prev, ratedUserId]);
    } catch {
      alert('Failed to submit flag');
    }
  };

  const handleRemoveParticipant = async (participantId: string, participantName: string) => {
    setRemoveTarget({ id: participantId, name: participantName });
  };

  const confirmRemoveParticipant = async () => {
    if (!removeTarget) return;
    setRemovingParticipant(removeTarget.id);
    try {
      await api.removeParticipant(planId, removeTarget.id);
      setPlan((prev: AnyObj | null) => prev ? {
        ...prev,
        participants: prev.participants.filter((p: AnyObj) => p._id !== removeTarget.id),
      } : prev);
      setRemoveTarget(null);
    } catch {
      alert('Failed to remove participant');
    } finally {
      setRemovingParticipant(null);
    }
  };

  const handleTransferHost = async () => {
    if (!transferTarget) return;
    setTransferring(true);
    try {
      await api.transferHost(planId, transferTarget.id);
      await fetchPlan();
      setShowTransferModal(false);
      setTransferTarget(null);
    } catch (err: unknown) {
      alert((err as Error)?.message || 'Failed to transfer hostship');
    } finally {
      setTransferring(false);
    }
  };

  const handleAcceptTransfer = async () => {
    setRespondingTransfer(true);
    try {
      await api.acceptHostTransfer(planId);
      await fetchPlan();
    } catch (err: unknown) {
      alert((err as Error)?.message || 'Failed to accept transfer');
    } finally {
      setRespondingTransfer(false);
    }
  };

  const handleDeclineTransfer = async () => {
    setRespondingTransfer(true);
    try {
      await api.declineHostTransfer(planId);
      await fetchPlan();
    } catch (err: unknown) {
      alert((err as Error)?.message || 'Failed to decline transfer');
    } finally {
      setRespondingTransfer(false);
    }
  };

  // Fetch global felt-safe ratings and flags for current user
  useEffect(() => {
    if (isLoggedIn && userGender === 'female') {
      api.getMyFeltSafeRatings().then((res: unknown) => {
        const data = res as AnyObj;
        if (data?.data?.ratedUserIds) {
          setFeltSafeIds(data.data.ratedUserIds);
          setOriginalSafeIds(data.data.ratedUserIds);
        }
      }).catch(() => {});
      api.getMyFlags().then((res: unknown) => {
        const data = res as AnyObj;
        if (data?.data?.flaggedUserIds) {
          setFlaggedUserIds(data.data.flaggedUserIds);
        }
      }).catch(() => {});
    }
  }, [isLoggedIn, userGender]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--brand-green)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-4">
        <p className="text-neutral-500 text-lg">Plan not found</p>
        <Link href="/app/feed" className="text-[var(--brand-green)] font-semibold hover:underline">← Back to Feed</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Image */}
      <div className="relative w-full h-48 md:h-64 lg:h-80 bg-neutral-200">
        {plan.pic_id ? (
          <S3Image
            fileKey={plan.pic_id}
            alt={plan.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--brand-green)]/20 to-[var(--brand-green)]/5">
            <Calendar className="w-20 h-20 text-[var(--brand-green)]/30" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push('/app/feed');
            }
          }}
          className="absolute top-4 left-4 w-11 h-11 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md z-10"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-800" />
        </button>

        {/* Share button */}
      </div>

      <main className="max-w-2xl mx-auto px-4 -mt-12 relative z-10 pb-24 md:pb-32">
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          {isEditing ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-neutral-800">Edit Plan</h2>
                <button onClick={() => setIsEditing(false)} className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-neutral-500" />
                </button>
              </div>

              {/* Cover Photo */}
              <div>
                <label className="text-sm font-semibold text-neutral-700 block mb-1">Cover Photo</label>
                <div
                  onClick={() => !coverUploading && editCoverRef.current?.click()}
                  className="w-full h-36 rounded-xl border-2 border-dashed border-neutral-200 hover:border-[var(--brand-green)] bg-neutral-50 cursor-pointer flex items-center justify-center overflow-hidden transition-colors relative"
                >
                  {editCoverPreview ? (
                    <>
                      <Image src={editCoverPreview} alt="New cover" fill className="object-cover" />
                      {coverUploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      {!coverUploading && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setEditCoverPreview(""); setEditCoverKey(""); }}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  ) : plan.pic_id ? (
                    <div className="relative w-full h-full">
                      <S3Image fileKey={plan.pic_id} alt="Current cover" className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                        <ImageIcon className="w-5 h-5 text-white" />
                        <span className="text-white text-sm font-medium">Change cover photo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-neutral-400">
                      <Upload className="w-6 h-6" />
                      <span className="text-xs">Add a cover photo</span>
                    </div>
                  )}
                </div>
                <input ref={editCoverRef} type="file" accept="image/*" onChange={handleEditCoverUpload} className="hidden" />
              </div>

              <div>
                <label className="text-sm font-semibold text-neutral-700 block mb-1">Plan Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => updateEditForm('name', e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]/30 focus:border-[var(--brand-green)]"
                  placeholder="Plan name"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-neutral-700 block mb-1">Description</label>
                <textarea
                  value={editForm.desc}
                  onChange={e => updateEditForm('desc', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]/30 focus:border-[var(--brand-green)] resize-none"
                  placeholder="What's the plan about?"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-neutral-700 block mb-1">City</label>
                <select
                  value={editForm.city}
                  onChange={e => updateEditForm('city', e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]/30 focus:border-[var(--brand-green)]"
                >
                  <option value="">Select city</option>
                  {PLAN_CITIES.map(c => <option key={c} value={c}>{c}{REGION_GROUPS[c] ? ` (${REGION_GROUPS[c].join(', ')})` : ''}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-neutral-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={e => updateEditForm('startDate', e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]/30 focus:border-[var(--brand-green)]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700 block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editForm.startTime}
                    onChange={e => updateEditForm('startTime', e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]/30 focus:border-[var(--brand-green)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-neutral-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={e => updateEditForm('endDate', e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]/30 focus:border-[var(--brand-green)]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700 block mb-1">End Time</label>
                  <input
                    type="time"
                    value={editForm.endTime}
                    onChange={e => updateEditForm('endTime', e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]/30 focus:border-[var(--brand-green)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-neutral-700 block mb-1">Max People</label>
                <input
                  type="number"
                  min={1}
                  value={editForm.max_people}
                  onChange={e => updateEditForm('max_people', Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]/30 focus:border-[var(--brand-green)]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-neutral-700 block mb-2">Tags</label>
                {editForm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {editForm.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--brand-green)] text-white text-xs font-medium rounded-full">
                        {tag}
                        <button type="button" onClick={() => updateEditForm('tags', editForm.tags.filter(t => t !== tag))}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {PLAN_TAGS.filter(t => !editForm.tags.includes(t)).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => updateEditForm('tags', [...editForm.tags, tag])}
                      className="px-2.5 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-full hover:bg-neutral-200 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[var(--brand-green)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--brand-green-dark)] transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl font-bold text-neutral-800">{plan.name}</h1>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setShowShare(true)}
                    className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
                    title="Share plan"
                  >
                    <ArrowUpFromLine className="w-4 h-4 text-neutral-500" />
                  </button>
                  {isHost && (
                    <>
                      <button
                        onClick={enterEditMode}
                        className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
                        title="Edit plan"
                      >
                        <Pencil className="w-4 h-4 text-neutral-500" />
                      </button>
                      {!isPlanEnded && plan.participants?.length > 0 && (
                        <button
                          onClick={() => setShowTransferModal(true)}
                          className="w-8 h-8 rounded-full hover:bg-emerald-50 flex items-center justify-center transition-colors"
                          title="Transfer hostship"
                        >
                          <ArrowRightLeft className="w-4 h-4 text-neutral-500" />
                        </button>
                      )}
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"
                        title="Delete plan"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <div className="flex items-center gap-3 text-neutral-600">
                  <Calendar className="w-5 h-5 text-[var(--brand-green)]" />
                  <span className="text-sm">{formatDate(plan.start)}</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-600">
                  <Clock className="w-5 h-5 text-[var(--brand-green)]" />
                  <span className="text-sm">{formatTime(plan.start)} — {formatTime(plan.end)}</span>
                </div>
                {plan.venue_string && (
                  <div className="flex items-center gap-3 text-neutral-600">
                    <MapPin className="w-5 h-5 text-[var(--brand-green)]" />
                    <span className="text-sm">{plan.venue_string}</span>
                  </div>
                )}
                {plan.city && (
                  <div className="flex items-center gap-3 text-neutral-600">
                    <MapPin className="w-5 h-5 text-[var(--brand-green)]" />
                    <span className="text-sm font-medium">{plan.city}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-neutral-600">
                  <Users className="w-5 h-5 text-[var(--brand-green)]" />
                  <span className="text-sm">{plan.participants?.length || 0} / {plan.max_people} people</span>
                </div>
              </div>

              {plan.desc && (
                <div className="mt-5 pt-5 border-t border-neutral-100">
                  <h2 className="text-sm font-bold text-neutral-700 mb-2">About this plan</h2>
                  <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">{plan.desc}</p>
                </div>
              )}

              {plan.tags?.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-4">
                  {plan.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-[var(--brand-green)]/8 text-[var(--brand-green)] text-xs rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Host */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-5 mt-4"
        >
          <h2 className="text-sm font-bold text-neutral-700 mb-3">Hosted by</h2>
          <Link href={`/app/profile/${(plan.host_id?._id || plan.creator_id?._id)}`} className="flex items-center gap-3 hover:bg-neutral-50 -mx-2 px-2 py-2 rounded-xl transition-colors">
            <Avatar image={plan.host_id?.image || plan.creator_id?.image} name={plan.host_id?.name || plan.creator_id?.name} size={48} />
            <div>
              <p className="font-semibold text-neutral-800">{plan.host_id?.name || plan.creator_id?.name}</p>
              {(plan.host_id?.instagramHandle || plan.creator_id?.instagramHandle) && (
                <p className="text-xs text-neutral-500 flex items-center gap-1">
                  <Instagram className="w-3 h-3" /> @{plan.host_id?.instagramHandle || plan.creator_id?.instagramHandle}
                </p>
              )}
            </div>
          </Link>
        </motion.div>

        {/* Participants */}
        {plan.participants?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-5 mt-4"
          >
            <h2 className="text-sm font-bold text-neutral-700 mb-3">
              People going ({plan.participants.length})
            </h2>
            <div className="flex flex-col gap-2">
              {plan.participants.map((p: AnyObj) => (
                <div key={p._id} className="flex items-center justify-between">
                  <Link href={`/app/profile/${p._id}`} className="flex items-center gap-2 bg-neutral-50 rounded-full pr-3 hover:bg-neutral-100 transition-colors">
                    <Avatar image={p.image} name={p.name} size={32} />
                    <span className="text-sm text-neutral-700">{p.name}</span>
                  </Link>
                  {isPlanEnded && userGender === 'female' && p.gender === 'male' && p._id !== userId && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleFeltSafe(p._id)}
                        disabled={feltSafeLoading === p._id}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          feltSafeIds.includes(p._id)
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-neutral-100 text-neutral-500 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {feltSafeLoading === p._id ? '...' : feltSafeIds.includes(p._id) ? '✓ Safe' : 'Safe'}
                      </button>
                      <button
                        onClick={() => handleFlag(p._id)}
                        disabled={feltSafeLoading === p._id}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          flaggedUserIds.includes(p._id)
                            ? 'bg-red-100 text-red-700'
                            : 'bg-neutral-100 text-neutral-500 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        ⚠️ {flaggedUserIds.includes(p._id) ? 'Flagged' : 'Flag'}
                      </button>
                    </div>
                  )}
                  {isHost && !isPlanEnded && p._id !== (plan.host_id?._id || plan.creator_id?._id) && (
                    <button
                      onClick={() => handleRemoveParticipant(p._id, p.name)}
                      disabled={removingParticipant === p._id}
                      className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors disabled:opacity-50"
                      title={`Remove ${p.name}`}
                    >
                      <X className="w-4 h-4 text-neutral-300 hover:text-red-500 transition-colors" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isPlanEnded && userGender === 'female' && plan.participants.some((p: AnyObj) => p.gender === 'male' && p._id !== userId) && (
              <p className="text-[11px] text-neutral-400 mt-3">🛡️ Your ratings are 100% anonymous — help other women feel safe on Slanup</p>
            )}
          </motion.div>
        )}

        {/* Host Transfer Request Banner (for recipient) */}
        {isTransferRecipient && pendingTransfer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl shadow-lg p-5 mt-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightLeft className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-emerald-900">Hostship Transfer Request</h3>
            </div>
            <p className="text-sm text-emerald-800">
              <span className="font-semibold">{pendingTransfer.from?.name || 'The host'}</span> wants to transfer hostship of this plan to you.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleDeclineTransfer}
                disabled={respondingTransfer}
                className="flex-1 py-2.5 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-60"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptTransfer}
                disabled={respondingTransfer}
                className="flex-1 py-2.5 bg-[var(--brand-green)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--brand-green-dark)] transition-colors disabled:opacity-60"
              >
                {respondingTransfer ? 'Processing...' : 'Accept Hostship'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Host: Pending Transfer Indicator */}
        {isHost && pendingTransfer && !isTransferRecipient && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl shadow-lg p-5 mt-4"
          >
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
              <p className="text-sm text-emerald-800">
                Hostship transfer pending — waiting for <span className="font-semibold">{pendingTransfer.to?.name || 'participant'}</span> to respond
              </p>
            </div>
          </motion.div>
        )}

        {/* Host: Pending Requests */}
        {isHost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-5 mt-4"
          >
            <button
              onClick={() => setShowRequests(!showRequests)}
              className="flex items-center justify-between w-full"
            >
              <h2 className="text-sm font-bold text-neutral-700">
                Pending Requests {requests.length > 0 && <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{requests.length}</span>}
              </h2>
              <motion.span animate={{ rotate: showRequests ? 180 : 0 }} className="text-neutral-400">▼</motion.span>
            </button>

            <AnimatePresence>
              {showRequests && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {requests.length === 0 ? (
                    <p className="text-sm text-neutral-400 mt-3">No pending requests</p>
                  ) : (
                    <div className="flex flex-col gap-3 mt-3">
                      {requests.map((req) => (
                        <div key={req._id} className="bg-neutral-50 p-3 rounded-xl">
                          <div className="flex items-center justify-between">
                            <Link href={`/app/profile/${req.user_id?._id}`} className="flex items-center gap-3">
                              <Avatar image={req.user_id?.image} name={req.user_id?.name} size={40} />
                              <div>
                                <p className="font-semibold text-sm text-neutral-800">{req.user_id?.name}</p>
                                {req.user_id?.instagramHandle && (
                                  <p className="text-xs text-neutral-500">@{req.user_id.instagramHandle}</p>
                                )}
                              </div>
                            </Link>
                            <div className="flex items-center gap-1.5">
                              {req.note && (
                                <button
                                  onClick={() => setNoteExpanded(noteExpanded === req._id ? null : req._id)}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${noteExpanded === req._id ? 'bg-[var(--brand-green)]/10 text-[var(--brand-green)]' : 'hover:bg-neutral-100 text-neutral-400'}`}
                                  title="View note"
                                >
                                  <MessageSquareText className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleRequestAction(req._id, "accepted")}
                                disabled={actionLoading === req._id}
                                className="w-9 h-9 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRequestAction(req._id, "rejected")}
                                disabled={actionLoading === req._id}
                                className="w-9 h-9 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <AnimatePresence>
                            {noteExpanded === req._id && req.note && (
                              <motion.p
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="text-xs text-neutral-600 mt-2 ml-[52px] bg-white p-2.5 rounded-lg border border-neutral-100 leading-relaxed overflow-hidden"
                              >
                                &ldquo;{req.note}&rdquo;
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Bottom Action Bar */}
      {!isLoggedIn && slotsLeft > 0 && new Date(plan.end) > new Date() && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-4 z-50" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <div className="max-w-2xl mx-auto flex gap-3">
            <Link
              href="/app"
              className="flex-1 font-semibold py-3 md:py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2 bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white"
            >
              <LogIn className="w-5 h-5" /> Log in to Request
            </Link>
          </div>
        </div>
      )}

      {isLoggedIn && !isHost && !isParticipant && slotsLeft > 0 && new Date(plan.end) > new Date() && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-4 z-50" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <div className="max-w-2xl mx-auto flex gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              disabled={requesting || hasRequested}
              className={`flex-1 font-semibold py-3 md:py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2 ${
                hasRequested
                  ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                  : 'bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white disabled:opacity-60'
              }`}
            >
              {hasRequested ? (
                <><CheckCircle className="w-5 h-5" /> Requested</>
              ) : (
                <><Send className="w-5 h-5" /> Request to Join</>
              )}
            </button>
          </div>
        </div>
      )}

      {(isParticipant || isHost) && plan.conversation_id && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-4 z-50" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <div className="max-w-2xl mx-auto flex gap-3">
            {isParticipant && !isHost && !isPlanEnded && (
              <button
                onClick={() => { setShowLeaveModal(true); setLeaveStep(userGender === 'female' ? 'reason' : null); }}
                className="px-4 py-3 md:py-3.5 border-2 border-red-200 text-red-500 font-semibold rounded-2xl transition-colors hover:bg-red-50 flex items-center gap-2"
              >
                <DoorOpen className="w-5 h-5" />
              </button>
            )}
            <Link
              href={`/app/chat/${typeof plan.conversation_id === 'object' ? plan.conversation_id._id : plan.conversation_id}`}
              className="flex-1 bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-3 md:py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Open Group Chat
            </Link>
          </div>
        </div>
      )}

      {/* Share Card Modal */}
      {showShare && plan && (
        <SharePlanCard plan={plan as Parameters<typeof SharePlanCard>[0]['plan']} onClose={() => setShowShare(false)} />
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => !deleting && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
            >
              <h3 className="text-lg font-bold text-neutral-800">Delete Plan</h3>
              <p className="text-sm text-neutral-600 mt-2">
                Are you sure you want to delete <span className="font-semibold">{plan.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remove Participant Confirmation Modal */}
      <AnimatePresence>
        {removeTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => !removingParticipant && setRemoveTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
            >
              <h3 className="text-lg font-bold text-neutral-800">Remove Participant</h3>
              <p className="text-sm text-neutral-600 mt-2">
                Remove <span className="font-semibold">{removeTarget.name}</span> from this plan? They&apos;ll be removed from the group chat as well.
              </p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setRemoveTarget(null)}
                  disabled={!!removingParticipant}
                  className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveParticipant}
                  disabled={!!removingParticipant}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {removingParticipant ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Request Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center"
            onClick={() => !requesting && setShowJoinModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-6 w-full sm:max-w-sm sm:mx-4"
              style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
            >
              <h3 className="text-lg font-bold text-neutral-800">Request to Join</h3>
              <p className="text-sm text-neutral-500 mt-1">Add a short note for the host (optional)</p>
              <textarea
                value={joinNote}
                onChange={(e) => setJoinNote(e.target.value.slice(0, 200))}
                placeholder="Say hi! Why do you want to join?"
                rows={3}
                className="w-full mt-3 px-4 py-3 text-sm border border-neutral-200 rounded-xl resize-none focus:outline-none focus:border-[var(--brand-green)] transition-colors placeholder:text-neutral-400"
                autoFocus
              />
              <p className="text-[11px] text-neutral-400 text-right mt-1">{joinNote.length}/200</p>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => { setShowJoinModal(false); setJoinNote(""); }}
                  disabled={requesting}
                  className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => { await handleJoinRequest(); setShowJoinModal(false); }}
                  disabled={requesting}
                  className="flex-1 py-2.5 bg-[var(--brand-green)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--brand-green-dark)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {requesting ? 'Sending...' : <><Send className="w-4 h-4" /> Send Request</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transfer Hostship Modal */}
      <AnimatePresence>
        {showTransferModal && plan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => !transferring && (() => { setShowTransferModal(false); setTransferTarget(null); })()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
            >
              {!transferTarget ? (
                <>
                  <h3 className="text-lg font-bold text-neutral-800">Transfer Hostship</h3>
                  <p className="text-sm text-neutral-500 mt-1">Choose a participant to become the new host</p>
                  <div className="flex flex-col gap-2 mt-4 max-h-60 overflow-auto">
                    {plan.participants?.map((p: AnyObj) => (
                      <button
                        key={p._id}
                        onClick={() => setTransferTarget({ id: p._id, name: p.name })}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors text-left"
                      >
                        <Avatar image={p.image} name={p.name} size={36} />
                        <span className="text-sm font-medium text-neutral-700">{p.name}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowTransferModal(false)}
                    className="w-full mt-3 py-2.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-neutral-800">Confirm Transfer</h3>
                  <p className="text-sm text-neutral-600 mt-2">
                    Transfer hostship to <span className="font-semibold">{transferTarget.name}</span>? They&apos;ll receive a request to accept.
                  </p>
                  <p className="text-xs text-neutral-400 mt-1.5">
                    If they accept, you&apos;ll become a regular participant.
                  </p>
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => setTransferTarget(null)}
                      disabled={transferring}
                      className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-60"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleTransferHost}
                      disabled={transferring}
                      className="flex-1 py-2.5 bg-[var(--brand-green)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--brand-green-dark)] transition-colors disabled:opacity-60"
                    >
                      {transferring ? 'Sending...' : 'Transfer'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leave Plan Confirmation Modal */}
      <AnimatePresence>
        {showLeaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => !leaving && (() => { setShowLeaveModal(false); setLeaveStep(null); setLeaveReason(null); setFlaggedUserIds([]); })()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
            >
              {/* Step 1 for women: Why are you leaving? */}
              {userGender === 'female' && leaveStep === 'reason' && (
                <>
                  <h3 className="text-lg font-bold text-neutral-800">Why are you leaving?</h3>
                  <p className="text-xs text-neutral-400 mt-1">This helps us keep Slanup safe for everyone</p>
                  <div className="flex flex-col gap-2.5 mt-4">
                    <button
                      onClick={() => { setLeaveReason('unavailable'); setLeaveStep('rate'); }}
                      className="w-full text-left px-4 py-3 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      📅 Not available anymore
                    </button>
                    <button
                      onClick={() => { setLeaveReason('uncomfortable'); setLeaveStep('rate'); }}
                      className="w-full text-left px-4 py-3 border border-red-200 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      ⚠️ Someone made me uncomfortable
                    </button>
                  </div>
                  <button
                    onClick={() => { setShowLeaveModal(false); setLeaveStep(null); }}
                    className="w-full mt-3 py-2.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}

              {/* Step 2 for women: Rate male participants */}
              {userGender === 'female' && leaveStep === 'rate' && (() => {
                const creatorId = plan.creator_id?._id;
                const maleParticipants = (plan.participants || []).filter((p: AnyObj) => p.gender === 'male' && p._id !== userId && p._id !== creatorId);
                const hostIsMale = plan.creator_id?.gender === 'male' && creatorId !== userId;
                const allMales = hostIsMale ? [plan.creator_id, ...maleParticipants] : maleParticipants;
                return allMales.length > 0 ? (
                  <>
                    <h3 className="text-lg font-bold text-neutral-800">
                      {leaveReason === 'uncomfortable' ? 'Who made you uncomfortable?' : 'Before you go...'}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      {leaveReason === 'uncomfortable'
                        ? 'Flag anyone who misbehaved — this is 100% anonymous'
                        : 'Let others know who made you feel safe — 100% anonymous'}
                    </p>
                    <div className="flex flex-col gap-2 mt-4 max-h-60 overflow-auto">
                      {allMales.map((p: AnyObj) => (
                        <div key={p._id} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2">
                            <Avatar image={p.image} name={p.name} size={32} />
                            <span className="text-sm text-neutral-700">{p.name}</span>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => toggleSafe(p._id)}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                feltSafeIds.includes(p._id)
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-neutral-100 text-neutral-500 hover:bg-emerald-50 hover:text-emerald-600'
                              }`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {feltSafeIds.includes(p._id) ? '✓ Safe' : 'Safe'}
                            </button>
                            <button
                              onClick={() => toggleFlag(p._id)}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                flaggedUserIds.includes(p._id)
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-neutral-100 text-neutral-500 hover:bg-red-50 hover:text-red-600'
                              }`}
                            >
                              ⚠️ {flaggedUserIds.includes(p._id) ? 'Flagged' : 'Flag'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => setLeaveStep('reason')}
                        disabled={leaving}
                        className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleLeave}
                        disabled={leaving}
                        className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
                      >
                        {leaving ? 'Leaving...' : 'Leave Plan'}
                      </button>
                    </div>
                    <p className="text-[10px] text-neutral-400 text-center mt-2">Your ratings are completely anonymous</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-neutral-800">Leave Plan</h3>
                    <p className="text-sm text-neutral-600 mt-2">
                      Are you sure you want to leave <span className="font-semibold">{plan.name}</span>?
                    </p>
                    <div className="flex gap-3 mt-5">
                      <button onClick={() => { setShowLeaveModal(false); setLeaveStep(null); }} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors">Stay</button>
                      <button onClick={handleLeave} disabled={leaving} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60">{leaving ? 'Leaving...' : 'Leave Plan'}</button>
                    </div>
                  </>
                );
              })()}

              {/* Non-female users: simple confirmation */}
              {userGender !== 'female' && !leaveStep && (
                <>
                  <h3 className="text-lg font-bold text-neutral-800">Leave Plan</h3>
                  <p className="text-sm text-neutral-600 mt-2">
                    Are you sure you want to leave <span className="font-semibold">{plan.name}</span>? The host will be notified.
                  </p>
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => setShowLeaveModal(false)}
                      disabled={leaving}
                      className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-60"
                    >
                      Stay
                    </button>
                    <button
                      onClick={handleLeave}
                      disabled={leaving}
                      className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
                    >
                      {leaving ? 'Leaving...' : 'Leave Plan'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
